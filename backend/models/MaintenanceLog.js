const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    findings: {
      type: String,
      required: true,
    },
    actionTaken: {
      type: String,
      required: true,
    },
    partsReplaced: [String],
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalCondition: {
      type: String,
      default: 'Good',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);