"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  Crown,
  Zap,
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const TYPES = [
  { key: "subscription", label: "Subscriptions", icon: Crown, color: "brand" },
  { key: "lead_pack", label: "Lead Packs", icon: Zap, color: "accent" },
  { key: "featured", label: "Featured Tiers", icon: Star, color: "success" },
] as const;

const EMPTY_PLAN: any = {
  planId: "",
  name: "",
  description: "",
  price: 0,
  yearlyPrice: null,
  icon: "🎁",
  color: "brand",
  recommended: false,
  badge: "",
  features: [],
  listingLimit: 2,
  photosPerListing: 5,
  leadsPerProperty: 10,
  isFree: false,
  leadsIncluded: 0,
  validityDays: 30,
  featuredDays: 30,
  featuredTier: "basic",
  displayOrder: 0,
  hidden: false,
  active: true,
};

export default function AdminPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"subscription" | "lead_pack" | "featured">(
    "subscription",
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/admin/plans");
    else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "admin"
    ) {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/api/admin/plans");
      setPlans(data);
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
    if (!confirm("Seed default plans? Existing plans won't be touched."))
      return;
    setSeeding(true);
    try {
      const r = await api.post<any>("/api/admin/seed-plans", {});
      toast.success(`Created ${r.created}, skipped ${r.skipped}`);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSeeding(false);
    }
  }

  async function save() {
    if (!editing) return;
    if (!editing.planId?.trim() || !editing.name?.trim()) {
      return toast.error("Plan ID and Name required");
    }
    setSaving(true);
    try {
      if (editing._id) {
        const { _id, ...rest } = editing;
        await api.patch(`/api/admin/plans/${_id}`, rest);
        toast.success("Plan updated");
      } else {
        await api.post("/api/admin/plans", { ...editing, type: tab });
        toast.success("Plan created");
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: any) {
    try {
      await api.patch(`/api/admin/plans/${plan._id}`, { active: !plan.active });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function toggleHidden(plan: any) {
    try {
      await api.patch(`/api/admin/plans/${plan._id}`, { hidden: !plan.hidden });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function remove(plan: any) {
    if (!confirm(`Delete "${plan.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/plans/${plan._id}?hard=true`);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading" || loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  const current = plans.filter((p) => p.type === tab);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-bold">Plans Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Add, edit, or remove plans anytime — no code changes needed
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
            onClick={() =>
              setEditing({ ...EMPTY_PLAN, displayOrder: current.length + 1 })
            }
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Add Plan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const count = plans.filter((p) => p.type === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.key
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
              }`}
            >
              <Icon size={16} /> {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plans List */}
      {current.length === 0 ? (
        <div className="card p-12 text-center">
          <Package
            size={48}
            className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-slate-400 mb-4">No plans yet</p>
          <button onClick={seed} className="btn btn-primary btn-sm">
            Seed Defaults
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {current.map((plan) => (
            <div
              key={plan._id}
              className={`card p-4 ${!plan.active ? "opacity-50" : ""} ${plan.hidden ? "border-dashed" : ""}`}
            >
              <div className="flex items-start gap-3 flex-wrap">
                <div className="text-3xl">{plan.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <span className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {plan.planId}
                    </span>
                    {plan.recommended && (
                      <span className="badge badge-featured">
                        ⭐ Recommended
                      </span>
                    )}
                    {plan.hidden && (
                      <span className="badge badge-warning">Hidden</span>
                    )}
                    {!plan.active && (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </div>
                  <p className="text-2xl font-extrabold text-brand-600">
                    ₹{plan.price.toLocaleString("en-IN")}
                    {plan.billingCycle === "monthly" && (
                      <span className="text-sm text-gray-500">/mo</span>
                    )}
                  </p>
                  {plan.features?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {plan.features.slice(0, 3).join(" · ")}
                      {plan.features.length > 3 &&
                        ` +${plan.features.length - 3} more`}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleHidden(plan)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                    title={plan.hidden ? "Show" : "Hide"}
                  >
                    {plan.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => setEditing(plan)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => remove(plan)}
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

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editing._id ? "Edit Plan" : "Add New Plan"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Plan ID *</label>
                  <input
                    className="input"
                    value={editing.planId}
                    onChange={(e) =>
                      setEditing({ ...editing, planId: e.target.value })
                    }
                    disabled={!!editing._id}
                    placeholder="e.g. pro"
                  />
                </div>
                <div>
                  <label className="label">Display Name *</label>
                  <input
                    className="input"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    placeholder="e.g. Pro"
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <input
                  className="input"
                  value={editing.description || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Short description (optional)"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Price (₹) *</label>
                  <input
                    type="number"
                    className="input"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="label">Yearly Price (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={editing.yearlyPrice || ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        yearlyPrice: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Icon + Color */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Icon (emoji)</label>
                  <input
                    className="input text-center text-2xl"
                    value={editing.icon}
                    onChange={(e) =>
                      setEditing({ ...editing, icon: e.target.value })
                    }
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="label">Badge</label>
                  <input
                    className="input"
                    value={editing.badge || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, badge: e.target.value })
                    }
                    placeholder="e.g. BEST VALUE"
                  />
                </div>
                <div>
                  <label className="label">Order</label>
                  <input
                    type="number"
                    className="input"
                    value={editing.displayOrder}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        displayOrder: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {tab === "subscription" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Listing Limit</label>
                    <input
                      type="number"
                      className="input"
                      value={editing.listingLimit}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          listingLimit: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Photos Each</label>
                    <input
                      type="number"
                      className="input"
                      value={editing.photosPerListing}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          photosPerListing: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Leads/Property</label>
                    <input
                      type="number"
                      className="input"
                      value={editing.leadsPerProperty}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          leadsPerProperty: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {tab === "lead_pack" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Leads Included</label>
                    <input
                      type="number"
                      className="input"
                      value={editing.leadsIncluded}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          leadsIncluded: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Validity (days)</label>
                    <input
                      type="number"
                      className="input"
                      value={editing.validityDays}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          validityDays: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {tab === "featured" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Duration (days)</label>
                    <input
                      type="number"
                      className="input"
                      value={editing.featuredDays}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          featuredDays: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Tier</label>
                    <select
                      className="input"
                      value={editing.featuredTier}
                      onChange={(e) =>
                        setEditing({ ...editing, featuredTier: e.target.value })
                      }
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <label className="label">Features (one per line)</label>
                <textarea
                  rows={5}
                  className="input"
                  value={(editing.features || []).join("\n")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      features: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  placeholder="10 listings&#10;Unlimited photos&#10;Priority support"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.recommended}
                    onChange={(e) =>
                      setEditing({ ...editing, recommended: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Recommended</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.hidden}
                    onChange={(e) =>
                      setEditing({ ...editing, hidden: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Hidden</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) =>
                      setEditing({ ...editing, active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditing(null)}
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
