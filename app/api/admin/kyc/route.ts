import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { notifyUser } from '@/lib/notify';
import { ok, fail, handleError } from '@/lib/api-helpers';

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === 'admin' ? s : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return fail('Forbidden', 403);
    await connectDB();
    const users = await User.find({ kycStatus: 'pending' })
      .select('name email phone kycDocument createdAt')
      .lean();
    return ok(users);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await requireAdmin())) return fail('Forbidden', 403);

    const { userId, status } = await req.json();
    if (!['verified', 'rejected'].includes(status)) return fail('Invalid status');

    await connectDB();
    await User.findByIdAndUpdate(userId, { kycStatus: status });

    await notifyUser(userId, {
      type: status === 'verified' ? 'kyc_verified' : 'kyc_rejected',
      title: status === 'verified' ? 'KYC verified ✅' : 'KYC rejected',
      body:
        status === 'verified'
          ? 'You now have a Verified badge.'
          : 'Please re-upload a clear document.',
      link: '/verify',
      email: true,
    });

    return ok({ updated: true });
  } catch (e) {
    return handleError(e);
  }
}