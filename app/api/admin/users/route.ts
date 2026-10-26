import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { ok, fail, handleError } from '@/lib/api-helpers';

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === 'admin' ? s : null;
}

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return fail('Forbidden', 403);

    const sp = new URL(req.url).searchParams;
    const q = sp.get('q');
    const role = sp.get('role');
    const page = Math.max(1, Number(sp.get('page') || 1));
    const limit = 20;

    const query: any = {};
    if (role) query.role = role;
    if (q) {
      query.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') },
      ];
    }

    await connectDB();
    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email phone role blocked kycStatus createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);
    return ok({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) return fail('Forbidden', 403);

    const { userId, action, role, reason } = await req.json();

    if (userId === (adminSession.user as any).id) {
      return fail('Cannot modify yourself');
    }

    await connectDB();

    if (action === 'block') {
      await User.findByIdAndUpdate(
        userId,
        { blocked: true, blockedReason: reason || 'Violation' },
        { returnDocument: 'after' }
      );
    } else if (action === 'unblock') {
      await User.findByIdAndUpdate(
        userId,
        { blocked: false, blockedReason: null },
        { returnDocument: 'after' }
      );
    } else if (action === 'change-role' && ['owner', 'tenant', 'admin'].includes(role)) {
      await User.findByIdAndUpdate(
        userId,
        { role },
        { returnDocument: 'after' }
      );
    } else if (action === 'delete') {
      await User.findByIdAndDelete(userId);
    } else {
      return fail('Invalid action');
    }

    return ok({ updated: true });
  } catch (e) {
    return handleError(e);
  }
}