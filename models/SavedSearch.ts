import mongoose, { Schema, models } from 'mongoose';

const SavedSearchSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: String,
  filters: {
    area: String,
    type: String,
    min: Number,
    max: Number,
    q: String,
  },
  notifyOnNew: { type: Boolean, default: true },
  lastNotifiedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

export const SavedSearch =
  models.SavedSearch || mongoose.model('SavedSearch', SavedSearchSchema);