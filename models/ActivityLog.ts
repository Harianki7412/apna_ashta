import mongoose, { Schema, models } from "mongoose";

const ActivityLogSchema = new Schema({
  actor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: [
      "approve",
      "reject",
      "delete",
      "role_change",
      "refund",
      "block",
      "unblock",
      "kyc_verify",
      "kyc_reject",
      "settings_update",
      "plan_create",
      "plan_update",
      "plan_delete",
      "bulk_approve",
      "bulk_reject",
      "bulk_delete",
    ],
    required: true,
    index: true,
  },
  targetType: {
    type: String,
    enum: ["property", "user", "agreement", "payment", "plan", "setting"],
    required: true,
  },
  targetId: { type: Schema.Types.ObjectId, index: true },
  targetLabel: String,
  metadata: { type: Schema.Types.Mixed },
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }, // ✅ index: true removed
});

// ─── Compound indexes for common queries ───
ActivityLogSchema.index({ actor: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

// ─── TTL: Auto-delete logs after 1 year ───
ActivityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 },
);

export const ActivityLog =
  models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
