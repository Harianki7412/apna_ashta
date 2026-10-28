import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notifyUser } from "@/lib/notify";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return fail("Forbidden", 403);
    }

    const { id } = await ctx.params;
    const { action, notes } = await req.json();
    // action: 'verify' | 'unverify'

    await connectDB();
    const property = await Property.findById(id).populate("owner", "name");
    if (!property) return fail("Property not found", 404);

    if (action === "verify") {
      property.verified = true;
      property.verifiedAt = new Date();
      property.verifiedBy = (session.user as any).id;
      property.verificationNotes = notes;

      if (property.owner) {
        await notifyUser(property.owner.toString(), {
          type: "system",
          title: "✓ Property Verified!",
          body: `"${property.title}" is now marked as Physically Verified. Tenants trust verified properties more.`,
          link: `/properties/${id}`,
          email: true,
        });
      }
    } else if (action === "unverify") {
      property.verified = false;
      property.verifiedAt = undefined;
      property.verifiedBy = undefined;
      property.verificationNotes = undefined;
    } else {
      return fail("Invalid action");
    }

    await property.save();

    await logActivity({
      actor: (session.user as any).id,
      action: action === "verify" ? "approve" : "reject",
      targetType: "property",
      targetId: id,
      targetLabel: `Property ${action === "verify" ? "Verified" : "Unverified"}`,
      metadata: { verified: action === "verify" },
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    return ok({ verified: property.verified });
  } catch (e) {
    return handleError(e);
  }
}
