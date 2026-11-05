import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { LeadPack } from "@/models/LeadPack";
import { notifyUser } from "@/lib/notify";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { razorpayPaymentSchema } from "@/lib/validators";
import { verifyRazorpayPayment } from "@/lib/verify-razorpay-payment";
import { z } from "zod";

const leadPackPaymentSchema = razorpayPaymentSchema.extend({
  leadPackId: z.string().regex(/^[a-f\d]{24}$/i),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      leadPackId,
    } = leadPackPaymentSchema.parse(await req.json());

    await connectDB();

    const pack = await LeadPack.findById(leadPackId);
    if (!pack) return fail("Lead pack not found", 404);
    if (pack.user.toString() !== session.user.id)
      return fail("Forbidden", 403);
    if (pack.razorpayOrderId !== orderId) {
      return fail("Invalid payment details", 400);
    }
    if (pack.status === "active")
      return ok({ activated: true, alreadyActive: true });
    if (pack.status !== "pending") {
      return fail("Lead pack is not pending", 409);
    }

    const verification = await verifyRazorpayPayment({
      orderId,
      paymentId,
      signature,
      userId: session.user.id,
      amountInRupees: pack.amount,
      notes: { userId: session.user.id, packId: pack.packId, type: "lead_pack" },
    });
    if (!verification.valid) {
      return fail(verification.message, verification.status);
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    pack.status = "active";
    pack.razorpayPaymentId = paymentId;
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
