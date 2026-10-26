import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════
// Register ALL models before any populate operation
// This prevents "MissingSchemaError" in production builds
// ═══════════════════════════════════════════════════════════
import '@/models/User';
import '@/models/Property';
import '@/models/Conversation';
import '@/models/Notification';
import '@/models/Favorite';
import '@/models/SavedSearch';
import '@/models/Review';
import '@/models/Verification';
import '@/models/RentAgreement';

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error('MONGODB_URI missing');

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }
  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}