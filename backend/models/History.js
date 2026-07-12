import mongoose from "mongoose";

const { Schema } = mongoose;

const historySchema = new Schema(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Asset reference is required"],
    },
    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Actor reference is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const History = mongoose.models.History || mongoose.model("History", historySchema);

export default History;
