import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { RentAgreement } from '@/models/RentAgreement';
import { notifyUser } from '@/lib/notify';
import { ok, fail, handleError } from '@/lib/api-helpers';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { id } = await ctx.params;
    const me = (session.user as any).id;

    await connectDB();
    const agreement: any = await RentAgreement.findById(id)
      .populate('property', 'title images area city address propertyType bhk')
      .populate('owner', 'name email phone phoneVerified kycStatus')
      .populate('tenant', 'name email phone phoneVerified kycStatus')
      .lean();

    if (!agreement) return fail('Not found', 404);

    const isOwner = agreement.owner._id.toString() === me;
    const isTenant = agreement.tenant._id.toString() === me;
    const role = (session.user as any).role;

    if (!isOwner && !isTenant && role !== 'admin') {
      return fail('Forbidden', 403);
    }

    return ok({ agreement, isOwner, isTenant });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_: Request, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { id } = await ctx.params;
    const me = (session.user as any).id;

    await connectDB();
    const agreement: any = await RentAgreement.findById(id);
    if (!agreement) return fail('Not found', 404);
    if (agreement.owner.toString() !== me) return fail('Forbidden', 403);
    if (agreement.status === 'confirmed') {
      return fail('Cannot cancel a confirmed agreement');
    }
    if (agreement.status !== 'pending') {
      return fail('Agreement is not pending');
    }

    agreement.status = 'cancelled';
    agreement.ownerCancelledAt = new Date();
    await agreement.save();

    await notifyUser(agreement.tenant.toString(), {
      type: 'system',
      title: 'Agreement cancelled',
      body: 'Owner cancelled the rent agreement.',
      link: `/agreements/${id}`,
    });

    return ok({ cancelled: true });
  } catch (e) {
    return handleError(e);
  }
}