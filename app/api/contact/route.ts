import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { sendGenericEmail } from "@/lib/email";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { rateLimit, clientIP } from "@/lib/rate-limit";
import { getSetting } from "@/lib/plan-helpers";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(15).optional(),
  subject: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1).max(1000),
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`contact:${clientIP(req)}`, 3, 60_000);
    if (!rl.allowed) {
      return fail("Too many requests. Please try again in a minute.", 429);
    }

    const { name, email, phone, subject, message } = contactSchema.parse(
      await req.json(),
    );

    await connectDB();

    const doc = await ContactMessage.create({
      name,
      email: email.toLowerCase(),
      phone: phone || undefined,
      subject: subject || "General Inquiry",
      message,
    });

    // Notify admin
    const adminEmail =
      process.env.SUPPORT_EMAIL ||
      process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] ||
      (await getSetting<string>("supportEmail", ""));

    if (adminEmail) {
      await sendGenericEmail(
        adminEmail,
        `📩 New Contact: ${escapeHtml(subject || "General")}`,
        `
        <div style="font-family:system-ui,sans-serif;max-width:560px;padding:20px;">
          <h2 style="color:#2563eb;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:100px;">From:</td>
              <td style="padding:8px 0;"><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</td>
            </tr>
            ${phone ? `<tr><td style="padding:8px 0;color:#6b7280;">Phone:</td><td style="padding:8px 0;">${escapeHtml(phone)}</td></tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#6b7280;">Subject:</td>
              <td style="padding:8px 0;">${escapeHtml(subject || "General")}</td>
            </tr>
          </table>
          <blockquote style="border-left:3px solid #2563eb;padding-left:16px;margin:16px 0;color:#374151;">
            ${escapeHtml(message).replace(/\n/g, "<br>")}
          </blockquote>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
            Message ID: ${doc._id}<br>
            Reply to this email directly to respond.
          </p>
        </div>
        `,
      ).catch(console.error);
    } else {
      console.warn(
        "[Contact POST] Support email is not configured; message saved to database only.",
      );
    }

    return ok({ sent: true, id: doc._id });
  } catch (e) {
    return handleError(e);
  }
}
