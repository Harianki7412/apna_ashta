import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { Verification } from '@/models/Verification';
import { sendOtp } from '@/lib/msg91';
import { sendOtpEmail } from '@/lib/email';
import { otpSendSchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit, clientIP } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const { identifier, method } = otpSendSchema.parse(await req.json());

    const ipRl = rateLimit(`otp-ip:${clientIP(req)}`, 5, 300_000);
    if (!ipRl.allowed) return fail('Too many requests from this IP', 429);

    const idRl = rateLimit(`otp-id:${identifier}`, 3, 600_000);
    if (!idRl.allowed) return fail('Too many OTPs sent. Try in 10 min.', 429);

    await connectDB();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (method === 'phone') {
      await Verification.findOneAndUpdate(
        { identifier, method },
        { identifier, method, otpHash: null, verified: false, attempts: 0, expiresAt },
        { upsert: true, returnDocument: 'after' }  // ✅ Fixed
      );

      const success = await sendOtp(identifier);
      if (!success) return fail('Failed to send SMS OTP', 500);
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await bcrypt.hash(otp, 8);

      await Verification.findOneAndUpdate(
        { identifier, method },
        { identifier, method, otpHash, verified: false, attempts: 0, expiresAt },
        { upsert: true, returnDocument: 'after' }  // ✅ Fixed
      );

      try {
        await sendOtpEmail(identifier, otp);
      } catch (e) {
        console.error('[email otp]', e);
        return fail('Failed to send email OTP', 500);
      }
    }

    return ok({ message: `OTP sent to ${method}`, method });
  } catch (e) {
    return handleError(e);
  }
}