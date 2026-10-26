import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Property } from '@/models/Property';
import { Conversation } from '@/models/Conversation';
import { Favorite } from '@/models/Favorite';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    await connectDB();
    const user = await User.findById((session.user as any).id)
      .select('-password -resetToken -resetTokenExpiry -kycDocument')
      .lean();
    if (!user) return fail('Not found', 404);
    return ok(user);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const { name, phone } = await req.json();
    if (name !== undefined && (typeof name !== 'string' || name.length < 2)) return fail('Name too short');
    if (phone !== undefined && phone !== '' && !/^\d{10}$/.test(phone)) return fail('Invalid phone');
    await connectDB();
    const update: any = {};
    if (name) update.name = name;
    if (phone !== undefined) update.phone = phone || undefined;
    const user = await User.findByIdAndUpdate(
  (session.user as any).id,
  update,
  { returnDocument: 'after', select: '-password -resetToken -resetTokenExpiry' }
);
    return ok(user);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const me = (session.user as any).id;
    await connectDB();
    await Promise.all([
      Property.deleteMany({ owner: me }),
      Conversation.deleteMany({ participants: me }),
      Favorite.deleteMany({ user: me }),
      User.findByIdAndDelete(me),
    ]);
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}