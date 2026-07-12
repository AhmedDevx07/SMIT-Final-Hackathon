import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Asset from "../models/Asset.js";
import History from "../models/History.js";
import Issue from "../models/Issue.js";
import User from "../models/User.js";
import MaintenanceRecord from "../models/MaintenanceRecord.js";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenerativeAI(apiKey);
};

const parseAiJson = (rawText) => {
  const cleanedText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleanedText);
};

const getFallbackTriage = (assetCategory) => ({
  title: "Reported Issue",
  category: assetCategory,
  priority: "Medium",
  possibleCauses: ["General wear and tear", "Component needs inspection"],
  initialChecks: [
    "Inspect the asset visually",
    "Verify power and connection status",
  ],
});

const runWithTimeout = async (promise, timeoutMs = 15000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI request timed out")), timeoutMs);
    }),
  ]);
};

const resolveActorId = async (req) => {
  if (req.user?._id) {
    return req.user._id;
  }

  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id");

      if (user) {
        return user._id;
      }
    } catch (error) {
      // Ignore token parsing failures here so public issue creation still works.
    }
  }

  const systemEmail = "public.reporter@system.local";
  let publicUser = await User.findOne({ email: systemEmail }).select("_id");

  if (!publicUser) {
    const hashedPassword = await bcrypt.hash("public-reporter", 10);

    try {
      publicUser = await User.create({
        name: "Public Reporter",
        email: systemEmail,
        password: hashedPassword,
        role: "Public",
      });
    } catch (error) {
      publicUser = await User.findOne({ email: systemEmail }).select("_id");
    }
  }

  return publicUser?._id || null;
};

const generateIssueNumber = async () => {
  let issueNumber;
  let existingIssue;

  do {
    issueNumber = `ISS-${Date.now().toString().slice(-6)}`;
    existingIssue = await Issue.findOne({ issueNumber });
  } while (existingIssue);

  return issueNumber;
};

// Valid status transitions: from -> to[]
const validStatusTransitions = {
  Reported: ["Assigned", "Closed"],
  Assigned: ["Inspection Started", "Closed"],
  "Inspection Started": [
    "Under Inspection",
    "Maintenance In Progress",
    "Waiting for Parts",
    "Resolved",
    "Closed",
  ],
  "Under Inspection": [
    "Maintenance In Progress",
    "Waiting for Parts",
    "Resolved",
    "Closed",
  ],
  "Maintenance In Progress": [
    "Under Maintenance",
    "Waiting for Parts",
    "Resolved",
    "Closed",
  ],
  "Under Maintenance": ["Waiting for Parts", "Resolved", "Closed"],
  "Waiting for Parts": ["Under Maintenance", "Resolved", "Closed"],
  Resolved: ["Closed", "Reopened"],
  Closed: ["Reopened"],
  Reopened: ["Assigned", "Closed"],
};

const isStatusTransitionValid = (from, to) => {
  if (!validStatusTransitions[from]) return false;
  return validStatusTransitions[from].includes(to);
};

const mapAssetStatus = (issueStatus) => {
  if (issueStatus === "Resolved" || issueStatus === "Closed") {
    return "Operational";
  }

  if (
    issueStatus === "Under Inspection" ||
    issueStatus === "Inspection Started"
  ) {
    return "Under Inspection";
  }

  if (
    issueStatus === "Under Maintenance" ||
    issueStatus === "Maintenance In Progress" ||
    issueStatus === "Waiting for Parts"
  ) {
    return "Under Maintenance";
  }

  return "Issue Reported";
};

