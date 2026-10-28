import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { LeadPack } from "@/models/LeadPack";
import { razorpay } from "@/lib/razorpay";
import { LEAD_PACKS } from "@/lib/pricing";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);
    if ((session.user as any).role !== "owner")
      return fail("Only owners can buy leads", 403);

    const { packId } = await req.json();
    const pack = LEAD_PACKS.find((p) => p.id === packId);
    if (!pack) return fail("Invalid pack");

    await connectDB();

    const order = await razorpay.orders.create({
      amount: pack.price * 100,
      currency: "INR",
      receipt: `lead_${packId}_${Date.now()}`,
      notes: {
        userId: (session.user as any).id,
        packId,
        type: "lead_pack",
      },
    });

    const leadPack = await LeadPack.create({
      user: (session.user as any).id,
      packId,
      totalLeads: pack.leads,
      amount: pack.price,
      status: "pending",
      razorpayOrderId: order.id,
    });

    return ok({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      leadPackId: leadPack._id,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    await connectDB();
    const packs = await LeadPack.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .lean();

    return ok(packs);
  } catch (e) {
    return handleError(e);
  }
}
