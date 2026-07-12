const Issue = require('../models/Issue');
const Asset = require('../models/Asset');
const generateIssueNumber = require('../utils/generateIssueNumber');
const logHistory = require('../utils/logHistory');

// Valid forward transitions for the issue state machine (Reopened can branch back in)
const VALID_ISSUE_TRANSITIONS = {
  Reported: ['Assigned'],
  Assigned: ['Inspection Started'],
  'Inspection Started': ['Maintenance In Progress', 'Waiting for Parts'],
  'Maintenance In Progress': ['Waiting for Parts', 'Resolved'],
  'Waiting for Parts': ['Maintenance In Progress'],
  Resolved: ['Closed', 'Reopened'],
  Closed: ['Reopened'],
  Reopened: ['Assigned', 'Inspection Started'],
};

// Maps issue status changes to the asset status they should trigger
const ASSET_STATUS_MAP = {
  Reported: 'Issue Reported',
  'Inspection Started': 'Under Inspection',
  'Maintenance In Progress': 'Under Maintenance',
  Resolved: 'Operational',
};

// @desc    Report a new issue against an asset (PUBLIC — no auth required)
// @route   POST /api/issues/public
const reportIssuePublic = async (req, res) => {
  try {
    const { assetCode, title, description, priority, category, reporterName, reporterContact, aiSuggestion } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Please describe the issue' });
    }

    const asset = await Asset.findOne({ assetCode });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status === 'Retired') {
      return res.status(400).json({ message: 'This asset is retired and cannot receive new issue reports' });
    }

    const issueNumber = await generateIssueNumber();

    const issue = await Issue.create({
      issueNumber,
      asset: asset._id,
      title: title || 'Untitled Issue',
      description,
      category: category || 'General',
      priority: priority || 'Medium',
      reporterName: reporterName || 'Anonymous',
      reporterContact: reporterContact || '',
      aiSuggestion: aiSuggestion || undefined,
      status: 'Reported',
    });

    // Business rule: new issue submitted -> asset becomes "Issue Reported"
    asset.status = 'Issue Reported';
    await asset.save();

    await logHistory({
      assetId: asset._id,
      issueId: issue._id,
      actorName: reporterName || 'Public Reporter',
      action: 'Issue Reported',
      details: `Issue ${issue.issueNumber}: "${issue.title}" was reported.`,
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues (internal dashboard, with filters)
// @route   GET /api/issues
const getIssues = async (req, res) => {
  try {
    const { status, priority, assignedTechnician, assetId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTechnician) query.assignedTechnician = assignedTechnician;
    if (assetId) query.asset = assetId;

    const issues = await Issue.find(query)
      .populate('asset', 'name assetCode location')
      .populate('assignedTechnician', 'name email')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('asset')
      .populate('assignedTechnician', 'name email');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign an issue to a technician (Admin only)
// @route   PUT /api/issues/:id/assign
const assignIssue = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (!VALID_ISSUE_TRANSITIONS[issue.status]?.includes('Assigned') && issue.status !== 'Reported' && issue.status !== 'Reopened') {
      return res.status(400).json({ message: `Cannot assign an issue with status "${issue.status}"` });
    }

    issue.assignedTechnician = technicianId;
    issue.status = 'Assigned';
    await issue.save();

    await logHistory({
      assetId: issue.asset,
      issueId: issue._id,
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Issue Assigned',
      details: `Issue ${issue.issueNumber} was assigned to a technician.`,
    });

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue status (technician workflow, enforces state machine)
// @route   PUT /api/issues/:id/status
const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // A technician may update only an issue assigned to them
    if (
      req.user.role === 'technician' &&
      issue.assignedTechnician &&
      issue.assignedTechnician.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You can only update issues assigned to you' });
    }

    // A closed issue may not be edited until reopened
    if (issue.status === 'Closed' && status !== 'Reopened') {
      return res.status(400).json({ message: 'Closed issues cannot be edited unless reopened' });
    }

    // Enforce the state machine — no invalid jumps
    const allowedNext = VALID_ISSUE_TRANSITIONS[issue.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Invalid transition: "${issue.status}" cannot move to "${status}". Allowed: ${allowedNext.join(', ') || 'none'}`,
      });
    }

    // Business rule: an issue should not be resolved without a maintenance note existing
    if (status === 'Resolved') {
      const MaintenanceLog = require('../models/MaintenanceLog');
      const hasLog = await MaintenanceLog.findOne({ issue: issue._id });
      if (!hasLog) {
        return res.status(400).json({ message: 'Cannot resolve an issue without a maintenance note. Please add one first.' });
      }
    }

    issue.status = status;
    await issue.save();

    // Cascade the corresponding asset status if mapped
    if (ASSET_STATUS_MAP[status]) {
      const asset = await Asset.findById(issue.asset);
      if (asset && asset.status !== 'Retired') {
        asset.status = ASSET_STATUS_MAP[status];
        await asset.save();
      }
    }

    await logHistory({
      assetId: issue.asset,
      issueId: issue._id,
      actorId: req.user._id,
      actorName: req.user.name,
      action: `Issue Status Changed to "${status}"`,
      details: `Issue ${issue.issueNumber} moved to ${status}.`,
    });

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark an asset critically unsafe -> Out of Service (Admin/Technician)
// @route   PUT /api/issues/:id/mark-critical
const markCritical = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.priority = 'Critical';
    await issue.save();

    const asset = await Asset.findById(issue.asset);
    if (asset) {
      asset.status = 'Out of Service';
      await asset.save();
    }

    await logHistory({
      assetId: issue.asset,
      issueId: issue._id,
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Marked Critical — Asset Out of Service',
      details: `Issue ${issue.issueNumber} was flagged as a critical safety issue.`,
    });

    res.json({ issue, asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check public status of a reported issue (PUBLIC, safe fields only)
// @route   GET /api/issues/public/:issueNumber
const trackPublicIssue = async (req, res) => {
  try {
    const issue = await Issue.findOne({ issueNumber: req.params.issueNumber }).populate('asset', 'name assetCode');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json({
      issueNumber: issue.issueNumber,
      title: issue.title,
      status: issue.status,
      priority: issue.priority,
      asset: issue.asset,
      createdAt: issue.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  reportIssuePublic,
  getIssues,
  getIssueById,
  assignIssue,
  updateIssueStatus,
  markCritical,
  trackPublicIssue,
};
