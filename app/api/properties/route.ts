import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { propertySchema } from '@/lib/validators';
import { ok, fail, handleError, paginate } from '@/lib/api-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const { page, limit, skip } = paginate(sp);

    const area = sp.get('area');
    const type = sp.get('type');
    const min = sp.get('min');
    const max = sp.get('max');
    const q = sp.get('q');
    const sort = sp.get('sort') || 'newest';
    const lat = sp.get('lat');
    const lng = sp.get('lng');
    const radius = sp.get('radius');

    const query: any = { status: 'approved' };
    if (area) query.area = new RegExp(area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (type) query.propertyType = type;
    if (min || max) query.rent = {};
    if (min) query.rent.$gte = Number(min);
    if (max) query.rent.$lte = Number(max);
    if (q) query.$text = { $search: q };
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      };
    }

    const sortMap: any = {
      newest: { featured: -1, createdAt: -1 },
      price_asc: { featured: -1, rent: 1 },
      price_desc: { featured: -1, rent: -1 },
    };

    const [items, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'name phone')
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query),
    ]);

    return ok({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + items.length < total,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    if (!['owner', 'admin'].includes((session.user as any).role))
      return fail('Only owners can create listings', 403);

    const data = propertySchema.parse(await req.json());
    await connectDB();

    const property = await Property.create({
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      rent: data.rent,
      deposit: data.deposit,
      area: data.area,
      address: data.address,
      location: { type: 'Point', coordinates: [data.lng, data.lat] },
      images: data.images,
      owner: (session.user as any).id,
      status: 'pending',
    });

    return ok(property, 201);
  } catch (e) {
    return handleError(e);
  }
}