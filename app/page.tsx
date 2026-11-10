import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { Review } from "@/models/Review";
import PropertyCard from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { CountUp } from "@/components/CountUp";
import { getLocale, getTranslations } from "next-intl/server";
import {
  Home as HomeIcon,
  MapPin,
  Info,
  BookOpen,
  Shield,
  HelpCircle,
  ArrowRight,
  Search,
  Users,
  Sparkles,
  Star,
  Zap,
  Award,
  UserPlus,
  MessageCircle,
} from "lucide-react";
import { getAllAreas, getAllCities } from "@/lib/cities-server";
import { getPublicListingFreshnessFilter } from "@/lib/property-freshness";
import { createPageMetadata } from "@/lib/metadata";
import { PROPERTY_TYPES, getPropertyTypeLabel } from "@/lib/property-types";

export const metadata = createPageMetadata({
  title: "Verified Rooms, Flats & Homes for Rent Across India",
  description:
    "Find verified rooms, flats, and houses for rent across India. Browse current listings, compare rents, and connect directly with property owners on Flatova.",
  path: "/",
});

interface HomepageReview {
  _id: { toString(): string };
  rating: number;
  comment: string;
  author: { name: string } | null;
  property: {
    _id: { toString(): string };
    title: string;
    area: string;
    status: string;
  } | null;
}

type DisplayableHomepageReview = HomepageReview & {
  author: { name: string };
  property: NonNullable<HomepageReview["property"]>;
};

async function getStats() {
  await connectDB();
  const freshnessFilter = getPublicListingFreshnessFilter();
  const [latest, totalCount, verifiedCount, latestReviews, cityStats, cities] =
    await Promise.all([
    Property.find({
      status: "approved",
      $and: [freshnessFilter],
    })
      .populate("owner", "name")
      .sort({ featured: -1, createdAt: -1 })
      .limit(6)
      .lean(),
    Property.countDocuments({
      status: "approved",
      $and: [freshnessFilter],
    }),
    Property.countDocuments({
      status: "approved",
      verified: true,
      $and: [freshnessFilter],
    }),
    Review.find({ comment: { $ne: "" } })
      .populate("author", "name")
      .populate("property", "title area city status")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean<HomepageReview[]>(),
    Property.aggregate([
      { $match: { status: "approved", $and: [freshnessFilter] } },
      {
        $group: {
          _id: { city: "$city", state: "$state", district: "$district" },
          count: { $sum: 1 },
        },
      },
    ]),
    getAllCities(),
  ]);
  const locationCounts = new Map<string, number>();
  const legacyCounts = new Map<string, number>();
  for (const row of cityStats) {
    const cityName = row._id.city || "Ashta";
    const stateName = row._id.state || "";
    const districtName = row._id.district || "";
    const key = `${cityName}\0${stateName}\0${districtName}`;
    locationCounts.set(key, (locationCounts.get(key) || 0) + row.count);
    if (!stateName && !districtName) {
      legacyCounts.set(
        cityName,
        (legacyCounts.get(cityName) || 0) + row.count,
      );
    }
  }
  const cityNameCounts = new Map<string, number>();
  cities.forEach((city) =>
    cityNameCounts.set(city.name, (cityNameCounts.get(city.name) || 0) + 1),
  );
  const cityCounts = cities.map((city) => ({
    city,
    count:
      (locationCounts.get(
        `${city.name}\0${city.stateName}\0${city.district || ""}`,
      ) || 0) +
      (cityNameCounts.get(city.name) === 1
        ? legacyCounts.get(city.name) || 0
        : 0),
  }));
  const reviews = latestReviews
    .filter(
      (review): review is DisplayableHomepageReview =>
        review.property?.status === "approved" && Boolean(review.author?.name),
    )
    .slice(0, 3);
  return { latest, totalCount, verifiedCount, reviews, cities, cityCounts };
}

