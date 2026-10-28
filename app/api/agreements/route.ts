import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { RentAgreement } from "@/models/RentAgreement";
import { Conversation } from "@/models/Conversation";
import { notifyUser } from "@/lib/notify";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { agreementSchema } from "@/lib/validators";

/* ─── GET: list agreements for current user ─── */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const me = (session.user as any).id;
    await connectDB();

    const [asOwner, asTenant] = await Promise.all([
      RentAgreement.find({ owner: me })
        .populate("property", "title images area city")
        .populate("tenant", "name email phone")
        .sort({ createdAt: -1 })
        .lean(),
      RentAgreement.find({ tenant: me })
        .populate("property", "title images area city")
        .populate("owner", "name email phone")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return ok({ asOwner, asTenant });
  } catch (e) {
    return handleError(e);
  }
}

/* ─── POST: owner sends new agreement ─── */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const body = await req.json();
    const { tenantId, ...agreementData } = body;

    const me = (session.user as any).id;
    const role = (session.user as any).role;

    if (!tenantId) return fail("Tenant is required");

    const data = agreementSchema.parse({ ...agreementData, tenantId });

    await connectDB();
    const property = await Property.findById(data.propertyId).lean();
    if (!property) return fail("Property not found", 404);

    if (property.owner.toString() !== me && role !== "admin") {
      return fail("You can only send agreements for your properties", 403);
    }

    const tenant = await User.findById(tenantId)
      .select("name email phone")
      .lean();
    if (!tenant) return fail("Tenant not found", 404);

    // Verify conversation exists (anti-spam)
    const convo = await Conversation.findOne({
      property: data.propertyId,
      participants: { $all: [me, tenantId] },
    });
    if (!convo) {
      return fail(
        "You must chat with this tenant about the property first",
        403,
      );
    }

    // Check for existing active agreement with same tenant for same property
    const existing = await RentAgreement.findOne({
      property: data.propertyId,
      tenant: tenantId,
      status: { $in: ["pending", "confirmed"] },
    });
    if (existing) {
      return fail(
        existing.status === "pending"
          ? "An agreement is already pending with this tenant"
          : "An active agreement already exists with this tenant for this property",
        409,
      );
    }

    const agreement = await RentAgreement.create({
      property: data.propertyId,
      owner: me,
      tenant: tenantId,
      status: "pending",
      details: {
        place: data.place,
        agreementDate: new Date(data.agreementDate),
        ownerName: data.ownerName,
        ownerFatherName: data.ownerFatherName,
        ownerAddress: data.ownerAddress,
        tenantName: data.tenantName,
        tenantFatherName: data.tenantFatherName,
        tenantOfficeOrInstitution: data.tenantOfficeOrInstitution,
        tenantAddress: data.tenantAddress,
        propertyAddress: data.propertyAddress,
        startDate: new Date(data.startDate),
        expiryDate: new Date(data.expiryDate),
        rentAmount: data.rentAmount,
        maintenanceCharge: data.maintenanceCharge,
        securityDeposit: data.securityDeposit,
        chequeNumber: data.chequeNumber,
        chequeDate: data.chequeDate ? new Date(data.chequeDate) : undefined,
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
      },
    });

    // Notify tenant
    await notifyUser(tenantId, {
      type: "agreement_sent",
      title: "📝 New rent agreement to review",
      body: `Owner sent you a rent agreement for "${property.title}"`,
      link: `/agreements/${agreement._id}`,
      email: true,
      emailData: {
        ownerName: session.user?.name || "Owner",
        propertyTitle: property.title,
        agreementId: agreement._id.toString(),
      },
    });

    return ok({ agreement }, 201);
  } catch (e) {
    return handleError(e);
  }
}
