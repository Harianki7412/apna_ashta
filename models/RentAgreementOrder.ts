import mongoose, { Schema, models } from "mongoose";

const RentAgreementOrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  agreement: { type: Schema.Types.ObjectId, ref: "RentAgreement" },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "refunded", "failed"],
    default: "pending",
    index: true,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: { type: Date, default: Date.now },
});

export const RentAgreementOrder =
  models.RentAgreementOrder ||
  mongoose.model("RentAgreementOrder", RentAgreementOrderSchema);
