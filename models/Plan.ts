import mongoose, { Schema, models } from "mongoose";

const PlanSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["subscription", "lead_pack", "featured"],
      required: true,
      index: true,
    },
    planId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    yearlyPrice: Number,
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "one-time"],
      default: "one-time",
    },

    // Common
    icon: { type: String, default: "🎁" },
    color: { type: String, default: "brand" },
    recommended: { type: Boolean, default: false },
    badge: String,
    features: [String],

    // Subscription-specific
    listingLimit: { type: Number, default: 2 },
    photosPerListing: { type: Number, default: 5 },
    leadsPerProperty: { type: Number, default: 10 },
    isFree: { type: Boolean, default: false },

    // Lead pack-specific
    leadsIncluded: Number,
    validityDays: Number,

    // Featured-specific
    featuredDays: Number,
    featuredTier: { type: String, enum: ["basic", "premium", "elite"] },

    // Meta
    active: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    hidden: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

PlanSchema.index({ type: 1, active: 1, displayOrder: 1 });

export const Plan = models.Plan || mongoose.model("Plan", PlanSchema);
