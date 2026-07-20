const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const generateAssetCode = require('../utils/generateAssetCode');
const generateQRCode = require('../utils/qrGenerator');
const logHistory = require('../utils/logHistory');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// @desc    Create a new asset (Admin only)
// @route   POST /api/assets
const createAsset = async (req, res) => {
  try {
    const { name, category, location, condition, lastServiceDate } = req.body;

    if (!name || !category || !location) {
      return res.status(400).json({ message: 'Name, category, and location are required' });
    }

    const assetCode = await generateAssetCode();
    const publicUrl = `${CLIENT_URL}/asset/${assetCode}`;
    const qrCodeUrl = await generateQRCode(publicUrl);

    const asset = await Asset.create({
      assetCode,
      name,
      category,
      location,
      condition: condition || 'Good',
      lastServiceDate: lastServiceDate || null,
      qrCodeUrl,
      publicUrl,
    });

    await logHistory({
      assetId: asset._id,
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Asset Registered',
      details: `Asset "${asset.name}" (${asset.assetCode}) was registered.`,
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assets (with search/filter)
// @route   GET /api/assets
const getAssets = async (req, res) => {
  try {
    const { search, status, category, location } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };

    const assets = await Asset.find(query)
      .populate('assignedTechnician', 'name email')
      .sort({ createdAt: -1 });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single asset by ID (internal, authenticated)
// @route   GET /api/assets/:id
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('assignedTechnician', 'name email');
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get PUBLIC asset info by assetCode — NO auth, safe fields only
// @route   GET /api/assets/public/:assetCode
const getPublicAsset = async (req, res) => {
  try {
    const asset = await Asset.findOne({ assetCode: req.params.assetCode });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found. Please check the QR code or link.' });
    }

    // Only safe, public-facing fields — never expose internal notes, costs, or user data
    const safeAsset = {
      assetCode: asset.assetCode,
      name: asset.name,
      category: asset.category,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      lastServiceDate: asset.lastServiceDate,
      isRetired: asset.status === 'Retired',
    };

    const recentHistory = await AssetHistory.find({ asset: asset._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('action createdAt');

    res.json({ asset: safeAsset, recentActivity: recentHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update asset details (Admin only) — QR mapping must stay intact
// @route   PUT /api/assets/:id
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const { name, category, location, condition, assignedTechnician, lastServiceDate } = req.body;

    if (name) asset.name = name;
    if (category) asset.category = category;
    if (location) asset.location = location;
    if (condition) asset.condition = condition;
    if (assignedTechnician !== undefined) asset.assignedTechnician = assignedTechnician;
    if (lastServiceDate) asset.lastServiceDate = lastServiceDate;

    // assetCode, qrCodeUrl, publicUrl are NEVER touched here — QR mapping stays intact permanently

    await asset.save();

    await logHistory({
      assetId: asset._id,
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Asset Updated',
      details: `Asset details were edited.`,
    });

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Retire an asset permanently
// @route   PUT /api/assets/:id/retire
const retireAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    asset.status = 'Retired';
    await asset.save();

    await logHistory({
      assetId: asset._id,
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Asset Retired',
      details: `Asset was permanently retired from service.`,
    });

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an asset permanently
// @route   DELETE /api/assets/:id
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    await AssetHistory.deleteMany({ asset: asset._id });
    await asset.deleteOne();

    res.json({ message: 'Asset removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full asset history timeline
// @route   GET /api/assets/:id/history
const getAssetHistory = async (req, res) => {
  try {
    const history = await AssetHistory.find({ asset: req.params.id })
      .populate('issue', 'issueNumber title')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all asset history timeline globally
// @route   GET /api/assets/history/all
const getAllAssetHistory = async (req, res) => {
  try {
    const history = await AssetHistory.find()
      .populate('asset', 'name assetCode')
      .populate('issue', 'issueNumber title')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all asset history for the logged-in technician
// @route   GET /api/assets/history/me
const getTechnicianHistory = async (req, res) => {
  try {
    const history = await AssetHistory.find({ actor: req.user._id })
      .populate('asset', 'name assetCode')
      .populate('issue', 'issueNumber title')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  getPublicAsset,
  updateAsset,
  retireAsset,
  deleteAsset,
  getAssetHistory,
  getAllAssetHistory,
  getTechnicianHistory,
};