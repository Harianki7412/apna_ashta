import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Verification } from '@/models/Verification';
import { User } from '@/models/User';
import { verifyOtp } from '@/lib/msg91';
import { otpVerifySchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const { identifier, method, otp } = otpVerifySchema.parse(await req.json());

    const rl = rateLimit(`otpv:${identifier}`, 5, 300_000);
    if (!rl.allowed) return fail('Too many attempts. Try in 5 min.', 429);

    await connectDB();
    const rec = await Verification.findOne({ identifier, method });
    if (!rec) return fail('Request OTP first', 400);
    if (rec.expiresAt < new Date()) return fail('OTP expired. Request a new one.', 400);
    if (rec.attempts >= 5) return fail('Too many attempts. Request a new OTP.', 429);

    rec.attempts += 1;
    await rec.save();

    let valid = false;

    if (method === 'phone') {
      valid = await verifyOtp(identifier, otp);
    } else {
      if (!rec.otpHash) return fail('Invalid verification state', 400);
      valid = await bcrypt.compare(otp, rec.otpHash);
    }

    if (!valid) return fail('Invalid OTP', 400);

    rec.verified = true;
    rec.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await rec.save();

    const session = await getServerSession(authOptions);
    if (session) {
      const update =
        method === 'phone'
          ? { phone: identifier, phoneVerified: true }
          : { email: identifier.toLowerCase(), emailVerified: true };
      await User.findByIdAndUpdate((session.user as any).id, update);
    }

    return ok({ verified: true, method });
  } catch (e) {
    return handleError(e);
  }
}