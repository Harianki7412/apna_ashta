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
    if (property.owner._id.toString() !== me && role !== 'admin') {
      return fail('Forbidden', 403);
    }

    const pdfBytes = await generateRentAgreement({
      place: data.place,
      agreementDate: data.agreementDate,

      ownerName: data.ownerName,
      ownerFatherName: data.ownerFatherName,
      ownerAddress: data.ownerAddress,

      tenantName: data.tenantName,
      tenantFatherName: data.tenantFatherName,
      tenantOfficeOrInstitution: data.tenantOfficeOrInstitution,
      tenantAddress: data.tenantAddress,

      propertyAddress: data.propertyAddress || property.address,
      propertyType: property.propertyType,
      bhk: property.bhk,

      startDate: data.startDate,
      expiryDate: data.expiryDate,
      rentAmount: data.rentAmount,
      maintenanceCharge: data.maintenanceCharge,
      securityDeposit: data.securityDeposit,
      chequeNumber: data.chequeNumber,
      chequeDate: data.chequeDate,
      noticePeriodDays: data.noticePeriodDays,
      city: data.city,

      bedrooms: data.bedrooms,
      fans: data.fans,
      cflLights: data.cflLights,
      geysers: data.geysers,
      mirrors: data.mirrors,

      witness1Name: data.witness1Name,
      witness1Address: data.witness1Address,
      witness2Name: data.witness2Name,
      witness2Address: data.witness2Address,
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