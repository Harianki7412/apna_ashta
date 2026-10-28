"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import {
  MapPin,
  ArrowLeft,
  Trash2,
  Home,
  Building2,
  User,
  Loader2,
} from "lucide-react";

export default function AdminLocationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"cities" | "areas">("cities");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/admin/locations");
    else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "admin"
    )
      router.push("/");
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get<any[]>(`/api/admin/locations?type=${tab}`);
      setItems(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "admin")
      load();
  }, [tab, status, session]);

  async function remove(item: any) {
    const isArea = tab === "areas";
    if (!confirm(`Delete ${isArea ? "area" : "city"} "${item.name}"?`)) return;
    try {
      const params = isArea
        ? `?type=area&cityId=${item.cityId}&areaId=${item._id}`
        : `?type=city&cityId=${item._id}`;
      await api.delete(`/api/admin/locations${params}`);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading" || loading)
    return <div className="skeleton h-96 rounded-2xl" />;

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 hover:text-brand-600 mb-4"
      >
        <ArrowLeft size={16} /> Back to Admin
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <MapPin className="text-brand-600" size={28} />
          Owner-Submitted Locations
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Review cities & areas added by owners. Delete if fake or duplicate.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("cities")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "cities"
              ? "bg-brand-600 text-white"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
          }`}
        >
          <Building2 size={14} className="inline mr-1" /> Cities
        </button>
        <button
          onClick={() => setTab("areas")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "areas"
              ? "bg-brand-600 text-white"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
          }`}
        >
          <Home size={14} className="inline mr-1" /> Areas
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin
            size={40}
            className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-slate-400">
            No {tab} added by owners yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                {tab === "cities" ? (
                  <Building2 size={18} />
                ) : (
                  <Home size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {tab === "cities"
                    ? `${item.stateName} · ${item.areas?.length || 0} areas`
                    : `${item.cityName}, ${item.stateName} · ${item.type || "area"}`}
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <User size={10} />{" "}
                  {item.createdBy?.name || item.cityCreatedBy?.name || "Owner"}{" "}
                  · {format(new Date(item.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <button
                onClick={() => remove(item)}
                className="p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
