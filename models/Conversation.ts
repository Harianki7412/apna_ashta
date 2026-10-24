import mongoose, { Schema, models } from 'mongoose';

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  messages: [MessageSchema],
  lastMessageAt: { type: Date, default: Date.now, index: true },
});

export const Conversation =
  models.Conversation || mongoose.model('Conversation', ConversationSchema);