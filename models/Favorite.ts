import mongoose, { Schema, models } from 'mongoose';

const FavoriteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  createdAt: { type: Date, default: Date.now },
});

FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favorite = models.Favorite || mongoose.model('Favorite', FavoriteSchema);