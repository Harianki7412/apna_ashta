import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { CITIES, getAllAreas } from '@/lib/cities';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const props = await Property.find({ status: 'approved' }).select('_id').lean();
  const areas = getAllAreas();

  return [
    { url: BASE, lastModified: new Date(), priority: 1 },
    { url: `${BASE}/properties`, lastModified: new Date(), priority: 0.8 },
    ...CITIES.map((c) => ({
      url: `${BASE}/rent-in/${c.slug}`,
      lastModified: new Date(),
      priority: 0.9,
    })),
    ...areas.map((a) => ({
      url: `${BASE}${a.href}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...props.map((p: any) => ({
      url: `${BASE}/properties/${p._id}`,
      lastModified: new Date(),
      priority: 0.7,
    })),
  ];
}