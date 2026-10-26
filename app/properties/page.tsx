"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PropertyCard from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/PropertyCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { SearchX, MapPin } from "lucide-react";
import { CITIES } from "@/lib/cities";
import { BHK_OPTIONS } from "@/lib/property-types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] bg-gray-100 rounded flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  ),
});

export default function PropertiesPage() {
  const t = useTranslations("search");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCity = searchParams.get("city") || "";

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    city: initialCity,
    area: "",
    type: "",
    bhk: "",
    min: "",
    max: "",
    q: "",
    sort: "newest",
  });

  async function load(reset = true) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(reset ? 1 : page),
        limit: "12",
      });
      Object.entries(filters).forEach(
        ([k, v]) => v && params.set(k, String(v)),
      );
      const d = await api.get<any>(`/api/properties?${params}`);
      if (reset) {
        setItems(d.items);
        setPage(2);
      } else {
        setItems((p) => [...p, ...d.items]);
        setPage((p) => p + 1);
      }
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

  async function saveSearch() {
    if (!session) return router.push("/login");
    try {
      await api.post("/api/saved-searches", {
        name: `Search in ${filters.city || "All cities"}${filters.area ? " - " + filters.area : ""}`,
        filters,
      });
      toast.success("Search saved!");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      {/* City tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => {
            setFilters({ ...filters, city: "", area: "" });
            setTimeout(() => load(true), 0);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            !filters.city
              ? "bg-brand-600 text-white shadow-button"
              : "bg-white border border-gray-200 text-gray-700 hover:border-brand-300"
          }`}
        >
          <MapPin size={14} /> All Cities
        </button>
        {CITIES.map((c) => (
          <button
            key={c.slug}
            onClick={() => {
              setFilters({ ...filters, city: c.name, area: "" });
              setTimeout(() => load(true), 0);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filters.city === c.name
                ? "bg-brand-600 text-white shadow-button"
                : "bg-white border border-gray-200 text-gray-700 hover:border-brand-300"
            }`}
          >
            <MapPin size={14} /> {c.name}
          </button>
        ))}
      </div>

      {/* BHK quick filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => {
            setFilters({ ...filters, bhk: "" });
            setTimeout(() => load(true), 0);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !filters.bhk
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
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
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder={t("placeholder")}
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          className="input flex-1 min-w-48"
        />
        <input
          placeholder={t("area")}
          value={filters.area}
          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          className="input w-32"
        />
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
          placeholder={t("minPrice")}
          type="number"
          value={filters.min}
          onChange={(e) => setFilters({ ...filters, min: e.target.value })}
          className="input w-24"
        />
        <input
          placeholder={t("maxPrice")}
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
        <button onClick={saveSearch} className="btn btn-secondary">
          🔔 {t("saveSearch")}
        </button>
        <button onClick={() => setShowMap(!showMap)} className="btn btn-ghost">
          {showMap ? t("listView") : t("mapView")}
        </button>
      </div>

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
              description="Try changing filters or select a different city."
              actionLabel="Clear Filters"
              actionHref="/properties"
            />
          )}
          {hasMore && items.length > 0 && (
            <div className="text-center mt-6">
              <button
                onClick={() => load(false)}
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                {loading ? "..." : t("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
