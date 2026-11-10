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
    name: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    district: { type: String, trim: true, default: "" },
    state: { type: String, default: "Madhya Pradesh" },
    stateName: { type: String, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    description: String,
    areas: [AreaSchema],
    active: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isOwnerAdded: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

CitySchema.index({ active: 1, displayOrder: 1 });
CitySchema.index({ state: 1, district: 1, name: 1 });

export const City = models.City || mongoose.model("City", CitySchema);
