import { connectDB } from "./mongodb";
import { State } from "@/models/State";
import { City } from "@/models/City";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

export interface StateData {
  _id: string;
  name: string;
  slug: string;
  code?: string;
  lat?: number;
  lng?: number;
}

export interface CityArea {
  _id?: string;
  name: string;
  slug: string;
  type?: string;
  active?: boolean;
  isOwnerAdded?: boolean;
}

export interface CityData {
  _id: string;
  name: string;
  slug: string;
  state: string; // state ObjectId as string
  stateName: string;
  stateSlug?: string;
  lat: number;
  lng: number;
  description?: string;
  areas: CityArea[];
  active: boolean;
  isOwnerAdded?: boolean;
}

/* ═══════════════════════════════════════════════════════════
   CACHE
   ═══════════════════════════════════════════════════════════ */

interface CacheShape {
  cities: CityData[];
  states: StateData[];
  timestamp: number;
}

let cache: CacheShape = {
  cities: [],
  states: [],
  timestamp: 0,
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return (
    (cache.cities.length > 0 || cache.states.length > 0) &&
    Date.now() - cache.timestamp < CACHE_TTL
  );
}

/* ═══════════════════════════════════════════════════════════
   GET ALL STATES
   ═══════════════════════════════════════════════════════════ */

export async function getAllStates(forceRefresh = false): Promise<StateData[]> {
  // Cache hit
  if (!forceRefresh && isCacheValid() && cache.states.length > 0) {
    return cache.states;
  }

  try {
    await connectDB();

    const states = await State.find({ active: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const stateData: StateData[] = states.map((s: any) => ({
      _id: s._id.toString(),
      name: s.name,
      slug: s.slug,
      code: s.code,
      lat: s.lat,
      lng: s.lng,
    }));

    cache.states = stateData;
    cache.timestamp = Date.now();

    return stateData;
  } catch (e) {
    console.error("[getAllStates]", e);
    return cache.states;
  }
}

/* ═══════════════════════════════════════════════════════════
   GET ALL CITIES
   ═══════════════════════════════════════════════════════════ */

export async function getAllCities(forceRefresh = false): Promise<CityData[]> {
  // Cache hit
  if (!forceRefresh && isCacheValid() && cache.cities.length > 0) {
    return cache.cities;
  }

  try {
    await connectDB();

    // Fetch states + cities in parallel
    const [states, cities] = await Promise.all([
      State.find({ active: true }).sort({ displayOrder: 1 }).lean(),
      City.find({ active: true }).sort({ displayOrder: 1, name: 1 }).lean(),
    ]);

    // Build state lookup map
    const stateMap: Record<string, StateData> = {};
    const stateData: StateData[] = states.map((s: any) => {
      const data: StateData = {
        _id: s._id.toString(),
        name: s.name,
        slug: s.slug,
        code: s.code,
        lat: s.lat,
        lng: s.lng,
      };
      stateMap[data._id] = data;
      return data;
    });

    // Enrich cities with state info
    const cityData: CityData[] = cities.map((c: any) => {
      const stateIdStr = c.state?.toString() || "";
      const stateInfo = stateMap[stateIdStr];

      return {
        _id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        state: stateIdStr,
        stateName: stateInfo?.name || c.stateName || "",
        stateSlug: stateInfo?.slug,
        lat: c.lat || stateInfo?.lat || 23.5,
        lng: c.lng || stateInfo?.lng || 78.5,
        description: c.description,
        areas: (c.areas || []).map((a: any) => ({
          _id: a._id?.toString(),
          name: a.name,
          slug: a.slug,
          type: a.type,
          active: a.active,
          isOwnerAdded: a.isOwnerAdded,
        })),
        active: c.active,
        isOwnerAdded: c.isOwnerAdded,
      };
    });

    // Update cache
    cache.cities = cityData;
    cache.states = stateData;
    cache.timestamp = Date.now();

    return cityData;
  } catch (e) {
    console.error("[getAllCities]", e);
    return cache.cities;
  }
}

/* ═══════════════════════════════════════════════════════════
   GET CITY BY SLUG
   ═══════════════════════════════════════════════════════════ */

export async function getCityBySlug(
  slug: string,
  stateSlug?: string,
): Promise<CityData | null> {
  const cities = await getAllCities();

  if (stateSlug) {
    return (
      cities.find((c) => c.slug === slug && c.stateSlug === stateSlug) || null
    );
  }

  return cities.find((c) => c.slug === slug) || null;
}

/* ═══════════════════════════════════════════════════════════
   GET CITY BY NAME
   ═══════════════════════════════════════════════════════════ */

export async function getCityByName(name: string): Promise<CityData | null> {
  const cities = await getAllCities();
  return (
    cities.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null
  );
}

/* ═══════════════════════════════════════════════════════════
   GET STATE BY SLUG
   ═══════════════════════════════════════════════════════════ */

export async function getStateBySlug(slug: string): Promise<StateData | null> {
  const states = await getAllStates();
  return states.find((s) => s.slug === slug) || null;
}

/* ═══════════════════════════════════════════════════════════
   GET STATE BY NAME
   ═══════════════════════════════════════════════════════════ */

export async function getStateByName(name: string): Promise<StateData | null> {
  const states = await getAllStates();
  return (
    states.find((s) => s.name.toLowerCase() === name.toLowerCase()) || null
  );
}

/* ═══════════════════════════════════════════════════════════
   GET ALL AREAS (flattened across all cities)
   ═══════════════════════════════════════════════════════════ */

export interface FlatArea {
  city: string;
  citySlug: string;
  stateName: string;
  stateSlug?: string;
  area: string;
  areaSlug: string;
  href: string;
}

export async function getAllAreas(): Promise<FlatArea[]> {
  const cities = await getAllCities();

  return cities.flatMap((c) =>
    (c.areas || [])
      .filter((a) => a.active !== false)
      .map((a) => ({
        city: c.name,
        citySlug: c.slug,
        stateName: c.stateName,
        stateSlug: c.stateSlug,
        area: a.name,
        areaSlug: a.slug,
        href: `/rent-in/${c.slug}/${a.slug}`,
      })),
  );
}

/* ═══════════════════════════════════════════════════════════
   GET CITIES BY STATE
   ═══════════════════════════════════════════════════════════ */

export async function getCitiesByState(stateId: string): Promise<CityData[]> {
  const cities = await getAllCities();
  return cities.filter((c) => c.state === stateId);
}

/* ═══════════════════════════════════════════════════════════
   GET AREAS BY CITY
   ═══════════════════════════════════════════════════════════ */

export async function getAreasByCity(cityId: string): Promise<CityArea[]> {
  const cities = await getAllCities();
  const city = cities.find((c) => c._id === cityId);
  return (city?.areas || []).filter((a) => a.active !== false);
}

/* ═══════════════════════════════════════════════════════════
   CLEAR CACHE
   ═══════════════════════════════════════════════════════════ */

export function clearCityCache(): void {
  cache = {
    cities: [],
    states: [],
    timestamp: 0,
  };
}

/* ═══════════════════════════════════════════════════════════
   CACHE STATS (for admin monitoring)
   ═══════════════════════════════════════════════════════════ */

export function getCacheStats() {
  return {
    citiesCount: cache.cities.length,
    statesCount: cache.states.length,
    ageMs: cache.timestamp > 0 ? Date.now() - cache.timestamp : 0,
    isValid: isCacheValid(),
    ttlMs: CACHE_TTL,
  };
}
