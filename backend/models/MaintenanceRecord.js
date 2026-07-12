import mongoose from "mongoose";

const { Schema } = mongoose;

const maintenanceRecordSchema = new Schema(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: [true, "Issue reference is required"],
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Asset reference is required"],
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Technician reference is required"],
    },
    inspectionNotes: {
      type: String,
      trim: true,
      default: "",
    },
    actionsPerformed: {
      type: String,
      trim: true,
      default: "",
    },
    partsReplaced: {
      type: [String],
      default: [],
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "Cost cannot be negative"],
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MaintenanceRecord = mongoose.models.MaintenanceRecord || mongoose.model("MaintenanceRecord", maintenanceRecordSchema);

export default MaintenanceRecord;
