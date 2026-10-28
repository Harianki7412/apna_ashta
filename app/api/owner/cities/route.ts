import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { State } from "@/models/State";
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
   POST: Owner adds a new city
   Body: { name, stateId, lat?, lng? }
   ═══════════════════════════════════════════════════════════ */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);

    const role = (session.user as any).role;
    if (!["owner", "admin"].includes(role)) {
      return fail("Only owners can add cities", 403);
    }

    const body = await req.json();
    const { name, stateId, lat, lng } = body;

    if (!name?.trim() || name.length < 2) {
      return fail("City name required (min 2 chars)", 400);
    }
    if (!stateId) {
      return fail("State is required", 400);
    }

    await connectDB();

    // Verify state exists
    const state = await State.findById(stateId);
    if (!state) {
      return fail("State not found", 404);
    }

    const slug = slugify(name);

    // Check if city already exists in this state
    const existing = await City.findOne({ state: stateId, slug });
    if (existing) {
      // Return existing — no error (idempotent)
      return ok(existing);
    }

    // Create city
    const city = await City.create({
      name: name.trim(),
      slug,
      state: stateId,
      stateName: state.name,
      lat: lat || state.lat || 23.5,
      lng: lng || state.lng || 78.5,
      active: true,
      createdBy: (session.user as any).id,
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

    await connectDB();
    const cities = await City.find({ isOwnerAdded: true })
      .populate("state", "name slug")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return ok(cities);
  } catch (e) {
    return handleError(e);
  }
}
