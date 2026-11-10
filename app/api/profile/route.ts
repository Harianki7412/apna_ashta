import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { State } from '@/models/State';
import { Property } from '@/models/Property';
import { Conversation } from '@/models/Conversation';
import { Favorite } from '@/models/Favorite';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { Types } from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    await connectDB();
    const user = await User.findById(session.user.id)
      .select(
        '-password -resetToken -resetTokenExpiry -kycDocument -kycDocumentFront -kycDocumentBack'
      )
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
    const { name, phone, state } = await req.json();
    if (name !== undefined && (typeof name !== 'string' || name.length < 2)) return fail('Name too short');
    if (phone !== undefined && phone !== '' && !/^\d{10}$/.test(phone)) return fail('Invalid phone');
    if (state !== undefined && typeof state !== 'string') return fail('Invalid state');
    if (state && !Types.ObjectId.isValid(state)) return fail('Invalid state');
    await connectDB();
    if (state) {
      const stateExists = await State.exists({ _id: state, active: true });
      if (!stateExists) return fail('Invalid state');
    }
    const update: { name?: string; phone?: string; state?: string } = {};
    if (name) update.name = name;
    if (phone !== undefined) update.phone = phone || undefined;
    if (state !== undefined) update.state = state;
    const user = await User.findByIdAndUpdate(
  session.user.id,
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
    const me = session.user.id;
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