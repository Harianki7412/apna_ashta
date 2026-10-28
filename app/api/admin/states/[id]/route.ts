import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { State } from "@/models/State";
import { City } from "@/models/City";
import { clearCityCache } from "@/lib/cities-server";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const { id } = await ctx.params;
    const { name, code, lat, lng, active, displayOrder } = await req.json();

    await connectDB();
    const state = await State.findById(id);
    if (!state) return fail("State not found", 404);

    // Allow name change but sync to cities
    if (name !== undefined && name.trim() && name.trim() !== state.name) {
      state.name = name.trim();
      await City.updateMany({ state: id }, { stateName: name.trim() });
    }
    if (code !== undefined) state.code = code?.toUpperCase();
    if (lat !== undefined) state.lat = lat;
    if (lng !== undefined) state.lng = lng;
    if (active !== undefined) state.active = active;
    if (displayOrder !== undefined) state.displayOrder = displayOrder;

    await state.save();
    clearCityCache();
    return ok(state);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const { id } = await ctx.params;
    await connectDB();

    const state = await State.findById(id);
    if (!state) return fail("State not found", 404);

    const cityCount = await City.countDocuments({ state: id });
    if (cityCount > 0) {
      return fail(
        `Cannot delete — ${cityCount} cities exist in "${state.name}".`,
        400,
      );
    }

    await State.findByIdAndDelete(id);
    clearCityCache();
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
