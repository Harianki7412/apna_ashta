import { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { CITIES, getAllAreas } from "@/lib/cities";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  // City pages (no DB needed)
  const cityPages: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${BASE}/rent-in/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Area pages (no DB needed)
  const areaPages: MetadataRoute.Sitemap = getAllAreas().map((a) => ({
    url: `${BASE}${a.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Property pages (DB needed) — fail-safe
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const props = await Property.find({ status: "approved" })
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
