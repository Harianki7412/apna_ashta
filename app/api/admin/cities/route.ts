import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { State } from "@/models/State";
import { City } from "@/models/City";
import { Property } from "@/models/Property";
import { clearCityCache } from "@/lib/cities-server";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { hasFullAdminAccess } from "@/lib/role-access";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return hasFullAdminAccess(s?.user?.role) ? s : null;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    const status = sp.get("status");

    await connectDB();

    const query: any = {};
    if (stateId) query.state = stateId;
    if (status === "pending") {
      query.active = false;
      query.isOwnerAdded = true;
    } else if (status === "active") {
      query.active = true;
    } else if (status === "inactive") {
      query.active = false;
    }
    if (search) {
      query.$or = [
        { name: new RegExp(escapeRegex(search), "i") },
        { district: new RegExp(escapeRegex(search), "i") },
        { slug: new RegExp(escapeRegex(search), "i") },
      ];
    }

    const [cities, states] = await Promise.all([
      City.find(query)
        .populate("createdBy", "name email")
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      State.find({ active: true }).select("name slug code lat lng").lean(),
    ]);
    const stateMap = new Map(
      states.map((state: any) => [state._id.toString(), state]),
    );

    // Property counts per city
    const counts = await Property.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: { city: "$city", state: "$state", district: "$district" },
          count: { $sum: 1 },
        },
      },
    ]);
    const countMap = new Map<string, number>();
    counts.forEach((c: any) => {
      const { city, state, district } = c._id;
      countMap.set(`${city}\0${state || ""}\0${district || ""}`, c.count);
    });

    const enriched = cities.map((c: any) => {
      const state = stateMap.get(c.state?.toString());
      const stateName = c.stateName || state?.name || "";
      return {
        ...c,
        state: state || c.state,
        stateName,
        propertyCount:
          countMap.get(`${c.name}\0${stateName}\0${c.district || ""}`) || 0,
      };
    });

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
    const { name, district, stateId, lat, lng, description } = body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return fail("City name required (min 2 chars)", 400);
    }
    if (typeof district !== "string" || district.trim().length < 2) {
      return fail("District name required (min 2 chars)", 400);
    }
    if (!stateId) return fail("State is required", 400);

    await connectDB();

    const state = await State.findOne({ _id: stateId, active: true });
    if (!state) return fail("State not found", 404);

    const cityName = name.trim();
    const districtName = district.trim();

    const existing = await City.findOne({
      state: stateId,
      district: new RegExp(`^${escapeRegex(districtName)}$`, "i"),
      name: new RegExp(`^${escapeRegex(cityName)}$`, "i"),
    });
    if (existing && !(existing.isOwnerAdded && !existing.active)) {
      return fail("City already exists in this district", 409);
    }

    const baseSlug = slugify(cityName);
    let slug = existing?.slug || baseSlug;
    if (!existing && (await City.exists({ slug }))) {
      slug = `${baseSlug}-${slugify(districtName)}`;
    }
    if (!existing && (await City.exists({ slug }))) {
      slug = `${slug}-${state.code?.toLowerCase() || state.slug}`;
    }
    let suffix = 2;
    while (!existing && (await City.exists({ slug }))) {
      slug = `${baseSlug}-${slugify(districtName)}-${suffix++}`;
    }
    if (!slug) return fail("City name must contain letters or numbers", 400);

    const city = existing
      ? await City.findByIdAndUpdate(
          existing._id,
          {
            $set: {
              active: true,
              lat: lat || existing.lat,
              lng: lng || existing.lng,
              description: description?.trim() || existing.description,
              stateName: state.name,
            },
          },
          { new: true },
        )
      : await City.create({
          name: cityName,
          district: districtName,
          slug,
          state: stateId,
          stateName: state.name,
          lat: lat || state.lat || 23.5,
          lng: lng || state.lng || 78.5,
          description: description?.trim() || undefined,
          active: true,
          createdBy: session.user.id,
          isOwnerAdded: false,
          areas: [],
        });

    clearCityCache();

    await logActivity({
      actor: session.user.id,
      action: "plan_create",
      targetType: "setting",
      targetId: city!._id.toString(),
      targetLabel: `City: ${city!.name}, ${districtName} (${state.name})`,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    return ok(city, existing ? 200 : 201);
  } catch (e) {
    return handleError(e);
  }
}
