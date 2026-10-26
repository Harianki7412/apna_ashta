import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { RentAgreement } from '@/models/RentAgreement';
import { fail, handleError } from '@/lib/api-helpers';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { id } = await ctx.params;
    const me = (session.user as any).id;

    await connectDB();
    const agreement: any = await RentAgreement.findById(id).lean();
    if (!agreement) return fail('Not found', 404);

    const isOwner = agreement.owner.toString() === me;
    const isTenant = agreement.tenant.toString() === me;
    const role = (session.user as any).role;

    if (!isOwner && !isTenant && role !== 'admin') {
      return fail('Forbidden', 403);
    }
    if (agreement.status !== 'confirmed' || !agreement.pdfUrl) {
      return fail('PDF not available yet. Agreement must be confirmed.', 400);
    }

    // Redirect to Cloudinary URL
    return NextResponse.redirect(agreement.pdfUrl);
  } catch (e) {
    return handleError(e);
  }
}