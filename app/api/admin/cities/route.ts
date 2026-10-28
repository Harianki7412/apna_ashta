import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { State } from "@/models/State";
import { City } from "@/models/City";
import { Property } from "@/models/Property";
import { clearCityCache } from "@/lib/cities-server";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ═══════════════════════════════════════════════════════════
   GET: List all cities (with property counts + state info)
   Query: ?state=<stateId> optional
   ═══════════════════════════════════════════════════════════ */
export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const sp = new URL(req.url).searchParams;
    const stateId = sp.get("state");
    const search = sp.get("q");

    await connectDB();

    const query: any = {};
    if (stateId) query.state = stateId;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { slug: new RegExp(search, "i") },
      ];
    }

    const cities = await City.find(query)
      .populate("state", "name slug code lat lng")
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Property counts per city
    const counts = await Property.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => {
      countMap[c._id] = c.count;
    });

    const enriched = cities.map((c: any) => ({
      ...c,
      propertyCount: countMap[c.name] || 0,
    }));

    return ok(enriched);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══════════════════════════════════════════════════════════
   POST: Create new city
   Body: { name, stateId, lat?, lng?, description? }
   ═══════════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return fail("Forbidden", 403);

    const body = await req.json();
    const { name, stateId, lat, lng, description } = body;

    if (!name?.trim() || name.length < 2) {
      return fail("City name required (min 2 chars)", 400);
    }
    if (!stateId) return fail("State is required", 400);

    await connectDB();

    const state = await State.findById(stateId);
    if (!state) return fail("State not found", 404);

    const slug = slugify(name);

    // Unique per state (allows "Main Market" in both Ashta and Bhopal)
    const existing = await City.findOne({ state: stateId, slug });
    if (existing) {
      return fail("City with this name already exists in this state", 409);
    }

    const city = await City.create({
      name: name.trim(),
      slug,
      state: stateId,
      stateName: state.name,
      lat: lat || state.lat || 23.5,
      lng: lng || state.lng || 78.5,
      description: description?.trim() || undefined,
      active: true,
      createdBy: (session.user as any).id,
      isOwnerAdded: false,
      areas: [],
    });

    clearCityCache();

    await logActivity({
      actor: (session.user as any).id,
      action: "plan_create",
      targetType: "setting",
      targetId: city._id.toString(),
      targetLabel: `City: ${city.name} (${state.name})`,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    return ok(city, 201);
  } catch (e) {
    return handleError(e);
  }
}
