import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { propertySchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { z } from 'zod';
import { getListingFreshness } from '@/lib/property-freshness';
import { hasAdminAccess } from '@/lib/role-access';

type Ctx = { params: Promise<{ id: string }> };

interface PopulatedPropertyOwner {
  _id: { toString(): string };
}

interface PublicProperty {
  status: string;
  owner: PopulatedPropertyOwner | null;
  createdAt: Date;
  lastAvailabilityConfirmedAt?: Date | null;
}

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return fail('Invalid id', 400);
    await connectDB();
    const property = await Property.findById(id)
      .populate('owner', 'name email phone phoneVerified kycStatus')
      .lean<PublicProperty>();
    if (!property) return fail('Not found', 404);

    const session = await getServerSession(authOptions);
    const me = session?.user?.id;
    const role = session?.user?.role;
    const isOwner = property.owner?._id.toString() === me;
    if (property.status !== 'approved' && !isOwner && !hasAdminAccess(role))
      return fail('Not found', 404);
    if (
      property.status === 'approved' &&
      !isOwner &&
      !hasAdminAccess(role) &&
      getListingFreshness(property.createdAt, property.lastAvailabilityConfirmedAt)
        .isHidden
    )
      return fail('Not found', 404);
    return ok(property);
  } catch (e) {
    return handleError(e);
  }
}

const updateSchema = propertySchema.partial().extend({ status: z.never().optional() });

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return fail('Invalid id', 400);
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    await connectDB();
    const property = await Property.findById(id);
    if (!property) return fail('Not found', 404);

    const me = session.user.id;
    const role = session.user.role;
    if (property.owner.toString() !== me && !hasAdminAccess(role)) return fail('Forbidden', 403);

    const parsed = updateSchema.parse(await req.json());
    const fields = [
      'title',
      'description',
      'propertyType',
      'city',
      'rent',
      'deposit',
      'area',
      'address',
      'images',
      'videos',
    ] as const;
    for (const field of fields) {
      if (parsed[field] !== undefined) property.set(field, parsed[field]);
    }
    if (parsed.lat !== undefined && parsed.lng !== undefined) {
      property.location = { type: 'Point', coordinates: [parsed.lng, parsed.lat] };
    }
    if (!hasAdminAccess(role) && property.status === 'approved') property.status = 'pending';
    await property.save();

    const updated = await Property.findById(id)
      .populate('owner', 'name email phone')
      .lean();
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return fail('Invalid id', 400);
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    await connectDB();
    const property = await Property.findById(id);
    if (!property) return fail('Not found', 404);

    const me = session.user.id;
    const role = session.user.role;
    if (property.owner.toString() !== me && !hasAdminAccess(role)) return fail('Forbidden', 403);

    await property.deleteOne();
    return ok({ deleted: true, id });
  } catch (e) {
    return handleError(e);
  }
}