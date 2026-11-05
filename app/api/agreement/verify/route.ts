import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { RentAgreementOrder } from "@/models/RentAgreementOrder";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { razorpayPaymentSchema } from "@/lib/validators";
import { verifyRazorpayPayment } from "@/lib/verify-razorpay-payment";
import { z } from "zod";

const agreementPaymentSchema = razorpayPaymentSchema.extend({
  agreementOrderId: z.string().regex(/^[a-f\d]{24}$/i),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      agreementOrderId,
    } = agreementPaymentSchema.parse(await req.json());

    await connectDB();
    const order = await RentAgreementOrder.findById(agreementOrderId);
    if (!order) return fail("Order not found", 404);
    if (order.user.toString() !== session.user.id)
      return fail("Forbidden", 403);
    if (order.razorpayOrderId !== orderId) {
      return fail("Invalid payment details", 400);
    }
    if (order.status === "paid") return ok({ paid: true, alreadyPaid: true });
    if (order.status !== "pending") return fail("Order is not pending", 409);

    const verification = await verifyRazorpayPayment({
      orderId,
      paymentId,
      signature,
      userId: session.user.id,
      amountInRupees: order.amount,
      notes: {
        userId: session.user.id,
        propertyId: order.property.toString(),
        type: "rent_agreement",
      },
    });
    if (!verification.valid) {
      return fail(verification.message, verification.status);
    }

    order.status = "paid";
    order.razorpayPaymentId = paymentId;
    await order.save();

    return ok({ paid: true });
  } catch (e) {
    return handleError(e);
  }
}
