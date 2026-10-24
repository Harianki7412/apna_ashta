import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    await connectDB();
    const me = (session.user as any).id;
    const [items, unread] = await Promise.all([
      Notification.find({ user: me }).sort({ createdAt: -1 }).limit(30).lean(),
      Notification.countDocuments({ user: me, read: false }),
    ]);
    return ok({ items, unread });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    await connectDB();
    await Notification.updateMany(
      { user: (session.user as any).id, read: false },
      { read: true }
    );
    return ok({ marked: true });
  } catch (e) {
    return handleError(e);
  }
}