const triageComplaint = async (req, res) => {
  try {
    const { assetCode, complaintText } = req.body;

    if (!assetCode || !complaintText) {
      return res.status(400).json({
        message: "Asset code and complaint text are required",
      });
    }

    const asset = await Asset.findOne({ assetCode });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const fallback = getFallbackTriage(asset.category);
    let triageResult = fallback;

    try {
      const genAI = getGeminiClient();

      if (!genAI) {
        throw new Error("Gemini API key is not configured");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Act as an expert maintenance AI. Analyze this user complaint: "${complaintText}" for the asset "${asset.name}" (${asset.category}) located at "${asset.location}". Return strictly a valid JSON object with the following fields: title (short summary), category (string), priority (Low, Medium, or High), possibleCauses (array of strings), initialChecks (array of strings). Do not include markdown code block wrapping, return raw JSON string.`;

      const result = await runWithTimeout(model.generateContent(prompt));
      const response = await result.response;
      const rawText = response.text();
      const parsed = parseAiJson(rawText);

      triageResult = {
        title: parsed.title || fallback.title,
        category: parsed.category || fallback.category,
        priority: ["Low", "Medium", "High"].includes(parsed.priority)
          ? parsed.priority
          : fallback.priority,
        possibleCauses: Array.isArray(parsed.possibleCauses)
          ? parsed.possibleCauses
          : fallback.possibleCauses,
        initialChecks: Array.isArray(parsed.initialChecks)
          ? parsed.initialChecks
          : fallback.initialChecks,
      };
    } catch (error) {
      triageResult = fallback;
    }

    return res.status(200).json(triageResult);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to triage complaint",
      error: error.message,
    });
  }
};

const createIssue = async (req, res) => {
  try {
    const {
      assetCode,
      title,
      description,
      priority,
      category,
      reporterName,
      reporterContact,
      evidenceUrls = [],
      isAiGenerated,
      possibleCauses = [],
      initialChecks = [],
    } = req.body;

    if (!assetCode || !title || !description || !priority || !category) {
      return res.status(400).json({
        message:
          "Asset code, title, description, priority, and category are required",
      });
    }

    const asset = await Asset.findOne({ assetCode });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const actorId = await resolveActorId(req);

    if (!actorId) {
      return res
        .status(500)
        .json({ message: "Unable to resolve history actor" });
    }

    const issueNumber = await generateIssueNumber();
    const aiNotes = [];

    if (Array.isArray(possibleCauses) && possibleCauses.length > 0) {
      aiNotes.push(`Possible Causes: ${possibleCauses.join(", ")}`);
    }

    if (Array.isArray(initialChecks) && initialChecks.length > 0) {
      aiNotes.push(`Initial Checks: ${initialChecks.join(", ")}`);
    }

    const issue = await Issue.create({
      issueNumber,
      asset: asset._id,
      title,
      description,
      priority,
      category,
      reporterName,
      reporterContact,
      evidenceUrls: Array.isArray(evidenceUrls)
        ? evidenceUrls
        : typeof evidenceUrls === "string"
          ? evidenceUrls
              .split(",")
              .map((u) => u.trim())
              .filter(Boolean)
          : [],
      status: "Reported",
      maintenanceNotes: aiNotes.join("\n"),
      isAiGenerated: Boolean(isAiGenerated),
    });

    asset.status = "Issue Reported";
    await asset.save();

    await History.create({
      asset: asset._id,
      issue: issue._id,
      action: "Issue Created",
      actor: actorId,
    });

    return res.status(201).json({
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create issue",
      error: error.message,
    });
  }
};

const assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTechnician } = req.body;

    if (!assignedTechnician) {
      return res
        .status(400)
        .json({ message: "Assigned technician is required" });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    const technician = await User.findById(assignedTechnician);

    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    if (technician.role !== "Technician") {
      return res
        .status(400)
        .json({ message: "Assigned user must be a technician" });
    }

    issue.assignedTechnician = assignedTechnician;
    issue.status = "Assigned";
    await issue.save();

    await History.create({
      asset: issue.asset,
      issue: issue._id,
      action: "Issue Assigned",
      actor: req.user._id,
    });

    return res.status(200).json({
      message: "Issue assigned successfully",
      issue,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to assign issue",
      error: error.message,
    });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      maintenanceNotes,
      cost,
      inspectionNotes,
      actionsPerformed,
      partsReplaced,
      evidenceUrls,
      completedAt,
      nextServiceDate,
    } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // If user is Technician, check they are assigned to this issue
    if (req.user.role === "Technician") {
      const assignedId = issue.assignedTechnician
        ? issue.assignedTechnician.toString()
        : null;
      const userId = req.user._id.toString();
      if (assignedId !== userId) {
        return res
          .status(403)
          .json({ message: "You can only update issues assigned to you" });
      }
    }

    // Validate status transition
    if (!isStatusTransitionValid(issue.status, status)) {
      return res.status(400).json({
        message: `Status transition from ${issue.status} to ${status} is not allowed`,
      });
    }

    // Check if maintenance record fields are present when resolving
    if (status === "Resolved") {
      if (!inspectionNotes?.trim() || !actionsPerformed?.trim()) {
        return res.status(400).json({
          message:
            "Inspection notes and actions performed are required to resolve an issue",
        });
      }
    }

    // Update issue fields
    issue.status = status;

    if (typeof maintenanceNotes === "string" && maintenanceNotes.trim()) {
      issue.maintenanceNotes = issue.maintenanceNotes
        ? `${issue.maintenanceNotes}\n${maintenanceNotes.trim()}`
        : maintenanceNotes.trim();
    }

    if (typeof cost === "number" && cost >= 0) {
      issue.cost += cost;
    }

    await issue.save();

    const asset = await Asset.findById(issue.asset);

    if (asset) {
      asset.status = mapAssetStatus(status);
      if (status === "Resolved") {
        const resolvedAt = completedAt ? new Date(completedAt) : new Date();
        asset.lastServiceDate = resolvedAt;

        // Validate nextServiceDate if provided
        if (nextServiceDate) {
          const nextDate = new Date(nextServiceDate);
          if (nextDate < resolvedAt) {
            return res.status(400).json({
              message:
                "Next service date cannot be before the maintenance completed date",
            });
          }
          asset.nextServiceDate = nextDate;
        }

        // Create maintenance record
        await MaintenanceRecord.create({
          issue: issue._id,
          asset: asset._id,
          technician: req.user._id,
          inspectionNotes: inspectionNotes || "",
          actionsPerformed: actionsPerformed || "",
          partsReplaced: Array.isArray(partsReplaced) ? partsReplaced : [],
          evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
          cost: cost || 0,
          completedAt: resolvedAt,
        });
      }
      await asset.save();
    }

    await History.create({
      asset: issue.asset,
      issue: issue._id,
      action: `Issue Status Updated: ${status}`,
      actor: req.user._id,
    });

    return res.status(200).json({
      message: "Issue status updated successfully",
      issue,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update issue status",
      error: error.message,
    });
  }
};

const getIssues = async (req, res) => {
  try {
    const { status, priority, category, technician, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (technician) filter.assignedTechnician = technician;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { issueNumber: { $regex: search, $options: "i" } },
      ];
    }

    const issues = await Issue.find(filter)
      .populate("asset", "assetCode name")
      .populate("assignedTechnician", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(issues);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const openIssues = await Issue.countDocuments({
      status: { $nin: ["Resolved", "Closed"] },
    });
    const resolvedIssues = await Issue.countDocuments({
      status: { $in: ["Resolved", "Closed"] },
    });
    const criticalIssues = await Issue.countDocuments({
      priority: "High",
      status: { $nin: ["Resolved", "Closed"] },
    });
    const unassignedTasks = await Issue.countDocuments({
      assignedTechnician: null,
    });

    return res.status(200).json({
      totalAssets,
      openIssues,
      resolvedIssues,
      criticalIssues,
      unassignedTasks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

export {
  triageComplaint,
  createIssue,
  assignIssue,
  updateIssueStatus,
  getIssues,
  getDashboardStats,
};
