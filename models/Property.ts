import mongoose, { Schema, models } from 'mongoose';

const PropertySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  propertyType: { type: String, enum: ['Room', 'Home', 'Flat'], required: true },
  rent: { type: Number, required: true, index: true },
  deposit: { type: Number, default: 0 },
  area: { type: String, required: true, index: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  images: [{ type: String }],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'rented'],
    default: 'pending',
    index: true,
  },
  featured: { type: Boolean, default: false },
  featuredUntil: Date,
  createdAt: { type: Date, default: Date.now },
});

PropertySchema.index({ location: '2dsphere' });
PropertySchema.index({ title: 'text', description: 'text', area: 'text' });
PropertySchema.index({ status: 1, featured: -1, createdAt: -1 });

export const Property = models.Property || mongoose.model('Property', PropertySchema);