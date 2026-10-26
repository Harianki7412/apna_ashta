import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { notifyUser } from '@/lib/notify';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const conversationId = new URL(req.url).searchParams.get('conversationId');
    if (!conversationId) return fail('conversationId required');
    await connectDB();
    const convo = await Conversation.findById(conversationId).populate('messages.sender', 'name').lean();
    if (!convo) return fail('Not found', 404);
    const me = (session.user as any).id;
    if (!convo.participants.some((p: any) => p.toString() === me)) return fail('Forbidden', 403);
    return ok(convo.messages);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const me = (session.user as any).id;
    const rl = rateLimit(`msg:${me}`, 30, 60_000);
    if (!rl.allowed) return fail('Slow down', 429);

    const { conversationId, text, imageUrl } = await req.json();
    if (!conversationId) return fail('conversationId required');
    const trimmed = (text || '').trim();
    if (!trimmed && !imageUrl) return fail('Message cannot be empty');

    await connectDB();
    const convo = await Conversation.findById(conversationId);
    if (!convo) return fail('Not found', 404);
    if (!convo.participants.some((p: any) => p.toString() === me)) return fail('Forbidden', 403);

    convo.messages.push({ sender: me, text: trimmed, imageUrl: imageUrl || undefined, read: false, createdAt: new Date() } as any);
    convo.lastMessageAt = new Date();
    await convo.save();

    const recipient = convo.participants.find((p: any) => p.toString() !== me);
    if (recipient) {
      await notifyUser(recipient.toString(), {
        type: 'message',
        title: 'New message',
        body: trimmed ? trimmed.slice(0, 60) : '📷 Photo',
        link: `/chat?c=${conversationId}`,
        email: true,
      });
    }
    return ok({ sent: true });
  } catch (e) {
    return handleError(e);
  }
}