import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { propertySchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { z } from 'zod';

// Next.js 16: params is now a Promise
type RouteContext = { params: Promise<{ id: string }> };

/* ─────────────────────────────────────────────
   GET /api/properties/[id]
   Public — fetch single property with owner info
   ───────────────────────────────────────────── */
export async function GET(_: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params; // ✅ await in Next.js 16

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return fail('Invalid property id', 400);
    }

    await connectDB();
    const property = await Property.findById(id)
      .populate('owner', 'name email phone phoneVerified kycStatus')
      .lean();

    if (!property) return fail('Property not found', 404);

    // Only approved properties are public; owner/admin can see any status
    const session = await getServerSession(authOptions);
    const me = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;
    const isOwner = property.owner && (property.owner as any)._id?.toString() === me;
    const isAdmin = role === 'admin';

    if (property.status !== 'approved' && !isOwner && !isAdmin) {
      return fail('Property not found', 404);
    }

    return ok(property);
  } catch (e) {
    return handleError(e);
  }
}

/* ─────────────────────────────────────────────
   PATCH /api/properties/[id]
   Owner or Admin — update safe fields
   ───────────────────────────────────────────── */
const updateSchema = propertySchema.partial().extend({
  // Owner cannot self-approve — status change only via admin route
  status: z.never().optional(),
});

export async function PATCH(req: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params; // ✅ await

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return fail('Invalid property id', 400);
    }

    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    await connectDB();
    const property = await Property.findById(id);
    if (!property) return fail('Property not found', 404);

    const me = (session.user as any).id;
    const role = (session.user as any).role;
    const isOwner = property.owner.toString() === me;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) return fail('Forbidden', 403);

    const body = await req.json();
    const parsed = updateSchema.parse(body);

    // Update only provided fields
    if (parsed.title !== undefined) property.title = parsed.title;
    if (parsed.description !== undefined) property.description = parsed.description;
    if (parsed.propertyType !== undefined) property.propertyType = parsed.propertyType;
    if (parsed.rent !== undefined) property.rent = parsed.rent;
    if (parsed.deposit !== undefined) property.deposit = parsed.deposit;
    if (parsed.area !== undefined) property.area = parsed.area;
    if (parsed.address !== undefined) property.address = parsed.address;
    if (parsed.images !== undefined) property.images = parsed.images;

    // Update location if coordinates provided
    if (parsed.lat !== undefined && parsed.lng !== undefined) {
      property.location = {
        type: 'Point',
        coordinates: [parsed.lng, parsed.lat],
      } as any;
    }

    // If a previously approved property is edited by owner, send back to pending
    if (isOwner && !isAdmin && property.status === 'approved') {
      property.status = 'pending';
    }

    await property.save();

    // Return updated property with populated owner
    const updated = await Property.findById(id)
      .populate('owner', 'name email phone phoneVerified kycStatus')
      .lean();

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

/* ─────────────────────────────────────────────
   DELETE /api/properties/[id]
   Owner or Admin — delete property
   ───────────────────────────────────────────── */
export async function DELETE(_: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params; // ✅ await

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return fail('Invalid property id', 400);
    }

    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    await connectDB();
    const property = await Property.findById(id);
    if (!property) return fail('Property not found', 404);

    const me = (session.user as any).id;
    const role = (session.user as any).role;
    const isOwner = property.owner.toString() === me;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) return fail('Forbidden', 403);

    await property.deleteOne();

    return ok({ deleted: true, id });
  } catch (e) {
    return handleError(e);
  }
}