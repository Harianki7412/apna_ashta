import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import PropertyCard from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { getCityBySlug, getAreaBySlug } from "@/lib/cities";
import { MapPin, Home as HomeIcon } from "lucide-react";

export async function generateStaticParams() {
  const { CITIES } = await import("@/lib/cities");
  return CITIES.flatMap((c) =>
    c.areas.map((a) => ({ city: c.slug, area: a.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; area: string }>;
}): Promise<Metadata> {
  const { city: citySlug, area: areaSlug } = await params;
  const city = getCityBySlug(citySlug);
  const area = getAreaBySlug(citySlug, areaSlug);
  if (!city || !area) return { title: "Not Found" };

  return {
    title: `Rent in ${area.name}, ${city.name} — Rooms & Flats | Flatova`,
    description: `Find verified rentals in ${area.name}, ${city.name}. Direct from owners, no brokers.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/rent-in/${city.slug}/${area.slug}`,
    },
  };
}

async function getProperties(cityName: string, areaName: string) {
  await connectDB();
  const query: any = {
    status: "approved",
    area: new RegExp(areaName, "i"),
  };
  if (cityName === "Ashta") {
    query.$or = [{ city: "Ashta" }, { city: { $exists: false } }];
  } else {
    query.city = cityName;
  }
  return Property.find(query)
    .populate("owner", "name")
    .sort({ featured: -1, createdAt: -1 })
    .limit(50)
    .lean();
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ city: string; area: string }>;
}) {
  const { city: citySlug, area: areaSlug } = await params;
  const city = getCityBySlug(citySlug);
  const area = getAreaBySlug(citySlug, areaSlug);
  if (!city || !area) notFound();

  const properties = await getProperties(city.name, area.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: properties.slice(0, 10).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "RealEstateListing",
        name: p.title,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/properties/${p._id}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 flex-wrap">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <span>/</span>
          <Link href={`/rent-in/${city.slug}`} className="hover:text-brand-600">
            {city.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{area.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
          <MapPin className="text-brand-600" size={28} />
          Rent in {area.name}, {city.name}
        </h1>
        <p className="text-brand-600 font-semibold mt-2">
          {properties.length} propert{properties.length === 1 ? "y" : "ies"}{" "}
          available
        </p>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((p: any) => (
            <PropertyCard
              key={p._id.toString()}
              property={JSON.parse(JSON.stringify(p))}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HomeIcon}
          title={`No properties in ${area.name} yet`}
          description={`Be the first to list a property in ${area.name}, ${city.name}.`}
          actionLabel="Add Property"
          actionHref="/properties/new"
        />
      )}

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-3">
          Other Areas in {city.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {city.areas
            .filter((a) => a.slug !== area.slug)
            .map((a) => (
              <Link
                key={a.slug}
                href={`/rent-in/${city.slug}/${a.slug}`}
                className="bg-brand-50 text-brand-700 px-4 py-2 rounded-full hover:bg-brand-100 font-semibold"
              >
                Rent in {a.name}
              </Link>
            ))}
        </div>
      </div>
    </>
  );
}
