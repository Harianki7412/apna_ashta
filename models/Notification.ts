import mongoose, { Schema, models } from 'mongoose';

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['message', 'property_approved', 'property_rejected', 'new_listing', 'system', 'kyc_verified', 'kyc_rejected'],
    required: true,
  },
  title: { type: String, required: true },
  body: String,
  link: String,
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = models.Notification || mongoose.model('Notification', NotificationSchema);