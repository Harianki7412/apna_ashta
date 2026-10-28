"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Globe,
  Building2,
  Search,
  Eye,
  EyeOff,
  Home,
  ChevronDown,
  Filter,
  ArrowLeft,
} from "lucide-react";

interface StateOption {
  _id: string;
  name: string;
  slug: string;
  code?: string;
}

interface City {
  _id: string;
  name: string;
  slug: string;
  state: any; // populated object
  stateName: string;
  lat: number;
  lng: number;
  description?: string;
  areas: any[];
  active: boolean;
  isOwnerAdded?: boolean;
  propertyCount?: number;
  displayOrder?: number;
  createdAt?: string;
}

export default function AdminCitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");

  const [modal, setModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/cities");
    } else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "admin"
    ) {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [status, session, router]);

  async function loadStates() {
    try {
      const d = await api.get<StateOption[]>("/api/admin/states");
      setStates(d || []);
    } catch {}
  }

  async function loadCities() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateFilter) params.set("state", stateFilter);
      if (search) params.set("q", search);
      const d = await api.get<City[]>(`/api/admin/cities?${params.toString()}`);
      setCities(d || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as any)?.role === "admin"
    ) {
      loadStates();
    }
  }, [status, session]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as any)?.role === "admin"
    ) {
      loadCities();
    }
  }, [stateFilter, status, session]);

  async function save() {
    if (!modal) return;
    if (!modal.name?.trim()) return toast.error("City name required");
    if (!modal.stateId && !modal._id) return toast.error("Select a state");

    setSaving(true);
    try {
      if (modal._id) {
        // Update
        const { _id, name, state, stateName, ...updates } = modal;
        await api.patch(`/api/admin/cities/${_id}`, updates);
        toast.success("City updated");
      } else {
        // Create
        await api.post("/api/admin/cities", {
          name: modal.name,
          stateId: modal.stateId,
          lat: Number(modal.lat) || undefined,
          lng: Number(modal.lng) || undefined,
          description: modal.description,
        });
        toast.success("City created");
      }
      setModal(null);
      await loadCities();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(city: City) {
    if (
      !confirm(
        `Delete "${city.name}"? ${
          city.propertyCount
            ? `${city.propertyCount} properties exist — deletion will fail.`
            : ""
        }`,
      )
    )
      return;

    try {
      await api.delete(`/api/admin/cities/${city._id}`);
      toast.success("City deleted");
      await loadCities();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function toggleActive(city: City) {
    try {
      await api.patch(`/api/admin/cities/${city._id}`, {
        active: !city.active,
      });
      await loadCities();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const filtered = useMemo(() => {
    if (!search) return cities;
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()),
    );
  }, [cities, search]);

  const stats = useMemo(
    () => ({
      total: cities.length,
      active: cities.filter((c) => c.active).length,
      ownerAdded: cities.filter((c) => c.isOwnerAdded).length,
      totalProps: cities.reduce((s, c) => s + (c.propertyCount || 0), 0),
    }),
    [cities],
  );

  if (status === "loading" || loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 hover:text-brand-600 mb-4"
      >
        <ArrowLeft size={16} /> Back to Admin
      </Link>

      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
            <Building2 className="text-brand-600" size={28} />
            Cities Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage cities across all states — for property listings & SEO
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/states" className="btn btn-ghost btn-sm">
            <Globe size={14} /> States
          </Link>
          <button
            onClick={() => {
              setModal({
                name: "",
                stateId: stateFilter || "",
                lat: "",
                lng: "",
                description: "",
              });
            }}
            className="btn btn-primary btn-sm"
            disabled={states.length === 0}
          >
            <Plus size={16} /> Add City
          </button>
        </div>
      </div>

      {/* No states warning */}
      {states.length === 0 && (
        <div className="mb-6 p-4 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-500">
          <p className="text-sm font-semibold text-warning-700 dark:text-warning-300 mb-1">
            No states available
          </p>
          <p className="text-xs text-warning-600 dark:text-warning-400 mb-3">
            Add states first before creating cities.
          </p>
          <Link href="/admin/states" className="btn btn-sm btn-primary">
            <Globe size={14} /> Manage States
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Cities",
            value: stats.total,
            icon: Building2,
            color: "brand",
          },
          { label: "Active", value: stats.active, icon: Eye, color: "success" },
          {
            label: "Owner-added",
            value: stats.ownerAdded,
            icon: MapPin,
            color: "accent",
          },
          {
            label: "Properties",
            value: stats.totalProps,
            icon: Home,
            color: "gray",
          },
        ].map((s) => {
          const Icon = s.icon;
          const colors: any = {
            brand:
              "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400",
            success:
              "bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400",
            accent: "bg-accent-400/20 text-accent-600 dark:text-accent-400",
            gray: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300",
          };
          return (
            <div key={s.label} className="card p-4">
              <div
                className={`w-9 h-9 rounded-lg ${colors[s.color]} flex items-center justify-center mb-2`}
              >
                <Icon size={18} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
                {s.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="input w-56"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
                {s.code ? ` (${s.code})` : ""}
              </option>
            ))}
          </select>
          {(stateFilter || search) && (
            <button
              onClick={() => {
                setStateFilter("");
                setSearch("");
              }}
              className="btn btn-ghost btn-sm"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Cities List */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2
            size={48}
            className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-slate-400 mb-4">
            {search || stateFilter
              ? "No cities match your filters"
              : "No cities yet"}
          </p>
          {states.length > 0 && (
            <button
              onClick={() =>
                setModal({
                  name: "",
                  stateId: stateFilter || "",
                  lat: "",
                  lng: "",
                  description: "",
                })
              }
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} /> Add First City
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((city) => {
            const stateName =
              typeof city.state === "object"
                ? city.state?.name
                : city.stateName;
            const stateCode =
              typeof city.state === "object" ? city.state?.code : "";

            return (
              <div
                key={city._id}
                className={`card p-4 transition-all ${
                  !city.active ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      city.active
                        ? "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-400"
                    }`}
                  >
                    <Building2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 truncate">
                        {city.name}
                      </h3>
                      {!city.active && (
                        <span className="badge badge-warning text-[10px]">
                          Inactive
                        </span>
                      )}
                      {city.isOwnerAdded && (
                        <span className="badge badge-accent text-[10px] bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {stateName}
                      {stateCode ? ` · ${stateCode}` : ""}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-0.5">
                      {city.slug}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mb-3 pb-3 border-b border-gray-100 dark:border-slate-700">
                  <span className="flex items-center gap-1">
                    <Home size={11} /> {city.propertyCount || 0} props
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {city.areas?.length || 0} areas
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(city)}
                    className={`p-2 rounded-lg transition-colors ${
                      city.active
                        ? "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                        : "text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900/20"
                    }`}
                    title={city.active ? "Deactivate" : "Activate"}
                  >
                    {city.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() =>
                      setModal({
                        ...city,
                        stateId:
                          typeof city.state === "object"
                            ? city.state._id
                            : city.state,
                      })
                    }
                    className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => remove(city)}
                    className="p-2 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 ml-auto"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  {modal._id ? <Edit size={18} /> : <Plus size={18} />}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  {modal._id ? "Edit City" : "Add New City"}
                </h2>
              </div>
              <button
                onClick={() => setModal(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">
                  City Name <span className="text-danger-500">*</span>
                </label>
                <input
                  className="input"
                  value={modal.name || ""}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                  disabled={!!modal._id}
                  placeholder="e.g. Bhopal"
                  autoFocus
                />
                {modal._id && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Name is immutable after creation
                  </p>
                )}
              </div>

              <div>
                <label className="label">
                  State <span className="text-danger-500">*</span>
                </label>
                <select
                  className="input"
                  value={modal.stateId || ""}
                  onChange={(e) => {
                    const state = states.find((s) => s._id === e.target.value);
                    setModal({
                      ...modal,
                      stateId: e.target.value,
                      stateName: state?.name,
                    });
                  }}
                  disabled={!!modal._id}
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                      {s.code ? ` (${s.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="input"
                    value={modal.lat || ""}
                    onChange={(e) =>
                      setModal({ ...modal, lat: e.target.value })
                    }
                    placeholder="23.5"
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="input"
                    value={modal.lng || ""}
                    onChange={(e) =>
                      setModal({ ...modal, lng: e.target.value })
                    }
                    placeholder="78.5"
                  />
                </div>
              </div>

              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  rows={2}
                  className="input"
                  value={modal.description || ""}
                  onChange={(e) =>
                    setModal({ ...modal, description: e.target.value })
                  }
                  placeholder="Short intro for SEO"
                />
              </div>

              {modal._id && (
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={modal.active !== false}
                    onChange={(e) =>
                      setModal({ ...modal, active: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-brand-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Active (visible on site)
                  </span>
                </label>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="flex-1 btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
