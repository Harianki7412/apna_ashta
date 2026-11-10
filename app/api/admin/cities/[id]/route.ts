import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { City } from "@/models/City";
import { Property } from "@/models/Property";
import { clearCityCache } from "@/lib/cities-server";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { hasManagementTeamAccess } from "@/lib/role-access";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return hasManagementTeamAccess(s?.user?.role) ? s : null;
}

/* ═══════════════════════════════════════════════════════════
   PATCH: Update city
   Body: { district?, lat?, lng?, description?, active?, displayOrder? }
   Note: name is immutable after creation
   ═══════════════════════════════════════════════════════════ */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return fail("Forbidden", 403);

    const { id } = await ctx.params;
    const body = await req.json();
    const { district, lat, lng, description, active, displayOrder } = body;
    if (active !== undefined && typeof active !== "boolean") {
      return fail("Active must be a boolean", 400);
    }

    await connectDB();
    const city = await City.findById(id);
    if (!city) return fail("City not found", 404);

    if (district !== undefined) {
      if (typeof district !== "string" || district.trim().length < 2) {
        return fail("District name required (min 2 chars)", 400);
      }
      city.district = district.trim();
    }
    if (lat !== undefined) city.lat = lat;
    if (lng !== undefined) city.lng = lng;
    if (description !== undefined)
      city.description = description?.trim() || undefined;
    if (active !== undefined) city.active = active;
    if (displayOrder !== undefined) city.displayOrder = displayOrder;

    await city.save();
    clearCityCache();

    return ok(city);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══════════════════════════════════════════════════════════
   DELETE: Remove city (only if no properties exist)
   ═══════════════════════════════════════════════════════════ */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return fail("Forbidden", 403);

    const { id } = await ctx.params;
    await connectDB();

    const city = await City.findById(id);
    if (!city) return fail("City not found", 404);

    // Check for existing properties
    const propCount = await Property.countDocuments({ city: city.name });
    if (propCount > 0) {
      return fail(
        `Cannot delete — ${propCount} properties exist in "${city.name}". Move or delete them first.`,
        400,
      );
    }

    await City.findByIdAndDelete(id);
    clearCityCache();

    await logActivity({
      actor: session.user.id,
      action: "plan_delete",
      targetType: "setting",
      targetId: id,
      targetLabel: `City: ${city.name}`,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
