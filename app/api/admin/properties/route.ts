import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { notifyUser } from "@/lib/notify";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);
    const sp = new URL(req.url).searchParams;
    const status = sp.get("status") || "pending";
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = 20;
    await connectDB();
    const [items, total] = await Promise.all([
      Property.find({ status })
        .populate("owner", "name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Property.countDocuments({ status }),
    ]);
    return ok({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);
    const { id, status } = await req.json();
    if (!["approved", "rejected", "rented"].includes(status))
      return fail("Invalid status");
    await connectDB();
    const updated = await Property.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!updated) return fail("Not found", 404);

    await notifyUser(updated.owner.toString(), {
      type: status === "approved" ? "property_approved" : "property_rejected",
      title:
        status === "approved" ? "Your property is live!" : "Property rejected",
      body: updated.title,
      link: `/properties/${updated._id}`,
      email: true,
      emailData: {
        propertyTitle: updated.title,
        propertyId: updated._id.toString(),
      },
    });

    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}
