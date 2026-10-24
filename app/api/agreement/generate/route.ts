import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { agreementSchema } from '@/lib/validators';
import { generateRentAgreement } from '@/lib/pdf/rentAgreement';
import { fail, handleError } from '@/lib/api-helpers';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const data = agreementSchema.parse(await req.json());
    await connectDB();
    const property: any = await Property.findById(data.propertyId)
      .populate('owner', 'name phone')
      .lean();
    if (!property) return fail('Property not found', 404);

    const me = (session.user as any).id;
    const role = (session.user as any).role;
    if (property.owner._id.toString() !== me && role !== 'admin')
      return fail('Forbidden', 403);

    const pdfBytes = await generateRentAgreement({
      ownerName: property.owner.name,
      ownerPhone: property.owner.phone || 'N/A',
      ownerAddress: 'Ashta, Madhya Pradesh',
      tenantName: data.tenantName,
      tenantPhone: data.tenantPhone,
      tenantAddress: data.tenantAddress,
      propertyAddress: property.address,
      propertyType: property.propertyType,
      rentAmount: property.rent,
      depositAmount: property.deposit || 0,
      startDate: data.startDate,
      durationMonths: data.durationMonths,
      noticePeriodDays: data.noticePeriodDays,
      includeFurniture: data.includeFurniture,
      city: 'Ashta',
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rent-agreement-${Date.now()}.pdf"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}