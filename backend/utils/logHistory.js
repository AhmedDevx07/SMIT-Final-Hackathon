const AssetHistory = require('../models/AssetHistory');
const Asset = require('../models/Asset');

// Central helper: every important workflow event should call this
const logHistory = async ({ assetId, issueId = null, actorId = null, actorName = 'System', action, details = '' }) => {
  try {
    await AssetHistory.create({
      asset: assetId,
      issue: issueId,
      actor: actorId,
      actorName,
      action,
      details,
    });
    // Automatically update lastServiceDate whenever there is recent activity
    await Asset.findByIdAndUpdate(assetId, { lastServiceDate: new Date() });
  } catch (error) {
    console.error('Failed to log asset history:', error.message);
  }
};

module.exports = logHistory;