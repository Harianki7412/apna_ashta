import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyOtp } from '@/lib/msg91';
import { otpVerifySchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { phone, otp } = otpVerifySchema.parse(await req.json());
    const valid = await verifyOtp(phone, otp);
    if (!valid) return fail('Invalid OTP');

    await connectDB();
    await User.findByIdAndUpdate((session.user as any).id, { phone, phoneVerified: true });
    return ok({ message: 'Phone verified' });
  } catch (e) {
    return handleError(e);
  }
}