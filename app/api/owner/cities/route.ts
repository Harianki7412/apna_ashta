import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { State } from "@/models/State";
import { City } from "@/models/City";
import { clearCityCache } from "@/lib/cities-server";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { hasOwnerAccess } from "@/lib/role-access";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ═══════════════════════════════════════════════════════════
   POST: Owner adds a new city
   Body: { name, district, stateId, lat?, lng? }
   ═══════════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const role = session.user.role;
    if (!hasOwnerAccess(role)) {
      return fail("Only owners can add cities", 403);
    }

    const body = await req.json();
    const { name, district, stateId, lat, lng } = body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return fail("City name required (min 2 chars)", 400);
    }
    if (typeof stateId !== "string" || !stateId) {
      return fail("State is required", 400);
    }
    if (typeof district !== "string" || district.trim().length < 2) {
      return fail("District name required (min 2 chars)", 400);
    }

    await connectDB();

    // Verify state exists
    const state = await State.findOne({ _id: stateId, active: true });
    if (!state) {
      return fail("State not found", 404);
    }

    const cityName = name.trim();
    const districtName = district.trim();
    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const existing = await City.findOne({
      state: stateId,
      district: new RegExp(`^${escapeRegex(districtName)}$`, "i"),
      name: new RegExp(`^${escapeRegex(cityName)}$`, "i"),
    });
    if (existing) {
      // Repeated submissions return the existing request instead of creating duplicates.
      if (existing.isOwnerAdded && !existing.active) return ok(existing);
      return fail(
        existing.active
          ? "This city is already approved"
          : "This city already exists and can be reactivated by an admin",
        409,
      );
    }

    const baseSlug = slugify(cityName);
    if (!baseSlug) return fail("City name must contain letters or numbers", 400);
    let slug = baseSlug;
    if (await City.exists({ slug })) slug = `${baseSlug}-${slugify(districtName)}`;
    if (await City.exists({ slug })) slug = `${slug}-${state.code?.toLowerCase() || state.slug}`;
    let suffix = 2;
    while (await City.exists({ slug })) {
      slug = `${baseSlug}-${slugify(districtName)}-${suffix++}`;
    }

    const city = await City.create({
      name: cityName,
      district: districtName,
      slug,
      state: stateId,
      stateName: state.name,
      lat: lat || state.lat || 23.5,
      lng: lng || state.lng || 78.5,
      active: false,
      createdBy: session.user.id,
      isOwnerAdded: true,
      areas: [],
    });

    clearCityCache();

    return ok(city, 201);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══════════════════════════════════════════════════════════
   GET: Optional — list owner-added cities
   ═══════════════════════════════════════════════════════════ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);
    if (!hasOwnerAccess(session.user.role)) {
      return fail("Only owners can view their suggestions", 403);
    }

    await connectDB();
    const cities = await City.find({
      isOwnerAdded: true,
      createdBy: session.user.id,
    })
      .populate("state", "name slug")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return ok(cities);
  } catch (e) {
    return handleError(e);
  }
}
