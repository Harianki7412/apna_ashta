import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, index: true },
  phoneVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['owner', 'tenant', 'admin'], default: 'tenant', index: true },
  blocked: { type: Boolean, default: false },
  blockedReason: String,
  kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
  kycDocument: String,
  resetToken: { type: String, select: false },
  resetTokenExpiry: { type: Date, select: false },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || mongoose.model('User', UserSchema);