import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendOtp } from '@/lib/msg91';
import { otpSendSchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const rl = rateLimit(`otp:${(session.user as any).id}`, 3, 300_000);
    if (!rl.allowed) return fail('Too many OTP requests. Try again in 5 minutes.', 429);

    const { phone } = otpSendSchema.parse(await req.json());
    const success = await sendOtp(phone);
    if (!success) return fail('Failed to send OTP', 500);
    return ok({ message: 'OTP sent' });
  } catch (e) {
    return handleError(e);
  }
}