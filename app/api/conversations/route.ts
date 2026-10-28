import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    await connectDB();
    const me = (session.user as any).id;

    const convos = await Conversation.find({ participants: me })
      .populate("participants", "name email")
      .populate("property", "title images")
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .lean();

    // Compute unread count + last message for each
    const enriched = convos.map((c: any) => {
      const messages = c.messages || [];
      const unread = messages.filter(
        (m: any) => m.sender.toString() !== me && !m.read,
      ).length;
      const lastMsg = messages[messages.length - 1];
      return {
        _id: c._id,
        participants: c.participants,
        property: c.property,
        lastMessageAt: c.lastMessageAt,
        lastMessage: lastMsg
          ? {
              text: lastMsg.text,
              imageUrl: lastMsg.imageUrl,
              senderId: lastMsg.sender.toString(),
              createdAt: lastMsg.createdAt,
            }
          : null,
        unread,
      };
    });

    return ok(enriched);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const { otherUserId, propertyId } = await req.json();
    const me = (session.user as any).id;
    if (!otherUserId || otherUserId === me) return fail("Invalid recipient");

    await connectDB();
    const filter: any = { participants: { $all: [me, otherUserId] } };
    if (propertyId) filter.property = propertyId;

    let convo = await Conversation.findOne(filter);
    if (!convo) {
      convo = await Conversation.create({
        participants: [me, otherUserId],
        property: propertyId || undefined,
        messages: [],
      });
    }
    return ok(convo);
  } catch (e) {
    return handleError(e);
  }
}
