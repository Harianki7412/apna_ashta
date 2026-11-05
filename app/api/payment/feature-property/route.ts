import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { razorpay, FEATURED_PRICE_INR } from '@/lib/razorpay';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const featureOrderSchema = z.object({
  propertyId: z.string().regex(/^[a-f\d]{24}$/i),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const limit = rateLimit(`feature-order:${session.user.id}`, 5, 60_000);
    if (!limit.allowed) return fail('Too many order requests', 429);
    const { propertyId } = featureOrderSchema.parse(await req.json());
    await connectDB();
    const prop = await Property.findById(propertyId);
    if (!prop) return fail('Not found', 404);
    if (prop.owner.toString() !== session.user.id) return fail('Forbidden', 403);
    if (prop.status !== 'approved') return fail('Only approved can be featured');
    const order = await razorpay.orders.create({
      amount: FEATURED_PRICE_INR * 100,
      currency: 'INR',
      receipt: `feat_${propertyId}_${Date.now()}`,
      notes: { propertyId, userId: session.user.id, type: 'feature_property' },
    });
    return ok({ orderId: order.id, amount: order.amount, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
  } catch (e) {
    return handleError(e);
  }
}