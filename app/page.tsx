import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import PropertyCard from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { CountUp } from "@/components/CountUp";
import { getTranslations } from "next-intl/server";
import {
  Home as HomeIcon,
  MapPin,
  Info,
  BookOpen,
  Shield,
  HelpCircle,
  ArrowRight,
  Search,
  CheckCircle2,
  Users,
  TrendingUp,
  Sparkles,
  Star,
  Zap,
  Award,
  UserPlus,
  MessageCircle,
} from "lucide-react";
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
  const tCommon = await getTranslations("common");
  const { latest, totalCount, cityCounts } = await getStats();

  return (
    <div className="animate-fade-in">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white py-16 md:py-24 mb-12">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm font-medium mb-6">
            <Sparkles size={14} className="text-accent-400" />
            <span>{t("topBadge")}</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            {t("heroTitle")},
            <br />
            <span className="bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 bg-clip-text text-transparent">
              Flatova
            </span>
          </h1>

          <p className="text-lg md:text-xl text-brand-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("heroDescription")}
          </p>

          {/* Search CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-700 font-bold text-base shadow-2xl shadow-brand-900/30 hover:bg-brand-50 hover:scale-[1.02] transition-all"
            >
              <Search size={20} />
              {t("browseBtn")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/properties/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/30 text-white font-bold text-base hover:bg-white/20 hover:border-white/50 transition-all"
            >
              <PlusCircleIcon />
              {t("addProperty")}
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold">
                <CountUp end={totalCount} suffix="+" />
              </p>
              <p className="text-xs md:text-sm text-brand-200 mt-1">
                {t("properties")}
              </p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold">
                <CountUp end={CITIES.length} />
              </p>
              <p className="text-xs md:text-sm text-brand-200 mt-1">{t("cities")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold">
                <CountUp end={100} suffix="%" />
              </p>
              <p className="text-xs md:text-sm text-brand-200 mt-1">{t("verified")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BADGES ═══════════ */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Shield, label: tCommon("verifiedListings"), color: "success" },
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cityCounts.map(({ city, count }) => (
            <Link
              key={city.slug}
              href={`/rent-in/${city.slug}`}
              className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-50 dark:from-brand-900/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                  <MapPin size={24} />
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
        <div className="flex items-end justify-between mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                desc: "Chat directly with verified owners — no brokers",
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

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {tCommon("whatOurUsersSay")}
          </h2>
          <p className="text-gray-500">{tCommon("realStories")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Priya Sharma",
              role: "Tenant",
              quote:
                "Found my dream 2BHK in 3 days. Direct owner contact, no broker fees!",
              rating: 5,
            },
            {
              name: "Rajesh Verma",
              role: "Property Owner",
              quote:
                "Listed my flat and got 8 genuine inquiries within a week. Amazing platform!",
              rating: 5,
            },
            {
              name: "Anita Patel",
              role: "Student",
              quote:
                "As a student, budget-friendly rooms were hard to find. Flatova made it easy.",
              rating: 5,
            },
          ].map((testimonial, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={14}
                    fill={n <= testimonial.rating ? "#f59e0b" : "none"}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
          {getAllAreas().map((a) => (
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
              <p className="text-2xl font-bold">24hr</p>
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
