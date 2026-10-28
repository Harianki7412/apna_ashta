import mongoose, { Schema, models } from "mongoose";

const ReportSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: "Property",
    required: true,
    index: true,
  },
  reporter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  reason: {
    type: String,
    enum: [
      "fake_listing",
      "wrong_info",
      "already_rented",
      "spam",
      "scam",
      "inappropriate",
      "other",
    ],
    required: true,
  },
  description: { type: String, maxlength: 500 },
  status: {
    type: String,
    enum: ["pending", "investigating", "resolved", "dismissed"],
    default: "pending",
    index: true,
  },
  adminNote: String,
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now, index: true },
});

ReportSchema.index({ property: 1, reporter: 1 }, { unique: true }); // 1 report per user per property
ReportSchema.index({ status: 1, createdAt: -1 });

export const Report = models.Report || mongoose.model("Report", ReportSchema);
