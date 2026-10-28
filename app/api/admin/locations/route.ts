import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { City } from "@/models/City";
import { clearCityCache } from "@/lib/cities-server";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

/* ═══ GET: List owner-added cities and areas ═══ */
export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const sp = new URL(req.url).searchParams;
    const type = sp.get("type") || "cities"; // 'cities' | 'areas'

    await connectDB();

    if (type === "cities") {
      const cities = await City.find({ isOwnerAdded: true })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .lean();
      return ok(cities);
    }

    // Areas — flatten from all cities
    const cities = await City.find({ "areas.isOwnerAdded": true })
      .populate("createdBy", "name email")
      .lean();

    const areas: any[] = [];
    cities.forEach((c: any) => {
      c.areas
        .filter((a: any) => a.isOwnerAdded)
        .forEach((a: any) => {
          areas.push({
            ...a,
            cityId: c._id.toString(),
            cityName: c.name,
            stateName: c.stateName,
            cityCreatedBy: c.createdBy,
          });
        });
    });
    areas.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return ok(areas);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ DELETE: Remove a bad owner-added city/area ═══ */
export async function DELETE(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const sp = new URL(req.url).searchParams;
    const type = sp.get("type");
    const cityId = sp.get("cityId");
    const areaId = sp.get("areaId");

    await connectDB();

    if (type === "city" && cityId) {
      await City.findByIdAndDelete(cityId);
      clearCityCache();
      return ok({ deleted: true });
    }

    if (type === "area" && cityId && areaId) {
      const city = await City.findById(cityId);
      if (!city) return fail("City not found", 404);
      city.areas = city.areas.filter(
        (a: any) => a._id.toString() !== areaId,
      ) as any;
      await city.save();
      clearCityCache();
      return ok({ deleted: true });
    }

    return fail("Invalid request");
  } catch (e) {
    return handleError(e);
  }
}
