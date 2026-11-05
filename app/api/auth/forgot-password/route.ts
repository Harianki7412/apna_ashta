import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit, clientIP } from '@/lib/rate-limit';
import { forgotPasswordSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`fp:${clientIP(req)}`, 3, 60_000);
    if (!rl.allowed) return fail('Too many requests', 429);
    const { email: rawEmail } = forgotPasswordSchema.parse(await req.json());
    const email = rawEmail.toLowerCase();
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return ok({ message: 'If email exists, reset sent' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000);
    await user.save();
    try {
      await sendPasswordResetEmail(email, token);
    } catch (error) {
      console.error('[forgot-password] Reset email delivery failed', error);
    }
    return ok({ message: 'If email exists, reset sent' });
  } catch (e) {
    return handleError(e);
  }
}