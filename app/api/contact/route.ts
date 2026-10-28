import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { sendGenericEmail } from "@/lib/email";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { rateLimit, clientIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(`contact:${clientIP(req)}`, 3, 60_000);
    if (!rl.allowed) {
      return fail("Too many requests. Please try again in a minute.", 429);
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return fail("Name, email and message are required");
    }
    if (message.length > 1000) {
      return fail("Message too long (max 1000 characters)");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail("Invalid email address");
    }

    await connectDB();

    const doc = await ContactMessage.create({
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 120),
      phone: phone?.trim()?.slice(0, 15) || undefined,
      subject: subject?.trim()?.slice(0, 100) || "General Inquiry",
      message: message.trim(),
    });

    // Notify admin
    const adminEmail =
      process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "hello@Flatova.in";

    await sendGenericEmail(
      adminEmail,
      `📩 New Contact: ${subject || "General"}`,
      `
        <div style="font-family:system-ui,sans-serif;max-width:560px;padding:20px;">
          <h2 style="color:#2563eb;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:100px;">From:</td>
              <td style="padding:8px 0;"><strong>${name}</strong> &lt;${email}&gt;</td>
            </tr>
            ${phone ? `<tr><td style="padding:8px 0;color:#6b7280;">Phone:</td><td style="padding:8px 0;">${phone}</td></tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#6b7280;">Subject:</td>
              <td style="padding:8px 0;">${subject || "General"}</td>
            </tr>
          </table>
          <blockquote style="border-left:3px solid #2563eb;padding-left:16px;margin:16px 0;color:#374151;">
            ${message.replace(/\n/g, "<br>")}
          </blockquote>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
            Message ID: ${doc._id}<br>
            Reply to this email directly to respond.
          </p>
        </div>
      `,
    ).catch(console.error);

    return ok({ sent: true, id: doc._id });
  } catch (e) {
    return handleError(e);
  }
}
