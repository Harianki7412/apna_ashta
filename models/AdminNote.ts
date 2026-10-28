import mongoose, { Schema, models } from "mongoose";

const AdminNoteSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  targetType: {
    type: String,
    enum: ["user", "property", "agreement"],
    required: true,
    index: true,
  },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  content: { type: String, required: true, maxlength: 2000 },
  important: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

AdminNoteSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const AdminNote =
  models.AdminNote || mongoose.model("AdminNote", AdminNoteSchema);
