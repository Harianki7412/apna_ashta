"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { EmptyState } from "@/components/EmptyState";
import {
  Bell,
  Search,
  Trash2,
  MapPin,
  IndianRupee,
  Home,
  Clock,
} from "lucide-react";

export default function SavedSearchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/saved-searches");
    }
  }, [status, router]);

  async function load() {
    try {
      const data = await api.get<any[]>("/api/saved-searches");
      setSearches(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  async function remove(id: string) {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete("/api/saved-searches", { id });
      setSearches((s) => s.filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function searchUrl(s: any) {
    const params = new URLSearchParams();
    Object.entries(s.filters || {}).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    return `/properties?${params.toString()}`;
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="skeleton h-24 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Saved Searches</h1>
          <p className="text-gray-500 mt-1">Get notified of new matches</p>
        </div>
        <Link href="/properties" className="btn btn-primary">
          <Search size={16} /> New Search
        </Link>
      </div>

      {searches.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Search}
            title="No saved searches"
            description="Save your filters to get alerts."
            actionLabel="Browse"
            actionHref="/properties"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => (
            <div key={s._id} className="card p-4 hover:shadow-card-hover">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold">{s.name}</h3>
                    {s.notifyOnNew ? (
                      <span className="badge badge-success">
                        <Bell size={10} /> ON
                      </span>
                    ) : (
                      <span className="badge badge-warning">OFF</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {s.filters.area && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <MapPin size={10} /> {s.filters.area}
                      </span>
                    )}
                    {s.filters.type && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <Home size={10} /> {s.filters.type}
                      </span>
                    )}
                    {(s.filters.min || s.filters.max) && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <IndianRupee size={10} /> {s.filters.min || 0} -{" "}
                        {s.filters.max || "∞"}
                      </span>
                    )}
                  </div>
                  {s.lastNotifiedAt && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock size={10} /> Last notified{" "}
                      {new Date(s.lastNotifiedAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(searchUrl(s))}
                    className="btn btn-secondary btn-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => remove(s._id)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-danger-50 hover:text-danger-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
