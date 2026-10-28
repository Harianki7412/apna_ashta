import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notifyUser } from "@/lib/notify";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

/* ═══════════════════════════════════════════════════════════
   GET /api/admin/properties?status=pending&page=1
   List properties by status with pagination
   ═══════════════════════════════════════════════════════════ */
export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const sp = new URL(req.url).searchParams;
    const status = sp.get("status") || "pending";
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = 20;
    const search = sp.get("q");

    const query: any = { status };

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { area: new RegExp(search, "i") },
        { city: new RegExp(search, "i") },
      ];
    }

    await connectDB();

    const [items, total] = await Promise.all([
      Property.find(query)
        .populate("owner", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Property.countDocuments(query),
    ]);

    return ok({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return handleError(e);
  }
}

/* ═══════════════════════════════════════════════════════════
   PATCH /api/admin/properties
   Body: { id, status } — approve/reject/rented
   ═══════════════════════════════════════════════════════════ */
export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return fail("Forbidden", 403);

    const { id, status } = await req.json();

    if (!id) return fail("Property ID required");
    if (!["approved", "rejected", "rented"].includes(status)) {
      return fail("Invalid status");
    }

    await connectDB();

    const property = await Property.findById(id);
    if (!property) return fail("Property not found", 404);

    const oldStatus = property.status;
    property.status = status;
    await property.save();

    // Update populated version for notification
    const updated = await Property.findById(id)
      .populate("owner", "name email")
      .lean();
    if (!updated) return fail("Not found", 404);

    // ═══ Activity Log ═══
    await logActivity({
      actor: (session.user as any).id,
      action: status === "approved" ? "approve" : "reject",
      targetType: "property",
      targetId: id,
      targetLabel: (updated as any).title,
      metadata: { from: oldStatus, to: status },
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    // ═══ Notify owner ═══
    if ((updated as any).owner?._id) {
      await notifyUser((updated as any).owner._id.toString(), {
        type: status === "approved" ? "property_approved" : "property_rejected",
        title:
          status === "approved"
            ? "Your property is live!"
            : "Property rejected",
        body: (updated as any).title,
        link: `/properties/${id}`,
        email: true,
        emailData: {
          propertyTitle: (updated as any).title,
          propertyId: id,
        },
      });
    }

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══════════════════════════════════════════════════════════
   DELETE /api/admin/properties?id=xxx
   Delete a property (admin override)
   ═══════════════════════════════════════════════════════════ */
export async function DELETE(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return fail("Forbidden", 403);

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return fail("Property ID required");

    await connectDB();
    const property = await Property.findById(id);
    if (!property) return fail("Property not found", 404);

    await logActivity({
      actor: (session.user as any).id,
      action: "delete",
      targetType: "property",
      targetId: id,
      targetLabel: property.title,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    await property.deleteOne();
    return ok({ deleted: true, id });
  } catch (e) {
    return handleError(e);
  }
}
