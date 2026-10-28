import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { RentAgreementOrder } from "@/models/RentAgreementOrder";
import { razorpay } from "@/lib/razorpay";
import { AGREEMENT_PRICE } from "@/lib/pricing";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const { propertyId } = await req.json();
    await connectDB();

    const property = await Property.findById(propertyId);
    if (!property) return fail("Property not found", 404);
    if (property.owner.toString() !== (session.user as any).id) {
      return fail("Only owner can pay for agreement", 403);
    }

    const order = await razorpay.orders.create({
      amount: AGREEMENT_PRICE * 100,
      currency: "INR",
      receipt: `agr_${propertyId}_${Date.now()}`,
      notes: {
        userId: (session.user as any).id,
        propertyId,
        type: "rent_agreement",
      },
    });

    const agrOrder = await RentAgreementOrder.create({
      user: (session.user as any).id,
      property: propertyId,
      amount: AGREEMENT_PRICE,
      status: "pending",
      razorpayOrderId: order.id,
    });

    return ok({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      agreementOrderId: agrOrder._id,
    });
  } catch (e) {
    return handleError(e);
  }
}
