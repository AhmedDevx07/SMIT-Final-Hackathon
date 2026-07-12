const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    issueNumber: {
      type: String,
      required: true,
      unique: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: [
        "Reported",
        "Assigned",
        "Inspection Started",
        "Maintenance In Progress",
        "Waiting for Parts",
        "Resolved",
        "Closed",
        "Reopened",
      ],
      default: "Reported",
    },
    reporterName: {
      type: String,
      default: "Anonymous",
    },
    reporterContact: {
      type: String,
      default: "",
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    aiSuggestion: {
      suggestedTitle: String,
      suggestedCategory: String,
      suggestedPriority: String,
      possibleCauses: [String],
      initialChecks: [String],
      wasEdited: {
        type: Boolean,
        default: false,
      },
    },
    evidenceUrls: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Issue", issueSchema);
