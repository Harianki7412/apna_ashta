import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { City } from "@/models/City";
import { clearCityCache } from "@/lib/cities-server";
import { ok, fail, handleError } from "@/lib/api-helpers";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ═══════════════════════════════════════════════════════════
   POST: Owner adds a new area/colony to a city
   Body: { cityId, name, type?, description? }
   ═══════════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const role = (session.user as any).role;
    if (!["owner", "admin"].includes(role)) {
      return fail("Only owners can add areas", 403);
    }

    const body = await req.json();
    const { cityId, name, type = "area", description } = body;

    if (!cityId) {
      return fail("City is required", 400);
    }
    if (!name?.trim() || name.length < 2) {
      return fail("Area name required (min 2 chars)", 400);
    }

    await connectDB();

    const city = await City.findById(cityId);
    if (!city) {
      return fail("City not found", 404);
    }

    const slug = slugify(name);

    // Check if area already exists
    const existing = city.areas.find(
      (a: any) =>
        a.slug === slug || a.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      return ok(existing);
    }

    // Add area
    const area = {
      name: name.trim(),
      slug,
      type,
      description: description?.trim() || undefined,
      active: true,
      createdBy: (session.user as any).id,
      isOwnerAdded: true,
    };

    city.areas.push(area as any);
    await city.save();

    clearCityCache();

    return ok(city.areas[city.areas.length - 1], 201);
  } catch (e) {
    return handleError(e);
  }
}
