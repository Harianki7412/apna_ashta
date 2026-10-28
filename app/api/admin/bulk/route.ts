import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notifyUser } from "@/lib/notify";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return fail("Forbidden", 403);
    }

    const body = await req.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return fail("No items selected");
    }
    if (ids.length > 100) {
      return fail("Max 100 items per bulk action");
    }
    if (
      !["approve", "reject", "delete", "feature", "unfeature"].includes(action)
    ) {
      return fail("Invalid action");
    }

    await connectDB();

    const admin = (session.user as any).id;
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const ua = req.headers.get("user-agent") || "";

    let affected = 0;

    /* ═══ APPROVE / REJECT ═══ */
    if (action === "approve" || action === "reject") {
      const status = action === "approve" ? "approved" : "rejected";

      const result = await Property.updateMany(
        { _id: { $in: ids } },
        { status },
      );
      affected = result.modifiedCount;

      // Notify each owner
      const props = await Property.find({ _id: { $in: ids } })
        .populate("owner", "name")
        .lean();

      for (const p of props as any[]) {
        if (p.owner?._id) {
          await notifyUser(p.owner._id.toString(), {
            type:
              status === "approved" ? "property_approved" : "property_rejected",
            title:
              status === "approved"
                ? "Your property is live!"
                : "Property rejected",
            body: p.title,
            link: `/properties/${p._id}`,
            email: true,
            emailData: {
              propertyTitle: p.title,
              propertyId: p._id.toString(),
            },
          });
        }
      }

      await logActivity({
        actor: admin,
        action: action === "approve" ? "bulk_approve" : "bulk_reject",
        targetType: "property",
        metadata: { ids, count: affected },
        ip,
        userAgent: ua,
      });
    } else if (action === "delete") {

    /* ═══ DELETE ═══ */
      const props = await Property.find({ _id: { $in: ids } })
        .select("_id title")
        .lean();

      const result = await Property.deleteMany({ _id: { $in: ids } });
      affected = result.deletedCount;

      await logActivity({
        actor: admin,
        action: "bulk_delete",
        targetType: "property",
        metadata: {
          ids,
          titles: props.map((p: any) => p.title),
        },
        ip,
        userAgent: ua,
      });
    } else if (action === "feature" || action === "unfeature") {

    /* ═══ FEATURE / UNFEATURE ═══ */
      const featured = action === "feature";

      const result = await Property.updateMany(
        { _id: { $in: ids } },
        {
          featured,
          featuredUntil: featured
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        },
      );
      affected = result.modifiedCount;
    }

    return ok({ affected, action, count: ids.length });
  } catch (e) {
    return handleError(e);
  }
}
