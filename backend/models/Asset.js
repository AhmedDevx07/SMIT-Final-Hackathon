import mongoose from "mongoose";

const { Schema } = mongoose;

const assetSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Asset name is required"],
      trim: true,
    },
    assetCode: {
      type: String,
      required: [true, "Asset code is required"],
      unique: true,
      trim: true,
    },
    publicSlug: {
      type: String,
      required: [true, "Public slug is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      trim: true,
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
    qrCodeUrl: {
      type: String,
      required: [true, "QR code URL is required"],
      trim: true,
    },
    lastServiceDate: {
      type: Date,
    },
    nextServiceDate: {
      type: Date,
      validate: {
        validator(value) {
          if (!value || !this.lastServiceDate) {
            return true;
          }

          return value >= this.lastServiceDate;
        },
        message: "Next service date must be on or after last service date",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.models.Asset || mongoose.model("Asset", assetSchema);

export default Asset;
