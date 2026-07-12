const MaintenanceLog = require('../models/MaintenanceLog');
const Issue = require('../models/Issue');
const Asset = require('../models/Asset');
const logHistory = require('../utils/logHistory');

// @desc    Add a maintenance record to an issue
// @route   POST /api/maintenance
const createMaintenanceLog = async (req, res) => {
  try {
    const { issueId, findings, actionTaken, partsReplaced, cost, finalCondition } = req.body;

    if (!issueId || !findings || !actionTaken) {
      return res.status(400).json({ message: 'issueId, findings, and actionTaken are required' });
    }

    // Business rule: cost cannot be negative
    if (cost !== undefined && cost < 0) {
      return res.status(400).json({ message: 'Maintenance cost cannot be negative' });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const log = await MaintenanceLog.create({
      issue: issue._id,
      asset: issue.asset,
      technician: req.user._id,
      findings,
      actionTaken,
      partsReplaced: partsReplaced || [],
      cost: cost || 0,
      finalCondition: finalCondition || 'Good',
    });

    // Update asset's displayed condition to reflect the latest maintenance finding
    const asset = await Asset.findById(issue.asset);
    if (asset) {
      asset.condition = finalCondition || asset.condition;
      await asset.save();
    }

    await logHistory({
      assetId: issue.asset,
      issueId: issue._id,
      actorId: req.user._id,
      actorName: req.user.name,
      action: 'Maintenance Recorded',
      details: `${actionTaken}${partsReplaced?.length ? ` | Parts: ${partsReplaced.join(', ')}` : ''}`,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all maintenance logs for an issue
// @route   GET /api/maintenance/issue/:issueId
const getLogsByIssue = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find({ issue: req.params.issueId })
      .populate('technician', 'name email')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all maintenance logs for an asset (full service history)
// @route   GET /api/maintenance/asset/:assetId
const getLogsByAsset = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find({ asset: req.params.assetId })
      .populate('technician', 'name email')
      .populate('issue', 'issueNumber title')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createMaintenanceLog, getLogsByIssue, getLogsByAsset };