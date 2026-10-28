"use client";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import PropertyCard from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/PropertyCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  SearchX,
  MapPin,
  SlidersHorizontal,
  X,
  Loader2,
  Shield,
  CheckCircle2,
} from "lucide-react";
import {
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
  TENANT_PREFERENCES,
} from "@/lib/property-types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] bg-gray-100 dark:bg-slate-800 rounded flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  ),
});

interface CityArea {
  name: string;
  slug: string;
  active?: boolean;
}

interface CityData {
  _id: string;
  name: string;
  slug: string;
  areas: CityArea[];
}

function PropertiesPage() {
  const t = useTranslations("search");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCity = searchParams.get("city") || "";

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cities, setCities] = useState<CityData[]>([]);

  const [filters, setFilters] = useState({
    city: initialCity,
    area: "",
    type: "",
    bhk: "",
    min: "",
    max: "",
    q: "",
    sort: "newest",
    verified: "",
    furnishing: "",
    parking: "",
    bathrooms: "",
    preferred: "",
  });

  /* ═══ Load cities ═══ */
  useEffect(() => {
    api
      .get<CityData[]>("/api/cities")
      .then(setCities)
      .catch(() => {});
  }, []);

  /* ═══ Load properties ═══ */
  async function load(reset = true) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(reset ? 1 : page),
        limit: "12",
      });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
      const d = await api.get<any>(`/api/properties?${params}`);
      if (reset) {
        setItems(d.items);
        setPage(2);
      } else {
        setItems((p) => [...p, ...d.items]);
        setPage((p) => p + 1);
      }
      setTotal(d.total || 0);
      setHasMore(d.hasMore);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(true);
  }, []);

  /* ═══ Save search ═══ */
  async function saveSearch() {
    if (!session) return router.push("/login");
    try {
      await api.post("/api/saved-searches", {
        name: `Search in ${filters.city || "All cities"}${filters.area ? " - " + filters.area : ""}`,
        filters,
      });
      toast.success("Search saved! We'll notify you of new matches.");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  /* ═══ Clear all filters ═══ */
  function clearFilters() {
    setFilters({
      city: "",
      area: "",
      type: "",
      bhk: "",
      min: "",
      max: "",
      q: "",
      sort: "newest",
      verified: "",
      furnishing: "",
      parking: "",
      bathrooms: "",
      preferred: "",
    });
    setTimeout(() => load(true), 0);
  }

  /* ═══ Count active filters ═══ */
  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== "sort",
  ).length;

  const activeCityData = cities.find((c) => c.name === filters.city);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Browse Properties</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {total > 0
            ? `${total} verified properties available`
            : "Find your next home"}
        </p>
      </div>

      {/* ═══ CITY TABS ═══ */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => {
            setFilters({ ...filters, city: "", area: "" });
            setTimeout(() => load(true), 0);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            !filters.city
              ? "bg-brand-600 text-white shadow-button"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-300"
          }`}
        >
          <MapPin size={14} /> All Cities
        </button>

        {cities.map((c) => (
          <button
            key={c.slug}
            onClick={() => {
              setFilters({ ...filters, city: c.name, area: "" });
              setTimeout(() => load(true), 0);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filters.city === c.name
                ? "bg-brand-600 text-white shadow-button"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-300"
            }`}
          >
            <MapPin size={14} /> {c.name}
          </button>
        ))}
      </div>

      {/* ═══ BHK QUICK FILTERS ═══ */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => {
            setFilters({ ...filters, bhk: "" });
            setTimeout(() => load(true), 0);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !filters.bhk
              ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
          }`}
        >
          Any BHK
        </button>
        {BHK_OPTIONS.map((b) => (
          <button
            key={b.value}
            onClick={() => {
              setFilters({ ...filters, bhk: b.value });
              setTimeout(() => load(true), 0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filters.bhk === b.value
                ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* ═══ MAIN SEARCH BAR ═══ */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <SearchX
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder={t("placeholder")}
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && load(true)}
            className="input pl-9"
          />
        </div>

        <input
          placeholder="Area / Colony"
          list="area-filter-options"
          value={filters.area}
          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          className="input w-40"
        />
        <datalist id="area-filter-options">
          {(activeCityData?.areas || [])
            .filter((a) => a.active !== false)
            .map((a) => (
              <option key={a.slug} value={a.name} />
            ))}
        </datalist>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="input w-40"
        >
          <option value="">All Types</option>
          <option value="Room">Room</option>
          <option value="Flat">Flat</option>
          <option value="Builder Floor">Builder Floor</option>
          <option value="Independent House">Independent House</option>
          <option value="Villa">Villa</option>
          <option value="Row House">Row House</option>
          <option value="Studio">Studio</option>
          <option value="Penthouse">Penthouse</option>
          <option value="Duplex">Duplex</option>
        </select>

        <input
          placeholder="Min ₹"
          type="number"
          value={filters.min}
          onChange={(e) => setFilters({ ...filters, min: e.target.value })}
          className="input w-24"
        />
        <input
          placeholder="Max ₹"
          type="number"
          value={filters.max}
          onChange={(e) => setFilters({ ...filters, max: e.target.value })}
          className="input w-24"
        />

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="input w-40"
        >
          <option value="newest">{t("newest")}</option>
          <option value="price_asc">{t("priceLow")}</option>
          <option value="price_desc">{t("priceHigh")}</option>
        </select>

        <button onClick={() => load(true)} className="btn btn-primary">
          {t("search")}
        </button>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn ${showAdvanced ? "btn-primary" : "btn-ghost"} flex items-center gap-1`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-current text-xs px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button onClick={saveSearch} className="btn btn-secondary">
          🔔 {t("saveSearch")}
        </button>

        <button onClick={() => setShowMap(!showMap)} className="btn btn-ghost">
          {showMap ? t("listView") : t("mapView")}
        </button>
      </div>

      {/* ═══ ADVANCED FILTERS ═══ */}
      {showAdvanced && (
        <div className="card p-4 mb-4 space-y-4 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-brand-600 hover:underline flex items-center gap-1"
            >
              <X size={12} /> Reset all
            </button>
          </div>

          {/* Verified only */}
          <div>
            <label className="label">Verified</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilters({
                    ...filters,
                    verified: filters.verified === "true" ? "" : "true",
                  });
                  setTimeout(() => load(true), 0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                  filters.verified === "true"
                    ? "bg-success-500 text-white border-success-500"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                }`}
              >
                <Shield size={12} /> Physically Verified Only
              </button>
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <label className="label">Furnishing</label>
            <div className="flex flex-wrap gap-2">
              {FURNISHING_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      furnishing: filters.furnishing === o.value ? "" : o.value,
                    });
                    setTimeout(() => load(true), 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    filters.furnishing === o.value
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parking */}
          <div>
            <label className="label">Parking</label>
            <div className="flex flex-wrap gap-2">
              {PARKING_OPTIONS.filter((o) => o.value !== "None").map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      parking: filters.parking === o.value ? "" : o.value,
                    });
                    setTimeout(() => load(true), 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    filters.parking === o.value
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="label">Bathrooms</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      bathrooms:
                        filters.bathrooms === String(n) ? "" : String(n),
                    });
                    setTimeout(() => load(true), 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    filters.bathrooms === String(n)
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {n}+ Bath
                </button>
              ))}
            </div>
          </div>

          {/* Preferred tenants */}
          <div>
            <label className="label">Preferred Tenants</label>
            <div className="flex flex-wrap gap-2">
              {TENANT_PREFERENCES.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setFilters({
                      ...filters,
                      preferred: filters.preferred === o.value ? "" : o.value,
                    });
                    setTimeout(() => load(true), 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    filters.preferred === o.value
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {showMap ? (
        <div className="h-[70vh] rounded overflow-hidden">
          <MapView properties={items} />
        </div>
      ) : (
        <>
          {loading && !items.length && <PropertyGridSkeleton count={6} />}

          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((p, i) => (
                <div
                  key={p._id}
                  className="animate-card-enter"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          )}

          {!items.length && !loading && (
            <EmptyState
              icon={SearchX}
              title="No properties found"
              description={
                activeFilterCount > 0
                  ? "Try removing some filters or search a different area."
                  : "No properties available right now."
              }
              actionLabel={activeFilterCount > 0 ? "Clear Filters" : undefined}
              actionHref={activeFilterCount > 0 ? "/properties" : undefined}
            />
          )}

          {hasMore && items.length > 0 && (
            <div className="text-center mt-6">
              <button
                onClick={() => load(false)}
                disabled={loading}
                className="btn btn-primary btn-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Loading...
                  </>
                ) : (
                  t("loadMore")
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PropertyGridSkeleton count={6} />}>
      <PropertiesPage />
    </Suspense>
  );
}
