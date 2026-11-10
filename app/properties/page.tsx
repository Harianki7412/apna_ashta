"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import PropertyCard from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/PropertyCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { trackEvent } from "@/components/GoogleAnalytics";
import {
  SearchX,
  MapPin,
  SlidersHorizontal,
  X,
  Loader2,
  Shield,
  AlertCircle,
  RefreshCw,
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
  district?: string;
  stateName: string;
  areas: CityArea[];
}

interface StateOption {
  _id: string;
  name: string;
  slug: string;
}

interface PropertyListing {
  _id: string;
  title: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  rent?: number;
  deposit?: number;
  maintenanceCharge?: number;
  bhk?: string;
  propertyType?: string;
  furnishing?: string;
  bathrooms?: number;
  parking?: string;
  verified?: boolean;
  amenities?: string[];
}

interface PropertiesResponse {
  items: PropertyListing[];
  total: number;
  hasMore: boolean;
}

interface PropertyFilters {
  state: string;
  district: string;
  city: string;
  area: string;
  type: string;
  bhk: string;
  min: string;
  max: string;
  q: string;
  sort: string;
  verified: string;
  furnishing: string;
  parking: string;
  bathrooms: string;
  preferred: string;
}

const BUDGETS = [
  { label: "Up to ₹5,000", min: "", max: "5000" },
  { label: "₹5,000–₹10,000", min: "5000", max: "10000" },
  { label: "₹10,000–₹20,000", min: "10000", max: "20000" },
  { label: "₹20,000+", min: "20000", max: "" },
];

