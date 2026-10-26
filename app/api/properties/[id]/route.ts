import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { propertySchema } from '@/lib/validators';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { z } from 'zod';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return fail('Invalid id', 400);
    await connectDB();
    const property = await Property.findById(id)
      .populate('owner', 'name email phone phoneVerified kycStatus')
      .lean();
    if (!property) return fail('Not found', 404);

    const session = await getServerSession(authOptions);
    const me = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;
    const isOwner = (property.owner as any)?._id?.toString() === me;
    if (property.status !== 'approved' && !isOwner && role !== 'admin')
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

    const me = (session.user as any).id;
    const role = (session.user as any).role;
    if (property.owner.toString() !== me && role !== 'admin') return fail('Forbidden', 403);

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
    ];
    for (const f of fields) {
      if ((parsed as any)[f] !== undefined) (property as any)[f] = (parsed as any)[f];
    }
    if (parsed.lat !== undefined && parsed.lng !== undefined) {
      property.location = { type: 'Point', coordinates: [parsed.lng, parsed.lat] } as any;
    }
    if (role !== 'admin' && property.status === 'approved') property.status = 'pending';
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

    const me = (session.user as any).id;
    const role = (session.user as any).role;
    if (property.owner.toString() !== me && role !== 'admin') return fail('Forbidden', 403);

    await property.deleteOne();
    return ok({ deleted: true, id });
  } catch (e) {
    return handleError(e);
  }
}