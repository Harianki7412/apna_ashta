import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { LeadPack } from "@/models/LeadPack";
import { notifyUser } from "@/lib/notify";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      leadPackId,
    } = await req.json();

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) return fail("Invalid signature", 400);

    await connectDB();

    const pack = await LeadPack.findById(leadPackId);
    if (!pack) return fail("Lead pack not found", 404);
    if (pack.user.toString() !== (session.user as any).id)
      return fail("Forbidden", 403);
    if (pack.status === "active")
      return ok({ activated: true, alreadyActive: true });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    pack.status = "active";
    pack.razorpayPaymentId = razorpay_payment_id;
    pack.expiresAt = expiresAt;
    await pack.save();

    await User.updateOne(
      { _id: pack.user },
      {
        activeLeadPack: {
          packId: pack.packId,
          remainingLeads: pack.totalLeads,
          expiresAt,
        },
      },
    );

    await notifyUser(pack.user.toString(), {
      type: "system",
      title: `✅ ${pack.totalLeads} leads added!`,
      body: `You now have ${pack.totalLeads} extra leads, valid until ${expiresAt.toLocaleDateString("en-IN")}.`,
      link: "/dashboard",
    });

    return ok({ activated: true, totalLeads: pack.totalLeads });
  } catch (e) {
    return handleError(e);
  }
}
