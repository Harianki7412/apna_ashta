import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { razorpay } from "@/lib/razorpay";
import { getPlan } from "@/lib/pricing";
import { ok, fail, handleError } from "@/lib/api-helpers";

/* ═══ POST: Create subscription order ═══ */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);
    if ((session.user as any).role !== "owner") {
      return fail("Only owners can subscribe", 403);
    }

    const { planId, billingCycle = "monthly" } = await req.json();
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
      { user: (session.user as any).id, status: "pending" },
      { status: "failed" },
    );

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `sub_${planId}_${Date.now()}`,
      notes: {
        userId: (session.user as any).id,
        planId,
        billingCycle,
        type: "subscription",
      },
    });

    const sub = await Subscription.create({
      user: (session.user as any).id,
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
    const user = await User.findById((session.user as any).id)
      .select("subscription")
      .lean();

    const history = await Subscription.find({ user: (session.user as any).id })
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
      { _id: (session.user as any).id },
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
