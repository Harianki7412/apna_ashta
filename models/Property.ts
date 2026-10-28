import mongoose, { Schema, models } from "mongoose";

const PropertySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  propertyType: {
    type: String,
    enum: [
      "Room",
      "Flat",
      "Builder Floor",
      "Independent House",
      "Villa",
      "Row House",
      "Studio",
      "Penthouse",
      "Duplex",
      "Home",
    ],
    required: true,
  },
  bhk: {
    type: String,
    enum: [
      "1RK",
      "1BHK",
      "1.5BHK",
      "2BHK",
      "2.5BHK",
      "3BHK",
      "3.5BHK",
      "4BHK",
      "4+BHK",
    ],
    default: undefined,
    index: true,
  },
  furnishing: {
    type: String,
    enum: ["Furnished", "Semi-furnished", "Unfurnished"],
    default: "Unfurnished",
    index: true,
  },
  bathrooms: { type: Number, default: 1, min: 1, max: 10 },
  parking: {
    type: String,
    enum: ["None", "Bike", "Car", "Both"],
    default: "None",
  },
  preferredTenants: {
    type: [String],
    enum: ["Family", "Bachelors", "Students", "Company"],
    default: ["Family"],
  },
  amenities: { type: [String], default: [] },
  availableFrom: { type: Date, default: Date.now },
  rent: { type: Number, required: true, index: true },
  deposit: { type: Number, default: 0 },
  maintenanceCharge: { type: Number, default: 0 },
  city: {
    type: String,
    enum: ["Ashta", "Kothri", "Sehore"],
    required: true,
    default: "Ashta",
    index: true,
  },
  area: { type: String, required: true, index: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  images: [{ type: String }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "rented"],
    default: "pending",
    index: true,
  },
  // Lead tracking
  inquiryCount: { type: Number, default: 0 },
  freeLeadsUsed: { type: Number, default: 0 },
  paidLeadsUsed: { type: Number, default: 0 },

  featured: { type: Boolean, default: false },
  featuredUntil: Date,
  views: { type: Number, default: 0 },
  previousRent: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

PropertySchema.index({ location: "2dsphere" });
PropertySchema.index({ title: "text", description: "text", area: "text" });
PropertySchema.index({ status: 1, featured: -1, createdAt: -1 });
PropertySchema.index({ city: 1, status: 1, createdAt: -1 });
PropertySchema.index({ propertyType: 1, bhk: 1, status: 1 });

export const Property =
  models.Property || mongoose.model("Property", PropertySchema);
