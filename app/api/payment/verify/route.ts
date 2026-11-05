import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { FEATURED_PRICE_INR } from "@/lib/razorpay";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { razorpayPaymentSchema } from "@/lib/validators";
import { verifyRazorpayPayment } from "@/lib/verify-razorpay-payment";
import { z } from "zod";

const featurePaymentSchema = razorpayPaymentSchema.extend({
  propertyId: z.string().regex(/^[a-f\d]{24}$/i),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      propertyId,
    } = featurePaymentSchema.parse(await req.json());

    await connectDB();
    const property = await Property.findById(propertyId);
    if (!property) return fail("Property not found", 404);
    if (property.owner.toString() !== session.user.id) {
      return fail("Forbidden", 403);
    }
    if (property.status !== "approved") {
      return fail("Only approved properties can be featured", 400);
    }

    const verification = await verifyRazorpayPayment({
      orderId,
      paymentId,
      signature,
      userId: session.user.id,
      amountInRupees: FEATURED_PRICE_INR,
      notes: { propertyId, type: "feature_property" },
    });
    if (!verification.valid) {
      return fail(verification.message, verification.status);
    }

    if (property.featuredPaymentId === paymentId) {
      return ok({ featured: true, alreadyFeatured: true });
    }

    const updated = await Property.findOneAndUpdate(
      {
        _id: propertyId,
        owner: session.user.id,
        status: "approved",
        featuredPaymentId: { $ne: paymentId },
      },
      {
        featured: true,
        featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        featuredPaymentId: paymentId,
      },
      { returnDocument: "after" },
    );
    if (!updated) return fail("Property could not be featured", 409);

    return ok({ featured: true });
  } catch (e) {
    return handleError(e);
  }
}
