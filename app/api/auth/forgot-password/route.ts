import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit, clientIP } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`fp:${clientIP(req)}`, 3, 60_000);
    if (!rl.allowed) return fail('Too many requests', 429);
    const { email } = await req.json();
    if (!email) return fail('Email required');
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return ok({ message: 'If email exists, reset sent' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();
    await sendPasswordResetEmail(email, token).catch(console.error);
    return ok({ message: 'Reset link sent' });
  } catch (e) {
    return handleError(e);
  }
}