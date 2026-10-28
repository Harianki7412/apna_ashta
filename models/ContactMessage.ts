import mongoose, { Schema, models } from "mongoose";

const ContactMessageSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, maxlength: 120 },
  phone: { type: String, maxlength: 15 },
  subject: { type: String, default: "General Inquiry", maxlength: 100 },
  message: { type: String, required: true, maxlength: 1000 },
  status: {
    type: String,
    enum: ["new", "read", "replied", "closed"],
    default: "new",
    index: true,
  },
  adminReply: String,
  repliedAt: Date,
  createdAt: { type: Date, default: Date.now, index: true },
});

ContactMessageSchema.index({ status: 1, createdAt: -1 });

export const ContactMessage =
  models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);
