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

/* ═══ GET: List all states with city counts ═══ */
export async function GET() {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);
    await connectDB();

    const states = await State.find({})
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    const counts = await City.aggregate([
      { $group: { _id: "$state", cityCount: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => {
      countMap[c._id?.toString()] = c.cityCount;
    });

    return ok(
      states.map((s: any) => ({
        ...s,
        cityCount: countMap[s._id.toString()] || 0,
      })),
    );
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ POST: Create state ═══ */
export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const { name, code, lat, lng } = await req.json();
    if (!name?.trim() || name.length < 2) return fail("State name required");

    await connectDB();
    const slug = slugify(name);
    const exists = await State.findOne({
      $or: [{ name: name.trim() }, { slug }],
    });
    if (exists) return fail("State already exists");

    const state = await State.create({
      name: name.trim(),
      slug,
      code: code?.toUpperCase(),
      lat: lat || undefined,
      lng: lng || undefined,
      active: true,
    });

    clearCityCache();
    return ok(state, 201);
  } catch (e) {
    return handleError(e);
  }
}
