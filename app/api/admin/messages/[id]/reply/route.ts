import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { sendGenericEmail } from "@/lib/email";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const s = await getServerSession(authOptions);
    if ((s?.user as any)?.role !== "admin") return fail("Forbidden", 403);

    const { id } = await ctx.params;
    const { reply } = await req.json();
    if (!reply?.trim()) return fail("Reply required");

    await connectDB();
    const msg = await ContactMessage.findById(id);
    if (!msg) return fail("Message not found", 404);

    await sendGenericEmail(
      msg.email,
      `Re: ${msg.subject || "Your inquiry"} — Flatova`,
      `<div style="font-family:system-ui,sans-serif;max-width:600px;padding:20px;">
        <h2 style="color:#2563eb;">Flatova Support</h2>
        <p>Hi ${msg.name},</p>
        <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
          ${reply.replace(/\n/g, "<br>")}
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="color:#6b7280;font-size:12px;">
          <strong>Your original message:</strong><br>
          ${msg.message.replace(/\n/g, "<br>")}
        </p>
      </div>`,
    );

    msg.status = "replied";
    msg.adminReply = reply;
    msg.repliedAt = new Date();
    await msg.save();

    return ok({ replied: true });
  } catch (e) {
    return handleError(e);
  }
}
