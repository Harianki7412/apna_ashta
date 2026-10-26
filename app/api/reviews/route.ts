import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { Conversation } from '@/models/Conversation';
import { Property } from '@/models/Property';
import { reviewSchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';

/* ═══ GET: List reviews ═══ */
export async function GET(req: Request) {
  try {
    const propertyId = new URL(req.url).searchParams.get('property');
    if (!propertyId) return fail('property query required', 400);

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

/* ═══ POST: Create review ═══ */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Please login first', 401);

    const me = (session.user as any).id;
    if (!me) {
      return fail('Session has no user id — please logout and login again', 401);
    }

    const { propertyId, rating, comment } = reviewSchema.parse(await req.json());
    await connectDB();

    // Verify property exists
    const property: any = await Property.findById(propertyId)
      .populate('owner', '_id')
      .lean();
    if (!property) return fail('Property not found', 404);

    // Owner can't review own property
    const ownerId = (property.owner as any)?._id?.toString();
    if (ownerId === me) {
      return fail('You cannot review your own property', 403);
    }

    // Must have chatted about this property
    const chatted = await Conversation.exists({
      participants: me,
      property: propertyId,
    });
    if (!chatted) {
      return fail(
        'Please chat with the owner about this property before reviewing',
        403
      );
    }

    // Check duplicates
    const existing = await Review.findOne({ property: propertyId, author: me });
    if (existing) {
      return fail('You have already reviewed this property', 409);
    }

    const review = await Review.create({
      property: propertyId,
      author: me,
      rating,
      comment: comment?.trim() || '',
    });

    return ok(review, 201);
  } catch (e: any) {
    // Handle mongoose duplicate key just in case
    if (e?.code === 11000) {
      return fail('You have already reviewed this property', 409);
    }
    console.error('[Review POST error]', e);
    return handleError(e);
  }
}