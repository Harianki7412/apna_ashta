import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { RentAgreementOrder } from "@/models/RentAgreementOrder";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      agreementOrderId,
    } = await req.json();

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) return fail("Invalid signature", 400);

    await connectDB();
    const order = await RentAgreementOrder.findById(agreementOrderId);
    if (!order) return fail("Order not found", 404);
    if (order.user.toString() !== (session.user as any).id)
      return fail("Forbidden", 403);

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    return ok({ paid: true });
  } catch (e) {
    return handleError(e);
  }
}
