import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import PropertyCard from "@/components/PropertyCard";

const AREAS = [
  "college-road",
  "bus-stand",
  "gandhi-chowk",
  "hospital-road",
  "main-market",
  "station-road",
  "kannad-road",
];

function slugToArea(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  return AREAS.map((area) => ({ area }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area } = await params;
  if (!AREAS.includes(area)) return { title: "Not Found" };
  const areaName = slugToArea(area);
  return {
    title: `Rent in ${areaName}, Ashta — Rooms & Flats | Flatova`,
    description: `Find verified rooms, flats, and homes for rent in ${areaName}, Ashta.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/rent-in-${area}`,
    },
  };
}

async function getProperties(areaName: string) {
  await connectDB();
  return Property.find({ status: "approved", area: new RegExp(areaName, "i") })
    .populate("owner", "name")
    .sort({ featured: -1, createdAt: -1 })
    .limit(50)
    .lean();
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area } = await params;
  if (!AREAS.includes(area)) notFound();
  const areaName = slugToArea(area);
  const properties = await getProperties(areaName);

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Rent in {areaName}, Ashta</h1>
      <p className="text-gray-600 mb-6">
        {properties.length} properties available
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((p: any) => (
          <PropertyCard
            key={p._id.toString()}
            property={JSON.parse(JSON.stringify(p))}
          />
        ))}
      </div>
      {!properties.length && (
        <p className="text-gray-500">No properties listed here yet.</p>
      )}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-3">Other Areas</h2>
        <div className="flex flex-wrap gap-2">
          {AREAS.filter((a) => a !== area).map((a) => (
            <a
              key={a}
              href={`/rent-in-${a}`}
              className="bg-brand-50 text-brand-700 px-3 py-1 rounded hover:bg-brand-100 capitalize"
            >
              {a.replace(/-/g, " ")}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
