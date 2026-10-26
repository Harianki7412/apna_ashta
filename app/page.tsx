import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import PropertyCard from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { CountUp } from "@/components/CountUp";
import { getTranslations } from "next-intl/server";
import { Home as HomeIcon, MapPin } from "lucide-react";
import { CITIES, getAllAreas } from "@/lib/cities";

async function getStats() {
  await connectDB();
  const [latest, totalCount, cityCounts] = await Promise.all([
    Property.find({ status: "approved" })
      .populate("owner", "name")
      .sort({ featured: -1, createdAt: -1 })
      .limit(6)
      .lean(),
    Property.countDocuments({ status: "approved" }),
    Promise.all(
      CITIES.map(async (c) => {
        const count =
          c.name === "Ashta"
            ? await Property.countDocuments({
                status: "approved",
                $or: [{ city: "Ashta" }, { city: { $exists: false } }],
              })
            : await Property.countDocuments({
                status: "approved",
                city: c.name,
              });
        return { city: c, count };
      }),
    ),
  ]);
  return { latest, totalCount, cityCounts };
}

export default async function Home() {
  const t = await getTranslations("home");
  const { latest, totalCount, cityCounts } = await getStats();

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-16 px-6 md:py-24 mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 !text-white">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Rentals in Ashta, Kothri &amp; Sehore — verified and direct from
            owners.
          </p>
          <Link
            href="/properties"
            className="btn btn-lg bg-white text-brand-700 hover:bg-brand-50 shadow-xl inline-flex"
          >
            {t("browseBtn")} →
          </Link>

          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl md:text-4xl font-bold">
                <CountUp end={totalCount} suffix="+" />
              </p>
              <p className="text-sm text-brand-200">Properties</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">
                <CountUp end={CITIES.length} />
              </p>
              <p className="text-sm text-brand-200">Cities</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">
                <CountUp end={100} suffix="%" />
              </p>
              <p className="text-sm text-brand-200">Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Browse by City</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cityCounts.map(({ city, count }) => (
            <Link
              key={city.slug}
              href={`/rent-in/${city.slug}`}
              className="group card-premium p-5 hover:border-brand-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <MapPin size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-brand-600 transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {city.description}
                  </p>
                  <p className="text-xs text-brand-600 font-semibold mt-2">
                    {count} propert{count === 1 ? "y" : "ies"} available →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{t("latest")}</h2>
          <Link
            href="/properties"
            className="text-sm text-brand-600 font-semibold hover:underline"
          >
            View all →
          </Link>
        </div>
        {latest.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latest.map((p: any, i: number) => (
              <div
                key={p._id.toString()}
                className="animate-card-enter"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <PropertyCard property={JSON.parse(JSON.stringify(p))} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HomeIcon}
            title="No listings yet"
            description="Be the first to list a property."
            actionLabel="Add Property"
            actionHref="/properties/new"
          />
        )}
      </section>

      {/* Areas */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t("areas")}</h2>
        <div className="flex flex-wrap gap-2">
          {getAllAreas().map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all"
            >
              {a.area}, {a.city}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
