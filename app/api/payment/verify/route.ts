import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, propertyId } = await req.json();
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex');
    if (expected !== razorpay_signature) return fail('Invalid signature', 400);
    await connectDB();
    await Property.findByIdAndUpdate(propertyId, {
      featured: true,
      featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return ok({ featured: true });
  } catch (e) {
    return handleError(e);
  }
}