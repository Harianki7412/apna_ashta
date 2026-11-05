import { timingSafeEqual, createHmac } from "crypto";
import { razorpay } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";

type VerifyRazorpayPaymentInput = {
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
  amountInRupees: number;
  notes: Record<string, string>;
};

type VerifyRazorpayPaymentResult =
  | { valid: true }
  | { valid: false; status: 400 | 429 | 503; message: string };

export async function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature,
  userId,
  amountInRupees,
  notes,
}: VerifyRazorpayPaymentInput): Promise<VerifyRazorpayPaymentResult> {
  const limit = rateLimit(`razorpay-verify:${userId}`, 10, 60_000);
  if (!limit.allowed) {
    return {
      valid: false,
      status: 429,
      message: "Too many payment verification attempts",
    };
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("[Payment] Razorpay secret is not configured");
    return {
      valid: false,
      status: 503,
      message: "Payment verification is unavailable",
    };
  }

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  const received = Buffer.from(signature, "hex");
  if (
    received.length !== expected.length ||
    !timingSafeEqual(expected, received)
  ) {
    return { valid: false, status: 400, message: "Invalid payment details" };
  }

  const [order, payment] = await Promise.all([
    razorpay.orders.fetch(orderId),
    razorpay.payments.fetch(paymentId),
  ]);
  const orderNotes = order.notes ?? {};
  const notesMatch = Object.entries(notes).every(
    ([key, value]) => String(orderNotes[key] ?? "") === value,
  );
  const valid =
    order.status === "paid" &&
    order.amount === amountInRupees * 100 &&
    order.currency === "INR" &&
    String(orderNotes.userId ?? "") === userId &&
    notesMatch &&
    payment.order_id === orderId &&
    payment.status === "captured" &&
    payment.amount === amountInRupees * 100 &&
    payment.currency === "INR";

  return valid
    ? { valid: true }
    : { valid: false, status: 400, message: "Invalid payment details" };
}
