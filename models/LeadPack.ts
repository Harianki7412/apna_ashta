import mongoose, { Schema, models } from "mongoose";

const LeadPackSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  packId: { type: String, required: true },
  totalLeads: { type: Number, required: true },
  usedLeads: { type: Number, default: 0 },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "active", "expired"],
    default: "pending",
    index: true,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  expiresAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now },
});

LeadPackSchema.index({ user: 1, status: 1, expiresAt: 1 });

export const LeadPack =
  models.LeadPack || mongoose.model("LeadPack", LeadPackSchema);
