import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/models/Conversation";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const { conversationId } = await req.json();
    if (!conversationId) return fail("conversationId required");

    await connectDB();
    const me = (session.user as any).id;
    const convo = await Conversation.findById(conversationId);
    if (!convo) return fail("Not found", 404);
    if (!convo.participants.some((p: any) => p.toString() === me))
      return fail("Forbidden", 403);

    let updated = 0;
    convo.messages.forEach((m: any) => {
      if (m.sender.toString() !== me && !m.read) {
        m.read = true;
        updated++;
      }
    });
    if (updated > 0) await convo.save();

    return ok({ marked: updated });
  } catch (e) {
    return handleError(e);
  }
}
