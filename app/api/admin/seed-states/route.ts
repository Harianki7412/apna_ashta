import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { State } from "@/models/State";
import { City } from "@/models/City";
import { clearCityCache } from "@/lib/cities-server";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { hasManagementTeamAccess } from "@/lib/role-access";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return hasManagementTeamAccess(s?.user?.role) ? s : null;
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
  { name: "Andhra Pradesh", code: "AP", lat: 15.9129, lng: 79.74 },
  { name: "Arunachal Pradesh", code: "AR", lat: 28.218, lng: 94.7278 },
  { name: "Assam", code: "AS", lat: 26.2006, lng: 92.9376 },
  { name: "Bihar", code: "BR", lat: 25.0961, lng: 85.3131 },
  { name: "Chhattisgarh", code: "CG", lat: 21.2787, lng: 81.8661 },
  { name: "Goa", code: "GA", lat: 15.2993, lng: 74.124 },
  { name: "Gujarat", code: "GJ", lat: 22.2587, lng: 71.1924 },
  { name: "Haryana", code: "HR", lat: 29.0588, lng: 76.0856 },
  { name: "Himachal Pradesh", code: "HP", lat: 31.1048, lng: 77.1734 },
  { name: "Jharkhand", code: "JH", lat: 23.6102, lng: 85.2799 },
  { name: "Karnataka", code: "KA", lat: 15.3173, lng: 75.7139 },
  { name: "Kerala", code: "KL", lat: 10.8505, lng: 76.2711 },
  { name: "Madhya Pradesh", code: "MP", lat: 23.5, lng: 78.5 },
  { name: "Maharashtra", code: "MH", lat: 19.7, lng: 75.7 },
  { name: "Manipur", code: "MN", lat: 24.6637, lng: 93.9063 },
  { name: "Meghalaya", code: "ML", lat: 25.467, lng: 91.3662 },
  { name: "Mizoram", code: "MZ", lat: 23.1645, lng: 92.9376 },
  { name: "Nagaland", code: "NL", lat: 26.1584, lng: 94.5624 },
  { name: "Odisha", code: "OD", lat: 20.9517, lng: 85.0985 },
  { name: "Punjab", code: "PB", lat: 31.1471, lng: 75.3412 },
  { name: "Rajasthan", code: "RJ", lat: 26.9, lng: 75.7 },
  { name: "Sikkim", code: "SK", lat: 27.533, lng: 88.5122 },
  { name: "Tamil Nadu", code: "TN", lat: 11.1271, lng: 78.6569 },
  { name: "Telangana", code: "TG", lat: 18.1124, lng: 79.0193 },
  { name: "Tripura", code: "TR", lat: 23.9408, lng: 91.9882 },
  { name: "Uttar Pradesh", code: "UP", lat: 26.8, lng: 80.9 },
  { name: "Uttarakhand", code: "UK", lat: 30.0668, lng: 79.0193 },
  { name: "West Bengal", code: "WB", lat: 22.9868, lng: 87.855 },
  { name: "Andaman and Nicobar Islands", code: "AN", lat: 11.7401, lng: 92.6586 },
  { name: "Chandigarh", code: "CH", lat: 30.7333, lng: 76.7794 },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DH", lat: 20.3974, lng: 72.8328 },
  { name: "Delhi", code: "DL", lat: 28.6139, lng: 77.209 },
  { name: "Jammu and Kashmir", code: "JK", lat: 33.7782, lng: 76.5762 },
  { name: "Ladakh", code: "LA", lat: 34.1526, lng: 77.5771 },
  { name: "Lakshadweep", code: "LD", lat: 10.5667, lng: 72.6417 },
  { name: "Puducherry", code: "PY", lat: 11.9416, lng: 79.8083 },
];

export async function POST() {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    await connectDB();
    const db = City.db.db;
    let removedGlobalNameIndex = false;
    if (
      db &&
      (await db
        .listCollections(
          { name: City.collection.collectionName },
          { nameOnly: true },
        )
        .hasNext())
    ) {
      const indexes = await City.collection.indexes();
      const globalNameIndex = indexes.find(
        (index) =>
          index.unique &&
          Object.keys(index.key || {}).length === 1 &&
          index.key?.name === 1,
      );
      if (globalNameIndex?.name) {
        await City.collection.dropIndex(globalNameIndex.name);
        removedGlobalNameIndex = true;
      }
    }

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

    const stateRecords = await State.find({ active: true })
      .select("_id name")
      .lean();
    const stateById = new Map(
      stateRecords.map((state) => [state._id.toString(), state]),
    );
    const stateByName = new Map(
      stateRecords.map((state) => [state.name.toLowerCase(), state]),
    );
    const stateIds = stateRecords.flatMap((state) => [
      state._id,
      state._id.toString(),
    ]);
    const stateNames = stateRecords.map((state) => state.name);
    const existingCities = await City.find({
      $or: [
        { state: { $in: [...stateIds, ...stateNames] } },
        { stateName: { $exists: false } },
        { stateName: null },
        { stateName: "" },
      ],
    })
      .select("_id state stateName")
      .lean();
    const cityStateUpdates = existingCities.flatMap((city) => {
      const stateValue = city.state?.toString() || "";
      const state =
        stateById.get(stateValue) ||
        stateByName.get(stateValue.toLowerCase()) ||
        stateByName.get(city.stateName?.toLowerCase() || "");
      if (!state) return [];
      if (
        stateValue === state._id.toString() &&
        city.stateName === state.name
      ) {
        return [];
      }
      return [
        {
          updateOne: {
            filter: { _id: city._id },
            update: {
              $set: { state: state._id.toString(), stateName: state.name },
            },
          },
        },
      ];
    });
    if (cityStateUpdates.length) {
      await City.bulkWrite(cityStateUpdates);
    }

    clearCityCache();
    return ok({
      created,
      skipped,
      total: SEED_STATES.length,
      mpId,
      removedGlobalNameIndex,
      migratedCities: cityStateUpdates.length,
    });
  } catch (e) {
    return handleError(e);
  }
}
