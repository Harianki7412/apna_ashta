import mongoose, { Schema, models } from "mongoose";

const SubscriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  planId: { type: String, enum: ["pro", "business"], required: true },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    default: "monthly",
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "active", "expired", "cancelled", "failed"],
    default: "pending",
    index: true,
  },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: String,
  startDate: Date,
  expiresAt: { type: Date, index: true },
  autoRenew: { type: Boolean, default: false },
  cancelledAt: Date,
  cancelReason: String,
  createdAt: { type: Date, default: Date.now },
});

SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 },
); // TTL after 90 days

export const Subscription =
  models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
