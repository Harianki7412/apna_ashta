import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { notifyUser } from "@/lib/notify";
import { getPlan } from "@/lib/pricing";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { razorpayPaymentSchema } from "@/lib/validators";
import { verifyRazorpayPayment } from "@/lib/verify-razorpay-payment";
import { z } from "zod";

const subscriptionPaymentSchema = razorpayPaymentSchema.extend({
  subscriptionId: z.string().regex(/^[a-f\d]{24}$/i),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      subscriptionId,
    } = subscriptionPaymentSchema.parse(await req.json());

    await connectDB();

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return fail("Subscription not found", 404);
    if (sub.user.toString() !== session.user.id) {
      return fail("Forbidden", 403);
    }
    if (sub.razorpayOrderId !== orderId) {
      return fail("Invalid payment details", 400);
    }
    if (sub.status === "active")
      return ok({ activated: true, alreadyActive: true });
    if (sub.status !== "pending") {
      return fail("Subscription is not pending", 409);
    }

    const verification = await verifyRazorpayPayment({
      orderId,
      paymentId,
      signature,
      userId: session.user.id,
      amountInRupees: sub.amount,
      notes: {
        userId: session.user.id,
        planId: sub.planId,
        billingCycle: sub.billingCycle,
        type: "subscription",
      },
    });
    if (!verification.valid) {
      return fail(verification.message, verification.status);
    }

    const plan = getPlan(sub.planId);
    if (!plan) return fail("Invalid plan");

    // Calculate expiry
    const now = new Date();
    const expiresAt = new Date(now);
    if (sub.billingCycle === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Activate subscription
    sub.status = "active";
    sub.startDate = now;
    sub.expiresAt = expiresAt;
    sub.razorpayPaymentId = paymentId;
    sub.autoRenew = true;
    await sub.save();

    // Update user denormalized field
    await User.updateOne(
      { _id: sub.user },
      {
        subscription: {
          planId: sub.planId,
          expiresAt,
          autoRenew: true,
        },
      },
    );

    await notifyUser(sub.user.toString(), {
      type: "system",
      title: `🎉 ${plan.name} plan activated!`,
      body: `Your ${plan.name} plan is active until ${expiresAt.toLocaleDateString("en-IN")}. Enjoy ${plan.listingLimit} listings and ${plan.leadsPerProperty} leads.`,
      link: "/dashboard/subscription",
      email: true,
    });

    return ok({ activated: true, planId: sub.planId, expiresAt });
  } catch (e) {
    return handleError(e);
  }
}
