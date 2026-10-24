import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { razorpay, FEATURED_PRICE_INR } from '@/lib/razorpay';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { propertyId } = await req.json();
    await connectDB();
    const prop = await Property.findById(propertyId);
    if (!prop) return fail('Not found', 404);
    if (prop.owner.toString() !== (session.user as any).id) return fail('Forbidden', 403);
    if (prop.status !== 'approved') return fail('Only approved properties can be featured');

    const order = await razorpay.orders.create({
      amount: FEATURED_PRICE_INR * 100,
      currency: 'INR',
      receipt: `feat_${propertyId}_${Date.now()}`,
      notes: { propertyId, userId: (session.user as any).id },
    });

    return ok({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    return handleError(e);
  }
}