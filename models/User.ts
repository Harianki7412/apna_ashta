import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    lowercase: true,
    index: true,
    sparse: true,
    unique: true,
  },
  phone: { type: String, index: true, sparse: true, unique: true },
  password: { type: String, required: true, select: false },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["owner", "tenant", "admin"],
    default: "tenant",
    index: true,
  },
  blocked: { type: Boolean, default: false },
  blockedReason: String,
  kycStatus: {
    type: String,
    enum: ["none", "pending", "verified", "rejected"],
    default: "none",
  },
  kycDocument: String,

  // ✅ NEW: Subscription
  subscription: {
    planId: { type: String, default: "free" },
    expiresAt: Date,
    autoRenew: { type: Boolean, default: false },
  },

  // ✅ NEW: Lead pack tracking (denormalized)
  activeLeadPack: {
    packId: String,
    remainingLeads: { type: Number, default: 0 },
    expiresAt: Date,
  },

  resetToken: { type: String, select: false },
  resetTokenExpiry: { type: Date, select: false },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || mongoose.model("User", UserSchema);
