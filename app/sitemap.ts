import { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { getPublicListingFreshnessFilter } from "@/lib/property-freshness";
import { CITIES as LEGACY_CITIES, getAllAreas as getLegacyAreas } from "@/lib/cities";
import { getAllAreas, getAllCities } from "@/lib/cities-server";
import { SITE_URL } from "@/lib/site-url";

const BASE = SITE_URL.origin;

// Static pages (always available even if DB fails)
const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${BASE}/properties`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${BASE}/pricing`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${BASE}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${BASE}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${BASE}/faq`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${BASE}/how-it-works`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: `${BASE}/safety-tips`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${BASE}/privacy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    url: `${BASE}/terms`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    url: `${BASE}/refund-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  },
  {
    url: `${BASE}/disclaimer`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.4,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, areas] = await Promise.all([getAllCities(), getAllAreas()]);
  const allCities = [
    ...new Map(
      [...LEGACY_CITIES, ...cities].map((city) => [city.slug, city]),
    ).values(),
  ];
  const allAreas = [
    ...new Map(
      [...getLegacyAreas(), ...areas].map((area) => [area.href, area]),
    ).values(),
  ];

  const cityPages: MetadataRoute.Sitemap = allCities.map((c) => ({
    url: `${BASE}/rent-in/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const areaPages: MetadataRoute.Sitemap = allAreas.map((a) => ({
    url: `${BASE}${a.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Property pages (DB needed) — fail-safe
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const props = await Property.find({
      status: "approved",
      $and: [getPublicListingFreshnessFilter()],
    })
      .select("_id updatedAt")
      .lean()
      .limit(500);

    propertyPages = props.map((p: any) => ({
      url: `${BASE}/properties/${p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    // Silently ignore DB errors — build still completes with static pages
    console.warn(
      "[sitemap] DB unreachable, using static pages only:",
      (e as Error).message,
    );
  }

  return [...STATIC_PAGES, ...cityPages, ...areaPages, ...propertyPages];
}
