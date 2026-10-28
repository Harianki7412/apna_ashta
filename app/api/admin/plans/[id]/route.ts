import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Plan } from "@/models/Plan";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

/* ═══ PATCH: Update plan ═══ */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const { id } = await ctx.params;
    const body = await req.json();

    await connectDB();

    // Whitelist updatable fields
    const allowed = [
      "name",
      "description",
      "price",
      "yearlyPrice",
      "billingCycle",
      "icon",
      "color",
      "recommended",
      "badge",
      "features",
      "listingLimit",
      "photosPerListing",
      "leadsPerProperty",
      "isFree",
      "leadsIncluded",
      "validityDays",
      "featuredDays",
      "featuredTier",
      "displayOrder",
      "hidden",
      "active",
    ];

    const update: any = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    update.updatedAt = new Date();

    const plan = await Plan.findByIdAndUpdate(id, update, { new: true });
    if (!plan) return fail("Plan not found", 404);

    return ok(plan);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ DELETE: Soft delete (set active=false) ═══ */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const { id } = await ctx.params;
    const hard = new URL(req.url).searchParams.get("hard") === "true";

    await connectDB();

    if (hard) {
      await Plan.findByIdAndDelete(id);
      return ok({ deleted: true, hard: true });
    }

    await Plan.findByIdAndUpdate(id, { active: false, hidden: true });
    return ok({ deleted: true, hard: false });
  } catch (e) {
    return handleError(e);
  }
}
