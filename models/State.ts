import mongoose, { Schema, models } from "mongoose";

const StateSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    code: { type: String, maxlength: 5 }, // e.g. "MP", "MH"
    lat: Number,
    lng: Number,
    active: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

StateSchema.index({ active: 1, displayOrder: 1 });

export const State = models.State || mongoose.model("State", StateSchema);
