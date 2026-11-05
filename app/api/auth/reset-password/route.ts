import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { resetPasswordSchema } from '@/lib/validators';
import { clientIP, rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`password-reset:${clientIP(req)}`, 5, 15 * 60_000);
    if (!rl.allowed) return fail('Too many requests. Try again later.', 429);

    const { token, password } = resetPasswordSchema.parse(await req.json());
    await connectDB();
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    }).select('+resetToken +resetTokenExpiry');
    if (!user) return fail('Invalid or expired token');
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return ok({ message: 'Password updated' });
  } catch (e) {
    return handleError(e);
  }
}