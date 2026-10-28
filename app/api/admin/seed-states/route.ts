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

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SEED_STATES = [
  { name: "Madhya Pradesh", code: "MP", lat: 23.5, lng: 78.5 },
  { name: "Maharashtra", code: "MH", lat: 19.7, lng: 75.7 },
  { name: "Rajasthan", code: "RJ", lat: 26.9, lng: 75.7 },
  { name: "Uttar Pradesh", code: "UP", lat: 26.8, lng: 80.9 },
  { name: "Gujarat", code: "GJ", lat: 22.2, lng: 71.2 },
];

export async function POST() {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    await connectDB();
    let created = 0;
    let skipped = 0;
    let mpId: any = null;

    for (let i = 0; i < SEED_STATES.length; i++) {
      const s = SEED_STATES[i];
      const exists = await State.findOne({ slug: slugify(s.name) });
      if (exists) {
        if (s.code === "MP") mpId = exists._id;
        skipped++;
        continue;
      }
      const state = await State.create({
        name: s.name,
        slug: slugify(s.name),
        code: s.code,
        lat: s.lat,
        lng: s.lng,
        active: true,
        displayOrder: i,
      });
      if (s.code === "MP") mpId = state._id;
      created++;
    }

    // Migrate existing cities to MP state
    if (mpId) {
      const citiesWithoutState = await City.find({
        $or: [{ state: { $exists: false } }, { state: null }],
      });
      for (const c of citiesWithoutState) {
        c.state = mpId;
        c.stateName = "Madhya Pradesh";
        await c.save();
      }
      if (citiesWithoutState.length > 0) {
        console.log(
          `[Migrated] ${citiesWithoutState.length} cities to MP state`,
        );
      }
    }

    clearCityCache();
    return ok({ created, skipped, total: SEED_STATES.length, mpId });
  } catch (e) {
    return handleError(e);
  }
}
