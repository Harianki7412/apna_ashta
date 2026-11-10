import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import PropertyCard from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { getCityBySlug, getAllCities, CityData } from "@/lib/cities-server";
import { CITIES as LEGACY_CITIES } from "@/lib/cities";
import { MapPin, Home as HomeIcon } from "lucide-react";
import { getPublicListingFreshnessFilter } from "@/lib/property-freshness";
import { createPageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  const cities = await getAllCities();
  const slugs = new Set([
    ...LEGACY_CITIES.map((city) => city.slug),
    ...cities.map((city) => city.slug),
  ]);
  return [...slugs].map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "Not Found" };
  const title = `Rent in ${city.name} — Rooms, Flats & Homes`;
  const description = `Find verified rooms, flats, and homes for rent in ${city.name}, ${city.state}. Browse current listings and connect directly with property owners.`;
  return createPageMetadata({
    title,
    description,
    path: `/rent-in/${city.slug}`,
  });
}

async function getProperties(city: CityData) {
  await connectDB();
  const query: any = {
    status: "approved",
    $and: [getPublicListingFreshnessFilter()],
  };
  if (city.name === "Ashta") {
    query.$and.push({
      $or: [{ city: "Ashta" }, { city: { $exists: false } }],
    });
  } else {
    query.city = city.name;
  }
  if (city.district && city.stateName) {
    query.$and.push({
      $or: [
        { state: city.stateName, district: city.district },
        { state: { $in: [null, ""] } },
      ],
    });
  }
  return Property.find(query)
    .populate("owner", "name")
    .sort({ featured: -1, createdAt: -1 })
    .limit(50)
    .lean();
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const properties = await getProperties(city);
  const otherCities = [...LEGACY_CITIES, ...(await getAllCities())]
    .filter((other, index, all) =>
      all.findIndex((candidate) => candidate.slug === other.slug) === index,
    )
    .filter((other) => other.slug !== city.slug)
    .slice(0, 12);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">{city.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
          <MapPin className="text-brand-600" size={28} />
          Rent in {city.name}
        </h1>
        <p className="text-gray-600 mt-2">{city.description}</p>
        <p className="text-brand-600 font-semibold mt-2">
          {properties.length} verified propert
          {properties.length === 1 ? "y" : "ies"} available
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
          title={`No properties in ${city.name} yet`}
          description="Be the first to list a property here."
          actionLabel="Add Property"
          actionHref="/properties/new"
        />
      )}

      {/* Popular areas in this city */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-3">
          Popular Areas in {city.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {city.areas.filter((area) => area.active !== false).map((a) => (
            <Link
              key={a.slug}
              href={`/rent-in/${city.slug}/${a.slug}`}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 capitalize"
            >
              {a.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Other cities */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-3">Other Cities</h2>
        <div className="flex flex-wrap gap-2">
          {otherCities.map((c) => (
            <Link
              key={c.slug}
              href={`/rent-in/${c.slug}`}
              className="bg-brand-50 text-brand-700 px-4 py-2 rounded-full hover:bg-brand-100 font-semibold"
            >
              Rent in {c.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
