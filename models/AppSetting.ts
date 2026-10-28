import mongoose, { Schema, models } from "mongoose";

const AppSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: String,
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const AppSetting =
  models.AppSetting || mongoose.model("AppSetting", AppSettingSchema);
