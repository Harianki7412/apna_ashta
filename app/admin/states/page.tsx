"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  RefreshCw,
  Building2,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";

interface State {
  _id: string;
  name: string;
  slug: string;
  code?: string;
  lat?: number;
  lng?: number;
  active: boolean;
  displayOrder: number;
  cityCount?: number;
}

export default function AdminStatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [modal, setModal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/admin/states");
    else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "admin"
    )
      router.push("/");
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get<State[]>("/api/admin/states");
      setStates(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "admin")
      load();
  }, [status, session]);

  async function seed() {
    if (!confirm("Seed default states (MP, MH, RJ, UP, GJ)?")) return;
    setSeeding(true);
    try {
      const r = await api.post<any>("/api/admin/seed-states", {});
      toast.success(`Created ${r.created}, skipped ${r.skipped}`);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSeeding(false);
    }
  }

  async function save() {
    if (!modal?.name?.trim()) return toast.error("Name required");
    setSaving(true);
    try {
      if (modal._id) {
        const { _id, cityCount, slug, ...updates } = modal;
        await api.patch(`/api/admin/states/${_id}`, updates);
        toast.success("State updated");
      } else {
        await api.post("/api/admin/states", {
          name: modal.name,
          code: modal.code,
          lat: modal.lat,
          lng: modal.lng,
        });
        toast.success("State created");
      }
      setModal(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(state: State) {
    if (
      !confirm(
        `Delete "${state.name}"? ${state.cityCount ? `${state.cityCount} cities exist — will fail.` : ""}`,
      )
    )
      return;
    try {
      await api.delete(`/api/admin/states/${state._id}`);
      toast.success("State deleted");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function toggleActive(state: State) {
    try {
      await api.patch(`/api/admin/states/${state._id}`, {
        active: !state.active,
      });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading" || loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Globe className="text-brand-600" size={28} />
            States
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Top-level geographic hierarchy. Owners add cities & areas under
            states.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={seed}
            disabled={seeding}
            className="btn btn-ghost btn-sm"
          >
            <RefreshCw size={14} className={seeding ? "animate-spin" : ""} />
            {seeding ? "Seeding..." : "Seed Defaults"}
          </button>
          <button
            onClick={() => setModal({ name: "", code: "" })}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Add State
          </button>
        </div>
      </div>

      {states.length === 0 ? (
        <div className="card p-12 text-center">
          <Globe
            size={48}
            className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-slate-400 mb-4">
            No states yet
          </p>
          <button onClick={seed} className="btn btn-primary btn-sm">
            Seed Defaults
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {states.map((s) => (
            <div
              key={s._id}
              className={`card p-4 ${!s.active ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{s.name}</h3>
                    {s.code && (
                      <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                        {s.code}
                      </span>
                    )}
                    {!s.active && (
                      <span className="badge badge-warning">Inactive</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {s.cityCount || 0} cities · {s.slug}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleActive(s)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                  >
                    {s.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => setModal({ ...s })}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {modal._id ? "Edit State" : "Add New State"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Name *</label>
                <input
                  className="input"
                  value={modal.name || ""}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                  placeholder="e.g. Madhya Pradesh"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Code</label>
                  <input
                    className="input"
                    value={modal.code || ""}
                    onChange={(e) =>
                      setModal({ ...modal, code: e.target.value.toUpperCase() })
                    }
                    placeholder="MP"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="label">Order</label>
                  <input
                    type="number"
                    className="input"
                    value={modal.displayOrder || 0}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        displayOrder: Number(e.target.value),
                      })
                    }
                  />
                </div>
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
                      setModal({ ...modal, lat: Number(e.target.value) })
                    }
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
                      setModal({ ...modal, lng: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
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
