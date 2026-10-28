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

const SEED_CITIES = [
  {
    name: "Ashta",
    slug: "ashta",
    state: "Madhya Pradesh",
    lat: 23.0167,
    lng: 76.7167,
    description:
      "Ashta is a historic town in Sehore district known for its temples, colleges, and growing residential areas.",
    areas: [
      { name: "College Road", slug: "college-road" },
      { name: "Bus Stand", slug: "bus-stand" },
      { name: "Gandhi Chowk", slug: "gandhi-chowk" },
      { name: "Hospital Road", slug: "hospital-road" },
      { name: "Main Market", slug: "main-market" },
      { name: "Station Road", slug: "station-road" },
      { name: "Kannad Road", slug: "kannad-road" },
    ],
  },
  {
    name: "Kothri",
    slug: "kothri",
    state: "Madhya Pradesh",
    lat: 23.0833,
    lng: 76.8333,
    description:
      "Kothri is a growing town near Ashta, popular with students and families looking for affordable rentals.",
    areas: [
      { name: "Main Road", slug: "main-road" },
      { name: "Bus Stand", slug: "bus-stand" },
      { name: "Market Area", slug: "market-area" },
      { name: "Station Road", slug: "station-road" },
      { name: "Colony Area", slug: "colony-area" },
    ],
  },
  {
    name: "Sehore",
    slug: "sehore",
    state: "Madhya Pradesh",
    lat: 23.2,
    lng: 77.0833,
    description:
      "Sehore is the district headquarters, offering urban amenities, government offices, and quality schools.",
    areas: [
      { name: "Station Road", slug: "station-road" },
      { name: "Court Road", slug: "court-road" },
      { name: "Bus Stand", slug: "bus-stand" },
      { name: "Main Market", slug: "main-market" },
      { name: "Indore Road", slug: "indore-road" },
      { name: "Bhopal Road", slug: "bhopal-road" },
      { name: "Collectorate Area", slug: "collectorate-area" },
    ],
  },
];

export async function POST() {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    await connectDB();
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < SEED_CITIES.length; i++) {
      const c = SEED_CITIES[i];
      const exists = await City.findOne({ slug: c.slug });
      if (exists) {
        skipped++;
        continue;
      }
      await City.create({
        ...c,
        active: true,
        displayOrder: i,
        areas: c.areas.map((a) => ({ ...a, type: "area", active: true })),
      });
      created++;
    }

    clearCityCache();
    return ok({ created, skipped, total: SEED_CITIES.length });
  } catch (e) {
    return handleError(e);
  }
}
