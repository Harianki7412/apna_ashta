import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { Conversation } from '@/models/Conversation';
import { reviewSchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function GET(req: Request) {
  try {
    const propertyId = new URL(req.url).searchParams.get('property');
    if (!propertyId) return fail('property required');

    await connectDB();
    const reviews = await Review.find({ property: propertyId })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .lean();
    const avg = reviews.length
      ? reviews.reduce((s, r: any) => s + r.rating, 0) / reviews.length
      : 0;

    return ok({ reviews, avgRating: avg, count: reviews.length });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { propertyId, rating, comment } = reviewSchema.parse(await req.json());
    await connectDB();
    const me = (session.user as any).id;

    // Only users who've chatted can review
    const chatted = await Conversation.exists({ participants: me, property: propertyId });
    if (!chatted) return fail('You must contact the owner before reviewing', 403);

    try {
      const review = await Review.create({ property: propertyId, author: me, rating, comment });
      return ok(review, 201);
    } catch (err: any) {
      if (err.code === 11000) return fail('You already reviewed this property', 409);
      throw err;
    }
  } catch (e) {
    return handleError(e);
  }
}