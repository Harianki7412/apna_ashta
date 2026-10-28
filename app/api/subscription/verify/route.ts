import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { notifyUser } from "@/lib/notify";
import { getPlan } from "@/lib/pricing";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscriptionId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return fail("Missing payment details");
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) return fail("Invalid signature", 400);

    await connectDB();

    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return fail("Subscription not found", 404);
    if (sub.user.toString() !== (session.user as any).id) {
      return fail("Forbidden", 403);
    }
    if (sub.status === "active")
      return ok({ activated: true, alreadyActive: true });

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
    sub.razorpayPaymentId = razorpay_payment_id;
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
