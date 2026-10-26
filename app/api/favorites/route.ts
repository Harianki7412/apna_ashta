import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Favorite } from '@/models/Favorite';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    await connectDB();
    const favs = await Favorite.find({ user: (session.user as any).id })
      .populate({ path: 'property', populate: { path: 'owner', select: 'name' } })
      .sort({ createdAt: -1 })
      .lean();
    return ok(favs.map((f: any) => f.property).filter(Boolean));
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    const { propertyId } = await req.json();
    if (!propertyId) return fail('propertyId required');
    await connectDB();
    const me = (session.user as any).id;
    const existing = await Favorite.findOne({ user: me, property: propertyId });
    if (existing) {
      await existing.deleteOne();
      return ok({ saved: false });
    }
    await Favorite.create({ user: me, property: propertyId });
    return ok({ saved: true });
  } catch (e) {
    return handleError(e);
  }
}