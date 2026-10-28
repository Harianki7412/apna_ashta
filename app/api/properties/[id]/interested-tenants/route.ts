import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { Conversation } from "@/models/Conversation";
import { RentAgreement } from "@/models/RentAgreement";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const { id } = await params;
    const me = (session.user as any).id;
    const role = (session.user as any).role;

    await connectDB();
    const property = await Property.findById(id).lean();
    if (!property) return fail("Property not found", 404);

    // Only owner or admin
    if (property.owner.toString() !== me && role !== "admin") {
      return fail("Forbidden", 403);
    }

    // Get conversations about this property
    const convos = await Conversation.find({ property: id })
      .populate("participants", "name email phone")
      .lean();

    // Extract unique tenants (not the owner)
    const tenantsMap = new Map<string, any>();
    convos.forEach((c: any) => {
      c.participants?.forEach((p: any) => {
        if (p._id.toString() !== property.owner.toString()) {
          tenantsMap.set(p._id.toString(), {
            _id: p._id,
            name: p.name,
            email: p.email,
            phone: p.phone,
            lastMessage: c.lastMessageAt,
          });
        }
      });
    });

    // Check which tenants already have active agreements
    const activeAgreements = await RentAgreement.find({
      property: id,
      status: { $in: ["pending", "confirmed"] },
    })
      .select("tenant status")
      .lean();

    const activeTenantIds = new Set(
      activeAgreements.map((a: any) => a.tenant.toString()),
    );

    const tenants = Array.from(tenantsMap.values()).map((t) => ({
      ...t,
      hasActiveAgreement: activeTenantIds.has(t._id.toString()),
    }));

    return ok(tenants);
  } catch (e) {
    return handleError(e);
  }
}
