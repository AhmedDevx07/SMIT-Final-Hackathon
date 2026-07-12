import QRCode from "qrcode";
import Asset from "../models/Asset.js";
import History from "../models/History.js";
import MaintenanceRecord from "../models/MaintenanceRecord.js";

const generateAssetCode = async () => {
  let assetCode;
  let existingAsset;

  do {
    assetCode = `AST-${Date.now().toString().slice(-6)}`;
    existingAsset = await Asset.findOne({ assetCode });
  } while (existingAsset);

  return assetCode;
};

const createAsset = async (req, res) => {
  try {
    const {
      name,
      category,
      location,
      condition,
      status,
      lastServiceDate,
      nextServiceDate,
    } = req.body;

    if (!name || !category || !location || !condition) {
      return res.status(400).json({
        message: "Name, category, location, and condition are required",
      });
    }

    if (!process.env.FRONTEND_URL) {
      return res
        .status(500)
        .json({ message: "Frontend URL is not configured" });
    }

    const assetCode = await generateAssetCode();
    const publicUrl = `${process.env.FRONTEND_URL}/asset/${assetCode}`;
    const qrCodeUrl = await QRCode.toDataURL(publicUrl);

    const asset = await Asset.create({
      name,
      assetCode,
      publicSlug: assetCode,
      category,
      location,
      condition,
      status,
      qrCodeUrl,
      lastServiceDate,
      nextServiceDate,
    });

    await History.create({
      asset: asset._id,
      action: "Asset Registered",
      actor: req.user._id,
    });

    return res.status(201).json({
      message: "Asset created successfully",
      asset,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create asset",
      error: error.message,
    });
  }
};

const getAssets = async (req, res) => {
  try {
    const { status, category, location, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { assetCode: { $regex: search, $options: "i" } },
      ];
    }
    const assets = await Asset.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assets",
      error: error.message,
    });
  }
};

const getPublicAsset = async (req, res) => {
  try {
    const { assetCode } = req.params;
    // Use Mongoose projection to only select safe fields
    const asset = await Asset.findOne({ assetCode }).select(
      "name assetCode publicSlug category location condition status lastServiceDate nextServiceDate qrCodeUrl createdAt updatedAt _id",
    );

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Fetch safe history entries (no actor details, no sensitive issue fields)
    const safeHistory = await History.find({ asset: asset._id })
      .select("-actor -__v")
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "issue",
        select: "issueNumber title status", // Explicitly exclude maintenanceNotes, cost, etc.
      });

    // Fetch safe maintenance records
    const safeMaintenanceRecords = await MaintenanceRecord.find({
      asset: asset._id,
    })
      .select("-technician -__v -cost")
      .sort({ completedAt: -1 })
      .limit(10)
      .populate({
        path: "issue",
        select: "issueNumber title status",
      });

    return res.status(200).json({
      asset,
      history: safeHistory,
      maintenanceRecords: safeMaintenanceRecords,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch asset",
      error: error.message,
    });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      location,
      condition,
      status,
      lastServiceDate,
      nextServiceDate,
    } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const updatedData = {
      name,
      category,
      location,
      condition,
      status,
      lastServiceDate,
      nextServiceDate,
    };
    // Remove undefined fields
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key],
    );

    const updatedAsset = await Asset.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    await History.create({
      asset: updatedAsset._id,
      action: "Asset Updated",
      actor: req.user._id,
    });

    return res.status(200).json({
      message: "Asset updated successfully",
      asset: updatedAsset,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update asset",
      error: error.message,
    });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    await Asset.findByIdAndDelete(id);
    // Delete related history and issues? Or keep them for audit? Let's keep them for audit.

    await History.create({
      asset: asset._id,
      action: "Asset Deleted",
      actor: req.user._id,
    });

    return res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete asset",
      error: error.message,
    });
  }
};

const getAssetHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await History.find({ asset: id })
      .populate("actor", "name email")
      .populate("issue", "issueNumber")
      .sort({ createdAt: -1 });
    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch asset history",
      error: error.message,
    });
  }
};

const getMaintenanceRecords = async (req, res) => {
  try {
    const { id } = req.params;
    const records = await MaintenanceRecord.find({ asset: id })
      .populate("technician", "name email")
      .populate("issue", "issueNumber title")
      .sort({ completedAt: -1 });
    return res.status(200).json(records);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch maintenance records",
      error: error.message,
    });
  }
};

export {
  createAsset,
  getAssets,
  getPublicAsset,
  updateAsset,
  deleteAsset,
  getAssetHistory,
  getMaintenanceRecords,
};