export default async function Home() {
  const [t, tCommon, tSearch, locale] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
    getTranslations("search"),
    getLocale(),
  ]);
  const { latest, totalCount, verifiedCount, reviews, cities, cityCounts } =
    await getStats();
  const popularCities = [...cityCounts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const popularAreas = (await getAllAreas()).slice(0, 24);

  return (
    <div className="animate-fade-in">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative isolate mb-8 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-sky-100 px-4 py-6 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:mb-12 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl dark:bg-brand-900/30" />
        <div className="pointer-events-none absolute -bottom-48 left-1/3 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-900/20" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="min-w-0">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-brand-300 sm:mb-5 sm:px-3.5 sm:text-sm">
              <Sparkles size={15} className="text-brand-500" />
              <span className="truncate">{t("topBadge")}</span>
            </div>

            <h1 className="mb-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white sm:mb-4 sm:text-5xl lg:text-6xl">
              {t("heroHeading")}
            </h1>
            <p className="mb-5 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:mb-7 sm:text-lg">
              {t("heroDescription")}
            </p>

            <form
              action="/properties"
              method="get"
              role="search"
              className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-brand-900/10 dark:border-slate-700 dark:bg-slate-800 sm:mb-5 sm:grid-cols-[1fr_0.8fr_auto] sm:gap-2 sm:p-2"
            >
              <label className="flex min-h-11 min-w-0 items-center gap-2 px-2">
                <Search size={18} className="shrink-0 text-brand-600" />
                <span className="sr-only">{tSearch("placeholder")}</span>
                <input
                  type="search"
                  name="q"
                  placeholder={tSearch("placeholder")}
                  className="min-h-11 w-full min-w-0 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
                />
              </label>
              <button
                type="submit"
                aria-label={tSearch("search")}
                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:order-last sm:px-5"
              >
                <Search size={17} />
                <span className="hidden sm:inline">{tSearch("search")}</span>
              </button>
              <label className="col-span-2 flex min-w-0 items-center gap-2 border-t border-gray-100 px-2 sm:col-span-1 sm:border-l sm:border-t-0 dark:border-slate-700">
                <MapPin size={18} className="shrink-0 text-brand-600" />
                <span className="sr-only">{tSearch("city")}</span>
                <select
                  name="city"
                  defaultValue=""
                  className="min-h-11 w-full min-w-0 border-0 bg-transparent text-sm text-gray-700 outline-none focus:ring-0 dark:text-slate-200"
                >
                  <option value="">{tSearch("city")}</option>
                  {cities.map((city) => (
                    <option key={city.slug} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
            </form>

            <div className="-mx-4 mb-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:mb-7 sm:flex-wrap sm:overflow-visible sm:px-0">
              {PROPERTY_TYPES.slice(0, 4).map((propertyType) => (
                <Link
                  key={propertyType.value}
                  href={`/properties?type=${encodeURIComponent(propertyType.value)}`}
                  className="inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-gray-200 bg-white/85 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800/85 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-slate-700 sm:px-3.5 sm:text-sm"
                >
                  <span aria-hidden="true">{propertyType.icon}</span>
                  {getPropertyTypeLabel(propertyType.value, locale)}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Link
                href="/properties"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 sm:min-h-12 sm:py-3"
              >
                {t("browseBtn")}
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/properties/new"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-5 py-2.5 text-sm font-bold text-gray-800 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 sm:min-h-12 sm:py-3"
              >
                <PlusCircleIcon />
                {t("addProperty")}
              </Link>
            </div>

            <div className="mt-5 grid max-w-lg grid-cols-3 gap-2 border-t border-brand-200/70 pt-4 dark:border-slate-700 sm:mt-8 sm:gap-3 sm:pt-5">
              <div>
                <p className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
                  <CountUp end={totalCount} suffix="+" />
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("properties")}</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
                  <CountUp end={cities.length} />
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("cities")}</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">
                  <CountUp end={verifiedCount} />
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("verified")}</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-md lg:block">
            <div className="absolute -left-8 top-8 h-64 w-64 rounded-full bg-brand-200/70 dark:bg-brand-900/50" />
            <div className="absolute -bottom-7 -right-5 h-40 w-40 rounded-full border-[18px] border-sky-300/60 dark:border-sky-800/50" />
            <div className="relative rotate-1 rounded-[2rem] border border-white/80 bg-white p-3 shadow-2xl shadow-brand-950/20 dark:border-slate-700 dark:bg-slate-800">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-brand-200 via-sky-100 to-brand-300 dark:from-slate-700 dark:via-slate-600 dark:to-brand-900">
                {latest[0]?.images?.[0] ? (
                  <Image
                    src={latest[0].images[0]}
                    alt={latest[0].title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 0px, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-600/70 dark:text-brand-200/70">
                    <HomeIcon size={112} strokeWidth={1.1} />
                  </div>
                )}
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-success-700 shadow-md">
                  <Shield size={14} />
                  {tCommon("verifiedListings")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 px-2 pb-2 pt-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900 dark:text-white">
                    {latest[0]?.title || t("heroTitle")}
                  </p>
                  <p className="mt-1 flex items-center gap-1 truncate text-sm text-gray-500 dark:text-slate-400">
                    <MapPin size={14} className="shrink-0" />
                    {latest[0]?.area || cities[0]?.name}
                  </p>
                </div>
                {latest[0]?.rent && (
                  <p className="shrink-0 text-right text-lg font-extrabold text-brand-700 dark:text-brand-300">
                    ₹{latest[0].rent.toLocaleString("en-IN")}
                    <span className="block text-xs font-medium text-gray-500 dark:text-slate-400">
                      {tCommon("perMonth")}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-7 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{tCommon("noBrokerage")}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{tCommon("directContact")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BADGES ═══════════ */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Shield, label: tCommon("verifiedBadgeExplainer"), color: "success" },
            { icon: Zap, label: tCommon("directContact"), color: "accent" },
            { icon: Users, label: tCommon("noBrokerage"), color: "brand" },
            { icon: Award, label: tCommon("adminApproved"), color: "warning" },
          ].map((item, i) => {
            const Icon = item.icon;
            const colors: any = {
              success: "bg-success-50 text-success-600",
              accent: "bg-accent-400/20 text-accent-600",
              brand: "bg-brand-50 text-brand-600",
              warning: "bg-warning-50 text-warning-600",
            };
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${colors[item.color]} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ CITIES ═══════════ */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              {tCommon("browseByCity")}
            </h2>
            <p className="text-gray-500 text-sm">
              {tCommon("exploreCity")}
            </p>
          </div>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {popularCities.map(({ city, count }) => (
            <Link
              key={city.slug}
              href={`/rent-in/${city.slug}`}
              className="group relative min-w-[min(84vw,20rem)] snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 sm:min-w-0 sm:p-6"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-50 dark:from-brand-900/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-110 sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
                  <MapPin size={21} />
                </div>

                <h3 className="font-bold text-xl text-gray-900 group-hover:text-brand-600 transition-colors">
                  {city.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-brand-600">
                    {count} {count === 1 ? tCommon("property") : tCommon("properties")}
                  </span>
                  <span className="flex items-center gap-1 text-brand-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                    {tCommon("view")} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ LATEST LISTINGS ═══════════ */}
      <section className="mb-14">
        <div className="mb-4 flex items-end justify-between sm:mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              {t("latest")}
            </h2>
            <p className="text-gray-500 text-sm">{tCommon("recentlyAdded")}</p>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:gap-2.5 transition-all"
          >
            {tCommon("viewAll")} <ArrowRight size={16} />
          </Link>
        </div>

        {latest.length > 0 ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {latest.map((p: any, i: number) => (
              <div
                key={p._id.toString()}
                className="min-w-[min(86vw,24rem)] snap-start animate-card-enter sm:min-w-0"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <PropertyCard property={JSON.parse(JSON.stringify(p))} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HomeIcon}
            title={t("noListingsYet")}
            description={t("beFirstToList")}
            actionLabel={t("addProperty")}
            actionHref="/properties/new"
          />
        )}
      </section>

      {/* ═══════════ HOW IT WORKS TEASER ═══════════ */}
      <section className="mb-14">
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-slate-700">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {tCommon("howItWorks")}
            </h2>
            <p className="text-gray-500">{tCommon("getStarted")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: tCommon("searchStepTitle"),
                desc: tCommon("searchStepDesc"),
                color: "brand",
              },
              {
                icon: MessageCircle,
                title: "Connect",
                desc: "Chat directly with property owners — no brokers",
                color: "success",
              },
              {
                icon: HomeIcon,
                title: tCommon("moveIn"),
                desc: tCommon("moveInStepDesc"),
                color: "accent",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              const colors: any = {
                brand: "from-brand-500 to-brand-700",
                success: "from-success-500 to-success-600",
                accent: "from-accent-400 to-accent-600",
              };
              return (
                <div key={i} className="relative text-center group">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[step.color]} text-white flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={28} />
                  </div>
                  <div className="absolute top-2 left-1/2 -translate-x-20 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 shadow-sm">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-brand-200 text-brand-700 font-semibold hover:bg-brand-50 hover:border-brand-300 transition-all"
            >
              {tCommon("learnMore")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ LEARN MORE CARDS ═══════════ */}
      <section className="mb-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{tCommon("learnMore")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              href: "/about",
              icon: Info,
              label: tCommon("aboutUs"),
              desc: tCommon("aboutUsDesc"),
              color: "brand",
            },
            {
              href: "/how-it-works",
              icon: BookOpen,
              label: tCommon("howItWorks"),
              desc: tCommon("howItWorksDesc"),
              color: "success",
            },
            {
              href: "/safety-tips",
              icon: Shield,
              label: tCommon("safetyTips"),
              desc: tCommon("stayProtected"),
              color: "warning",
            },
            {
              href: "/faq",
              icon: HelpCircle,
              label: tCommon("faq"),
              desc: tCommon("commonQuestions"),
              color: "accent",
            },
          ].map((item) => {
            const Icon = item.icon;
            const colors: any = {
              brand: "bg-brand-50 text-brand-600 group-hover:bg-brand-600",
              success:
                "bg-success-50 text-success-600 group-hover:bg-success-600",
              warning:
                "bg-warning-50 text-warning-600 group-hover:bg-warning-600",
              accent:
                "bg-accent-400/20 text-accent-600 group-hover:bg-accent-500",
            };
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white rounded-2xl p-5 text-center border border-gray-100 hover:border-brand-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${colors[item.color]} group-hover:text-white flex items-center justify-center mx-auto mb-3 transition-colors duration-300`}
                >
                  <Icon size={24} />
                </div>
                <p className="font-bold text-sm text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {tCommon("propertyReviews")}
            </h2>
            <p className="text-gray-500">{tCommon("reviewsFromRenters")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <Link
                key={review._id.toString()}
                href={`/properties/${review.property._id.toString()}`}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-3" aria-label={`${review.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      fill={n <= review.rating ? "#f59e0b" : "none"}
                      color="#f59e0b"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 line-clamp-4">
                  {review.comment}
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="font-semibold text-sm">{review.author.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {review.property.title} · {review.property.area}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ POPULAR AREAS ═══════════ */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              {t("areas")}
            </h2>
            <p className="text-gray-500 text-sm">
              {tCommon("exploreByLocality")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {popularAreas.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all"
            >
              <MapPin
                size={12}
                className="text-gray-400 group-hover:text-brand-500 transition-colors"
              />
              {a.area}, {a.city}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-8 md:p-14 text-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-medium mb-6">
            <UserPlus size={14} />
            <span>{tCommon("freeForeverBasic")}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {tCommon("readyToList")}?
          </h2>
          <p className="text-brand-100 mb-8 text-base md:text-lg leading-relaxed">
            {tCommon("reachTenants")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/properties/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-700 font-bold shadow-2xl shadow-brand-900/30 hover:bg-brand-50 hover:scale-[1.02] transition-all"
            >
              <PlusCircleIcon />
              {tCommon("listPropertyFree")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/30 text-white font-bold hover:bg-white/20 transition-all"
            >
              {tCommon("learnMore")}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-10 pt-8 border-t border-white/20">
            <div>
              <p className="text-2xl font-bold">{tCommon("free")}</p>
              <p className="text-xs text-brand-200">{tCommon("listing")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{tCommon("adminReview")}</p>
              <p className="text-xs text-brand-200">{tCommon("approval")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0%</p>
              <p className="text-xs text-brand-200">{tCommon("brokerage")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Small helper icons
function PlusCircleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
