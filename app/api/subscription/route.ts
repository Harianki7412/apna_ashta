import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { razorpay } from "@/lib/razorpay";
import { getPlan } from "@/lib/pricing";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const subscriptionOrderSchema = z.object({
  planId: z.string().min(1).max(40),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

/* ═══ POST: Create subscription order ═══ */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);
    if (session.user.role !== "owner") {
      return fail("Only owners can subscribe", 403);
    }

    const limit = rateLimit(`subscription-order:${session.user.id}`, 5, 60_000);
    if (!limit.allowed) return fail("Too many order requests", 429);
    const { planId, billingCycle } = subscriptionOrderSchema.parse(
      await req.json(),
    );
    const plan = getPlan(planId);
    if (!plan || plan.id === "free") return fail("Invalid plan");

    const amount =
      billingCycle === "yearly" && plan.yearlyPrice
        ? plan.yearlyPrice
        : plan.price;

    if (amount < 1) return fail("Invalid amount");

    await connectDB();

    // Cancel any existing pending subscriptions
    await Subscription.updateMany(
      { user: session.user.id, status: "pending" },
      { status: "failed" },
    );

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `sub_${planId}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        planId,
        billingCycle,
        type: "subscription",
      },
    });

    const sub = await Subscription.create({
      user: session.user.id,
      planId,
      billingCycle,
      amount,
      status: "pending",
      razorpayOrderId: order.id,
    });

    return ok({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscriptionId: sub._id,
      planName: plan.name,
      billingCycle,
    });
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ GET: Current subscription status ═══ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    await connectDB();
    const user = await User.findById(session.user.id)
      .select("subscription")
      .lean();

    const history = await Subscription.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return ok({
      current: (user as any)?.subscription || { planId: "free" },
      history,
    });
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ DELETE: Cancel auto-renew ═══ */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    await connectDB();
    await User.updateOne(
      { _id: session.user.id },
      { "subscription.autoRenew": false },
    );

    return ok({
      cancelled: true,
      message: "Auto-renew disabled. You retain access until expiry.",
    });
  } catch (e) {
    return handleError(e);
  }
}
