const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      default: "Good",
    },
    status: {
      type: String,
      enum: [
        "Operational",
        "Issue Reported",
        "Under Inspection",
        "Under Maintenance",
        "Out of Service",
        "Retired",
      ],
      default: "Operational",
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastServiceDate: {
      type: Date,
      default: null,
    },

    qrCodeUrl: {
      type: String,
      default: "",
    },
    publicUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Asset", assetSchema);
