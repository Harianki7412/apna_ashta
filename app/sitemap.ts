import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const AREAS = ['college-road', 'bus-stand', 'gandhi-chowk', 'hospital-road', 'main-market', 'station-road', 'kannad-road'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const props = await Property.find({ status: 'approved' }).select('_id').lean();
  return [
    { url: BASE, lastModified: new Date(), priority: 1 },
    { url: `${BASE}/properties`, lastModified: new Date(), priority: 0.8 },
    ...AREAS.map((a) => ({ url: `${BASE}/rent-in-${a}`, lastModified: new Date(), priority: 0.9 })),
    ...props.map((p: any) => ({ url: `${BASE}/properties/${p._id}`, lastModified: new Date(), priority: 0.7 })),
  ];
}