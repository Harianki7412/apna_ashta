import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import PropertyCard from "@/components/PropertyCard";
import { getTranslations } from "next-intl/server";

const AREAS = [
  "college-road",
  "bus-stand",
  "gandhi-chowk",
  "hospital-road",
  "main-market",
  "station-road",
];

async function getLatest() {
  await connectDB();
  return Property.find({ status: "approved" })
    .populate("owner", "name")
    .sort({ featured: -1, createdAt: -1 })
    .limit(6)
    .lean();
}

export default async function Home() {
  const t = await getTranslations("home");
  const properties = await getLatest();

  return (
    <div>
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-gray-600">{t("subtitle")}</p>
        <Link
          href="/properties"
          className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg text-lg"
        >
          {t("browseBtn")}
        </Link>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">{t("latest")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((p: any) => (
            <PropertyCard
              key={p._id.toString()}
              property={JSON.parse(JSON.stringify(p))}
            />
          ))}
          {!properties.length && (
            <p className="text-gray-500">No listings yet.</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t("areas")}</h2>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <Link
              key={a}
              href={`/rent-in-${a}`}
              className="bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 capitalize"
            >
              {a.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
