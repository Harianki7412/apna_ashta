import mongoose, { Schema, models } from 'mongoose';

const ReviewSchema = new Schema({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.index({ property: 1, author: 1 }, { unique: true });

export const Review = models.Review || mongoose.model('Review', ReviewSchema);