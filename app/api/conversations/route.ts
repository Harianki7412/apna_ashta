import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    await connectDB();
    const convos = await Conversation.find({ participants: (session.user as any).id })
      .populate('participants', 'name email')
      .populate('property', 'title images')
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean();
    return ok(convos);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const { otherUserId, propertyId } = await req.json();
    const me = (session.user as any).id;
    if (!otherUserId || otherUserId === me) return fail('Invalid recipient');
    await connectDB();
    const filter: any = { participants: { $all: [me, otherUserId] } };
    if (propertyId) filter.property = propertyId;
    let convo = await Conversation.findOne(filter);
    if (!convo) convo = await Conversation.create({ participants: [me, otherUserId], property: propertyId || undefined, messages: [] });
    return ok(convo);
  } catch (e) {
    return handleError(e);
  }
}