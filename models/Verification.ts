import mongoose, { Schema, models } from 'mongoose';

const VerificationSchema = new Schema({
  identifier: { type: String, required: true, index: true }, // email or phone
  method: { type: String, enum: ['email', 'phone'], required: true },
  otpHash: String, // only for email (phone OTP handled by MSG91)
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

VerificationSchema.index({ identifier: 1, method: 1 }, { unique: true });
VerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto TTL

export const Verification =
  models.Verification || mongoose.model('Verification', VerificationSchema);