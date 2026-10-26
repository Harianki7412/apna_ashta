import mongoose, { Schema, models } from 'mongoose';

const SavedSearchSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    filters: {
      city: { type: String, default: '' },
      area: { type: String, default: '' },
      type: { type: String, default: '' },
      bhk: { type: String, default: '' },
      min: { type: String, default: '' },
      max: { type: String, default: '' },
      q: { type: String, default: '' },
      sort: { type: String, default: 'newest' },
    },
    notifyOnNew: { type: Boolean, default: true },
    lastNotifiedAt: { type: Date },
  },
  { timestamps: true }
);

SavedSearchSchema.index({ user: 1, createdAt: -1 });

export const SavedSearch =
  models.SavedSearch || mongoose.model('SavedSearch', SavedSearchSchema);