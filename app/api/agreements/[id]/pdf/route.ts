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
    const me = session.user.id;

    await connectDB();
    const agreement: any = await RentAgreement.findById(id).lean();
    if (!agreement) return fail('Not found', 404);

    const isOwner = agreement.owner.toString() === me;
    const isTenant = agreement.tenant.toString() === me;
    const role = session.user.role;

    if (!isOwner && !isTenant && role !== 'admin') {
      return fail('Forbidden', 403);
    }
    if (agreement.status !== 'confirmed' || !agreement.pdfUrl) {
      return fail('PDF not available yet. Agreement must be confirmed.', 400);
    }

    const pdfUrl = new URL(agreement.pdfUrl);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (
      pdfUrl.protocol !== 'https:' ||
      pdfUrl.hostname !== 'res.cloudinary.com' ||
      !cloudName ||
      !pdfUrl.pathname.startsWith(`/${cloudName}/`)
    ) {
      return fail('Stored PDF URL is invalid.', 502);
    }

    const pdfResponse = await fetch(pdfUrl, { redirect: 'error' });
    if (!pdfResponse.ok || !pdfResponse.body) {
      return fail('Unable to retrieve the agreement PDF.', 502);
    }

    return new NextResponse(pdfResponse.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rent-agreement.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    return handleError(e);
  }
}