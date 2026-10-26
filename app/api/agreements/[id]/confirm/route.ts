import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { RentAgreement } from '@/models/RentAgreement';
import { notifyUser } from '@/lib/notify';
import { uploadAny } from '@/lib/cloudinary';
import { generateRentAgreement } from '@/lib/pdf/rentAgreement';
import { ok, fail, handleError } from '@/lib/api-helpers';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_: Request, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { id } = await ctx.params;
    const me = (session.user as any).id;

    await connectDB();
    const agreement: any = await RentAgreement.findById(id);
    if (!agreement) return fail('Not found', 404);

    if (agreement.tenant.toString() !== me) {
      return fail('Only the tenant can confirm this agreement', 403);
    }
    if (agreement.status !== 'pending') {
      return fail(`Agreement is already ${agreement.status}`);
    }

    const d = agreement.details;

    // Generate PDF
    const pdfBytes = await generateRentAgreement({
      place: d.place,
      agreementDate: d.agreementDate?.toISOString() || new Date().toISOString(),
      ownerName: d.ownerName,
      ownerFatherName: d.ownerFatherName,
      ownerAddress: d.ownerAddress,
      tenantName: d.tenantName,
      tenantFatherName: d.tenantFatherName,
      tenantOfficeOrInstitution: d.tenantOfficeOrInstitution,
      tenantAddress: d.tenantAddress,
      propertyAddress: d.propertyAddress,
      propertyType: '',
      bhk: '',
      startDate: d.startDate?.toISOString() || '',
      expiryDate: d.expiryDate?.toISOString() || '',
      rentAmount: d.rentAmount,
      maintenanceCharge: d.maintenanceCharge || 0,
      securityDeposit: d.securityDeposit || 0,
      chequeNumber: d.chequeNumber || '',
      chequeDate: d.chequeDate?.toISOString() || '',
      noticePeriodDays: d.noticePeriodDays || 30,
      city: d.city,
      bedrooms: d.bedrooms || 1,
      fans: d.fans || 0,
      cflLights: d.cflLights || 0,
      geysers: d.geysers || 0,
      mirrors: d.mirrors || 0,
      witness1Name: d.witness1Name,
      witness1Address: d.witness1Address,
      witness2Name: d.witness2Name,
      witness2Address: d.witness2Address,
    });

    // Upload to Cloudinary
    const buffer = Buffer.from(pdfBytes);
    const pdfUrl = await uploadAny(buffer, 'apna-ashta/agreements');

    // Update agreement
    agreement.status = 'confirmed';
    agreement.tenantConfirmedAt = new Date();
    agreement.pdfUrl = pdfUrl;
    await agreement.save();

    // Notify owner
    await notifyUser(agreement.owner.toString(), {
      type: 'system',
      title: '✅ Rent agreement confirmed!',
      body: `Tenant confirmed the agreement. PDF is ready to download.`,
      link: `/agreements/${id}`,
      email: true,
    });

    return ok({ confirmed: true, pdfUrl });
  } catch (e) {
    return handleError(e);
  }
}