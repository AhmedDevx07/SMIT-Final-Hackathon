const AssetHistory = require('../models/AssetHistory');

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
  } catch (error) {
    console.error('Failed to log asset history:', error.message);
  }
};

module.exports = logHistory;