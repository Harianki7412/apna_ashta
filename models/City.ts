import mongoose, { Schema, models } from "mongoose";

const AreaSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    type: {
      type: String,
      enum: ["area", "colony", "locality", "landmark"],
      default: "area",
    },
    description: String,
    lat: Number,
    lng: Number,
    active: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true },
);

const CitySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    state: { type: String, default: "Madhya Pradesh" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: String,
    areas: [AreaSchema],
    active: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

CitySchema.index({ active: 1, displayOrder: 1 });

export const City = models.City || mongoose.model("City", CitySchema);