function PropertiesPage() {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<PropertyListing[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cities, setCities] = useState<CityData[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [preferredStateId, setPreferredStateId] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const loadRequestId = useRef(0);
  const preferredStateApplied = useRef(false);

  const [filters, setFilters] = useState<PropertyFilters>(() => ({
    state: searchParams.get("state") || "",
    district: searchParams.get("district") || "",
    city: searchParams.get("city") || "",
    area: searchParams.get("area") || "",
    type: searchParams.get("type") || "",
    bhk: searchParams.get("bhk") || "",
    min: searchParams.get("min") || "",
    max: searchParams.get("max") || "",
    q: searchParams.get("q") || "",
    sort: searchParams.get("sort") || "newest",
    verified: searchParams.get("verified") || "",
    furnishing: searchParams.get("furnishing") || "",
    parking: searchParams.get("parking") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    preferred: searchParams.get("preferred") || "",
  }));

  /* ═══ Load cities ═══ */
  useEffect(() => {
    Promise.all([
      api.get<StateOption[]>("/api/states"),
      api.get<CityData[]>("/api/cities"),
    ])
      .then(([stateData, cityData]) => {
        setStates(stateData);
        setCities(cityData);
      })
      .catch((error: Error) => {
        toast.error(error.message || "Unable to load location data.");
      });
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    api
      .get<{ state?: string }>("/api/profile")
      .then(({ state }) => {
        if (!cancelled) setPreferredStateId(state || "");
      })
      .catch((error: Error) => {
        if (!cancelled) {
          toast.error(error.message || "Could not load your saved state.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  useEffect(() => {
    if (preferredStateApplied.current || !preferredStateId || !states.length) {
      return;
    }

    if (filters.state || searchParams.get("state")) {
      preferredStateApplied.current = true;
      return;
    }

    const preferredState = states.find(
      (state) => state._id === preferredStateId,
    );
    preferredStateApplied.current = true;
    if (!preferredState) return;

    const nextFilters = {
      ...filters,
      state: preferredState.name,
      district: "",
      city: "",
      area: "",
    };
    setFilters(nextFilters);
    void load(true, nextFilters);
  }, [filters, preferredStateId, searchParams, states]);

  /* ═══ Load properties ═══ */
  async function load(reset = true, selectedFilters = filters) {
    const requestId = ++loadRequestId.current;
    setLoadError(null);
    if (reset) {
      setItems([]);
      setTotal(0);
      setPage(1);
      setHasMore(true);
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(reset ? 1 : page),
        limit: "12",
      });
      Object.entries(selectedFilters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
      if (reset) {
        const query = new URLSearchParams();
        Object.entries(selectedFilters).forEach(([key, value]) => {
          if (value && !(key === "sort" && value === "newest")) {
            query.set(key, value);
          }
        });
        const queryString = query.toString();
        router.replace(
          queryString ? `/properties?${queryString}` : "/properties",
          { scroll: false },
        );
      }
      const d = await api.get<PropertiesResponse>(
        `/api/properties?${params}`,
      );
      if (requestId !== loadRequestId.current) return;
      if (reset) {
        trackEvent("search_results", {
          result_count: d.total || 0,
          filters_applied: Object.values(selectedFilters).filter(Boolean).length,
        });
      }
      if (reset) {
        setItems(d.items);
        setPage(2);
      } else {
        setItems((p) => [...p, ...d.items]);
        setPage((p) => p + 1);
      }
      setTotal(d.total || 0);
      setHasMore(d.hasMore);
    } catch (error) {
      if (requestId === loadRequestId.current) {
        const message =
          error instanceof Error ? error.message : "Unable to load properties.";
        setLoadError(message);
        toast.error(message);
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }

  useEffect(() => {
    load(true);
  }, []);

  function applyFilters(nextFilters: PropertyFilters) {
    setFilters(nextFilters);
    setCompareIds([]);
    void load(true, nextFilters);
  }

  /* ═══ Save search ═══ */
  async function saveSearch() {
    if (!session) return router.push("/login");
    try {
      await api.post("/api/saved-searches", {
        name: `Search in ${filters.city || "All cities"}${filters.area ? " - " + filters.area : ""}`,
        filters,
      });
      toast.success(t("searchSaved"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save this search.",
      );
    }
  }

  /* ═══ Clear all filters ═══ */
  function clearFilters() {
    applyFilters({
      state: "",
      district: "",
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
  }

  function toggleCompare(propertyId: string) {
    setCompareIds((current) => {
      if (current.includes(propertyId)) {
        return current.filter((id) => id !== propertyId);
      }
      if (current.length >= 3) {
        toast.error("Compare up to 3 properties at a time.");
        return current;
      }
      return [...current, propertyId];
    });
  }

  /* ═══ Count active filters ═══ */
  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== "sort",
  ).length;

  const activeCityData = cities.find(
    (c) =>
      c.name === filters.city &&
      (!filters.state || c.stateName === filters.state) &&
      (!filters.district || c.district === filters.district),
  );
  const filteredDistricts = [
    ...new Set(
      cities
        .filter((city) => !filters.state || city.stateName === filters.state)
        .map((city) => city.district)
        .filter((district): district is string => Boolean(district)),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const filteredCities = cities.filter(
    (city) =>
      (!filters.state || city.stateName === filters.state) &&
      (!filters.district || city.district === filters.district),
  );
  const compareItems = items.filter((property) =>
    compareIds.includes(property._id),
  );
  const compareRows: {
    label: string;
    value: (property: PropertyListing) => string;
  }[] = [
    {
      label: "Monthly rent",
      value: (property) => `₹${(property.rent || 0).toLocaleString("en-IN")}`,
    },
    {
      label: "Deposit",
      value: (property) =>
        `₹${(property.deposit || 0).toLocaleString("en-IN")}`,
    },
    {
      label: "Monthly maintenance",
      value: (property) =>
        `₹${(property.maintenanceCharge || 0).toLocaleString("en-IN")}`,
    },
    {
      label: "Estimated first payment",
      value: (property) =>
        `₹${(
          (property.rent || 0) +
          (property.deposit || 0) +
          (property.maintenanceCharge || 0)
        ).toLocaleString("en-IN")}`,
    },
    {
      label: "Location",
      value: (property) =>
        [
          property.area,
          property.city,
          property.district,
          property.state,
        ]
          .filter(Boolean)
          .join(", "),
    },
    {
      label: "Property",
      value: (property) =>
        [property.bhk, property.propertyType].filter(Boolean).join(" · "),
    },
    {
      label: "Furnishing",
      value: (property) => property.furnishing || "Not specified",
    },
    {
      label: "Bathrooms",
      value: (property) => String(property.bathrooms || 1),
    },
    {
      label: "Parking",
      value: (property) => property.parking || "Not specified",
    },
    {
      label: "Facilities",
      value: (property) => property.amenities?.join(", ") || "Not specified",
    },
    {
      label: "Verification",
      value: (property) => (property.verified ? "Physically verified" : "Not verified"),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t("browseProperties")}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {total > 0
            ? t("verifiedPropertiesAvailable", { count: total })
            : t("findYourNextHome")}
        </p>
        </div>
        <Link href="/properties/new" className="btn btn-primary w-full sm:w-auto">
          + {tCommon("listPropertyFree")}
        </Link>
      </div>

      {/* ═══ STATE TABS ═══ */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => {
            applyFilters({
              ...filters,
              state: "",
              district: "",
              city: "",
              area: "",
            });
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            !filters.state
              ? "bg-brand-600 text-white shadow-button"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-300"
          }`}
        >
          <MapPin size={14} /> All India
        </button>

        {states.map((state) => (
          <button
            key={state._id}
            onClick={() => {
              applyFilters({
                ...filters,
                state:
                  filters.state === state.name ? "" : state.name,
                district: "",
                city: "",
                area: "",
              });
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filters.state === state.name
                ? "bg-brand-600 text-white shadow-button"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-300"
            }`}
          >
            <MapPin size={14} /> {state.name}
          </button>
        ))}
      </div>

      {/* ═══ BHK QUICK FILTERS ═══ */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => {
            applyFilters({ ...filters, bhk: "" });
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !filters.bhk
              ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
          }`}
        >
          {t("anyBhk") || tCommon("anyBhk")}
        </button>
        {BHK_OPTIONS.map((b) => (
          <button
            key={b.value}
            onClick={() => {
              applyFilters({ ...filters, bhk: b.value });
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

      {/* ═══ QUICK BUDGET FILTERS ═══ */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {BUDGETS.map((budget) => {
          const active =
            filters.min === budget.min && filters.max === budget.max;
          return (
            <button
              key={budget.label}
              onClick={() =>
                applyFilters({
                  ...filters,
                  min: active ? "" : budget.min,
                  max: active ? "" : budget.max,
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"
              }`}
            >
              {budget.label}
            </button>
          );
        })}
      </div>

      {/* ═══ MAIN SEARCH BAR ═══ */}
      <div className="card mb-4 space-y-3 p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-12">
        <select
          value={filters.district}
          onChange={(e) =>
            setFilters({
              ...filters,
              district: e.target.value,
              city: "",
              area: "",
            })
          }
          aria-label="Filter by district"
          disabled={!filters.state}
          className="input w-full text-base sm:text-sm lg:col-span-2"
        >
          <option value="">All districts</option>
          {filteredDistricts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>

        <select
          value={filters.city}
          onChange={(e) =>
            setFilters({ ...filters, city: e.target.value, area: "" })
          }
          aria-label="Filter by city"
          disabled={!filters.state}
          className="input w-full text-base sm:text-sm lg:col-span-2"
        >
          <option value="">{tCommon("allCities")}</option>
          {filteredCities.map((city) => (
            <option key={city.slug} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>

        <div className="relative col-span-2 min-w-0 lg:col-span-4">
          <SearchX
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && load(true)}
            className="input pl-9 text-base sm:text-sm"
          />
        </div>

        <input
          placeholder={t("areaColony") || tCommon("areaColony")}
          aria-label={t("areaColony") || tCommon("areaColony")}
          list="area-filter-options"
          value={filters.area}
          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          className="input w-full text-base sm:text-sm lg:col-span-2"
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
          className="input w-full text-base sm:text-sm lg:col-span-2"
        >
          <option value="">{tCommon("allTypes")}</option>
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
          placeholder={t("minPrice")}
          aria-label={t("minPrice")}
          type="number"
          value={filters.min}
          onChange={(e) => setFilters({ ...filters, min: e.target.value })}
          className="input w-full text-base sm:text-sm lg:col-span-1"
        />
        <input
          placeholder={t("maxPrice")}
          aria-label={t("maxPrice")}
          type="number"
          value={filters.max}
          onChange={(e) => setFilters({ ...filters, max: e.target.value })}
          className="input w-full text-base sm:text-sm lg:col-span-1"
        />

        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          aria-label="Sort properties"
          className="input col-span-2 w-full text-base sm:col-span-2 sm:text-sm lg:col-span-2"
        >
          <option value="newest">{t("newest")}</option>
          <option value="price_asc">{t("priceLow")}</option>
          <option value="price_desc">{t("priceHigh")}</option>
        </select>

        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button onClick={() => load(true)} disabled={loading} className="btn btn-primary min-w-0 sm:min-w-28">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {t("search")}
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn ${showAdvanced ? "btn-primary" : "btn-ghost"} flex items-center justify-center gap-1`}
        >
          <SlidersHorizontal size={16} />
          {t("filters") || tCommon("filters")}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-current text-xs px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button onClick={saveSearch} className="btn btn-secondary min-w-0 px-2 sm:px-5">
          🔔 {t("saveSearch")}
        </button>

        <button onClick={() => setShowMap(!showMap)} className="btn btn-ghost min-w-0">
          {showMap ? t("listView") : t("mapView")}
        </button>
        </div>
      </div>

      {/* ═══ ADVANCED FILTERS ═══ */}
      {showAdvanced && (
        <div className="card p-4 mb-4 space-y-4 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">{t("advancedFilters")}</h3>
            <button
              onClick={clearFilters}
              className="text-xs text-brand-600 hover:underline flex items-center gap-1"
            >
              <X size={12} /> {t("resetAll") || tCommon("resetAll")}
            </button>
          </div>

          {/* Verified only */}
          <div>
            <label className="label">{tCommon("verified")}</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  applyFilters({
                    ...filters,
                    verified: filters.verified === "true" ? "" : "true",
                  });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 ${
                  filters.verified === "true"
                    ? "bg-success-500 text-white border-success-500"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
                }`}
              >
                <Shield size={12} /> {t("verifiedOnly")}
              </button>
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <label className="label">{t("furnishing") || tCommon("filters")}</label>
            <div className="flex flex-wrap gap-2">
              {FURNISHING_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    applyFilters({
                      ...filters,
                      furnishing:
                        filters.furnishing === o.value ? "" : o.value,
                    });
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
            <label className="label">{t("parking") || tCommon("filters")}</label>
            <div className="flex flex-wrap gap-2">
              {PARKING_OPTIONS.filter((o) => o.value !== "None").map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    applyFilters({
                      ...filters,
                      parking: filters.parking === o.value ? "" : o.value,
                    });
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
            <label className="label">{t("bathrooms") || tCommon("filters")}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    applyFilters({
                      ...filters,
                      bathrooms:
                        filters.bathrooms === String(n) ? "" : String(n),
                    });
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
            <label className="label">{t("preferredTenants") || tCommon("filters")}</label>
            <div className="flex flex-wrap gap-2">
              {TENANT_PREFERENCES.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    applyFilters({
                      ...filters,
                      preferred:
                        filters.preferred === o.value ? "" : o.value,
                    });
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
      {loadError && (
        <div
          role="alert"
          className="mb-4 flex flex-col gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Could not load properties</p>
              <p className="text-sm">{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => load(!items.length)}
            disabled={loading}
            className="btn btn-secondary shrink-0"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Try again
          </button>
        </div>
      )}
      {showMap ? (
        <div className="h-[70vh] rounded overflow-hidden">
          <MapView properties={items} />
        </div>
      ) : (
        <>
          {loading && !items.length && <PropertyGridSkeleton count={6} />}

          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((p, i) => (
                <div
                  key={p._id}
                  className="animate-card-enter"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <PropertyCard property={p} />
                  <button
                    type="button"
                    onClick={() => toggleCompare(p._id)}
                    aria-pressed={compareIds.includes(p._id)}
                    className={`mt-2 w-full btn ${
                      compareIds.includes(p._id)
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                  >
                    {compareIds.includes(p._id)
                      ? "Remove from comparison"
                      : "Add to comparison"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {!items.length && !loading && (
            !loadError && (
              <div>
                <EmptyState
                  icon={SearchX}
                  title="No properties found"
                  description={
                    activeFilterCount > 0
                      ? "Try removing some filters or search a different area."
                      : "No properties available right now."
                  }
                />
                <div className="-mt-8 pb-8 text-center">
                  {activeFilterCount > 0 ? (
                    <button type="button" onClick={clearFilters} className="btn btn-secondary">
                      {t("resetAll") || tCommon("resetAll")}
                    </button>
                  ) : (
                    <Link href="/properties/new" className="btn btn-primary">
                      {tCommon("listPropertyFree")}
                    </Link>
                  )}
                </div>
              </div>
            )
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

      {compareIds.length > 0 && !showMap && (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <span className="text-sm font-semibold">
            {compareItems.length} selected
          </span>
          <button
            type="button"
            disabled={compareItems.length < 2}
            onClick={() => setShowCompare(true)}
            className="btn btn-primary disabled:opacity-50"
          >
            Compare
          </button>
          <button
            type="button"
            onClick={() => setCompareIds([])}
            className="btn btn-ghost"
          >
            Clear
          </button>
        </div>
      )}

      {showCompare && compareItems.length >= 2 && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
        >
          <div className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 md:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 id="compare-title" className="text-xl font-bold">
                  Compare properties
                </h2>
                <p className="text-sm text-gray-500">
                  Check costs and details side by side.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompare(false)}
                aria-label="Close comparison"
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="w-40 p-3" />
                    {compareItems.map((property) => (
                      <th
                        key={property._id}
                        className="min-w-48 border-b border-gray-200 p-3 dark:border-slate-700"
                      >
                        <Link
                          href={`/properties/${property._id}`}
                          className="font-bold text-brand-700 hover:underline dark:text-brand-300"
                        >
                          {property.title}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.label} className="border-b border-gray-100 dark:border-slate-800">
                      <th className="p-3 font-semibold text-gray-600 dark:text-slate-300">
                        {row.label}
                      </th>
                      {compareItems.map((property) => (
                        <td key={property._id} className="p-3">
                          {row.value(property) || "Not specified"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCompare(false)}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
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
