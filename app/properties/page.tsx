"use client";
import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import MapView from "@/components/MapView";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function PropertiesPage() {
  const t = useTranslations("search");
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    area: "",
    type: "",
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
        name: `Search in ${filters.area || "Ashta"}`,
        filters,
      });
      toast.success("Search saved!");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder={t("placeholder")}
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          className="border p-2 rounded flex-1 min-w-48"
        />
        <input
          placeholder={t("area")}
          value={filters.area}
          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
          className="border p-2 rounded w-32"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">{t("allTypes")}</option>
          <option>Room</option>
          <option>Home</option>
          <option>Flat</option>
        </select>
        <input
          placeholder={t("minPrice")}
          type="number"
          value={filters.min}
          onChange={(e) => setFilters({ ...filters, min: e.target.value })}
          className="border p-2 rounded w-24"
        />
        <input
          placeholder={t("maxPrice")}
          type="number"
          value={filters.max}
          onChange={(e) => setFilters({ ...filters, max: e.target.value })}
          className="border p-2 rounded w-24"
        />
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="newest">{t("newest")}</option>
          <option value="price_asc">{t("priceLow")}</option>
          <option value="price_desc">{t("priceHigh")}</option>
        </select>
        <button
          onClick={() => load(true)}
          className="bg-blue-600 text-white px-4 rounded"
        >
          {t("search")}
        </button>
        <button onClick={saveSearch} className="border px-4 rounded">
          🔔 {t("saveSearch")}
        </button>
        <button
          onClick={() => setShowMap(!showMap)}
          className="border px-4 rounded"
        >
          {showMap ? t("listView") : t("mapView")}
        </button>
      </div>

      {showMap ? (
        <div className="h-[70vh] rounded overflow-hidden">
          <MapView properties={items} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
          {!items.length && !loading && (
            <p className="text-center text-gray-500 mt-6">{t("loadMore")}</p>
          )}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => load(false)}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
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
