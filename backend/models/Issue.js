import mongoose from "mongoose";

const { Schema } = mongoose;

const issueSchema = new Schema(
  {
    issueNumber: {
      type: String,
      required: [true, "Issue number is required"],
      unique: true,
      trim: true,
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Asset reference is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: ["Low", "Medium", "High"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    reporterName: {
      type: String,
      trim: true,
    },
    reporterContact: {
      type: String,
      trim: true,
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "Reported",
        "Assigned",
        "Inspection Started",
        "Under Inspection",
        "Maintenance In Progress",
        "Under Maintenance",
        "Waiting for Parts",
        "Resolved",
        "Closed",
        "Reopened",
      ],
      default: "Reported",
    },
    assignedTechnician: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    maintenanceNotes: {
      type: String,
      trim: true,
      default: "",
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);

export default Issue;
