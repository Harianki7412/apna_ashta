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
  Sparkles,
  TrendingUp,
  CheckCircle2,
  IndianRupee,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TYPES = [
  {
    key: "subscription",
    label: "Subscriptions",
    icon: Crown,
    color: "brand",
    desc: "Recurring plans",
  },
  {
    key: "lead_pack",
    label: "Lead Packs",
    icon: Zap,
    color: "accent",
    desc: "Pay-per-lead bundles",
  },
  {
    key: "featured",
    label: "Featured Tiers",
    icon: Star,
    color: "success",
    desc: "Listing boosts",
  },
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
  const [featuresOpen, setFeaturesOpen] = useState(true);

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
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-16 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const current = plans.filter((p) => p.type === tab);
  const activeType = TYPES.find((t) => t.key === tab)!;

  return (
    <div>
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 md:p-8 mb-6 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Package size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Plans Management
              </h1>
              <p className="text-sm text-brand-100 mt-1">
                Create and manage pricing — no code changes needed
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={seed}
              disabled={seeding}
              className="btn bg-white/20 backdrop-blur border border-white/30 text-white hover:bg-white/30 btn-sm"
            >
              <RefreshCw size={14} className={seeding ? "animate-spin" : ""} />
              {seeding ? "Seeding..." : "Seed Defaults"}
            </button>
            <button
              onClick={() => {
                setEditing({ ...EMPTY_PLAN, displayOrder: current.length + 1 });
                setFeaturesOpen(true);
              }}
              className="btn bg-white text-brand-700 hover:bg-brand-50 btn-sm"
            >
              <Plus size={16} /> Add Plan
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const count = plans.filter((p) => p.type === t.key).length;
            const activeCount = plans.filter(
              (p) => p.type === t.key && p.active,
            ).length;
            return (
              <div
                key={t.key}
                className="bg-white/10 backdrop-blur rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className="text-brand-200" />
                  <span className="text-xs font-medium text-brand-100">
                    {t.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">{count}</span>
                  <span className="text-xs text-brand-200">
                    ({activeCount} active)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const count = plans.filter((p) => p.type === t.key).length;
          const active = tab === t.key;

          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 -translate-y-0.5"
                  : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-600"
              }`}
            >
              <Icon size={16} />
              <div className="text-left">
                <div>{t.label}</div>
                <div
                  className={`text-[10px] font-normal ${active ? "text-brand-100" : "text-gray-500 dark:text-slate-400"}`}
                >
                  {t.desc}
                </div>
              </div>
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  active ? "bg-white/25" : "bg-gray-100 dark:bg-slate-700"
                }`}
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
          <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
            <activeType.icon
              size={36}
              className="text-brand-400 dark:text-brand-500"
            />
          </div>
          <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-slate-100">
            No {activeType.label.toLowerCase()} yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            Start by seeding defaults or create a custom plan.
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={seed} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} /> Seed Defaults
            </button>
            <button
              onClick={() =>
                setEditing({ ...EMPTY_PLAN, displayOrder: current.length + 1 })
              }
              className="btn btn-primary btn-sm"
            >
              <Plus size={14} /> Add Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {current.map((plan) => (
            <div
              key={plan._id}
              className={`relative overflow-hidden rounded-2xl p-5 transition-all hover-lift ${
                !plan.active
                  ? "opacity-60 border-2 border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  : plan.recommended
                    ? "border-2 border-brand-500 dark:border-brand-500 bg-gradient-to-br from-brand-50 via-white to-white dark:from-brand-900/20 dark:via-slate-800 dark:to-slate-800 shadow-lg shadow-brand-500/10"
                    : "border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              }`}
            >
              {plan.recommended && plan.active && (
                <div className="absolute top-3 right-3 badge badge-featured text-[10px]">
                  <Sparkles size={8} /> RECOMMENDED
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                    plan.recommended
                      ? "bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/30"
                      : "bg-gray-100 dark:bg-slate-700"
                  }`}
                >
                  {plan.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">
                      {plan.name}
                    </h3>
                    {plan.hidden && (
                      <span className="badge badge-warning text-[10px]">
                        Hidden
                      </span>
                    )}
                    {!plan.active && (
                      <span className="badge badge-danger text-[10px]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <code className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {plan.planId}
                  </code>
                  {plan.badge && (
                    <span className="ml-2 text-[10px] bg-accent-500 text-white px-2 py-0.5 rounded font-bold">
                      {plan.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">
                    ₹{plan.price?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    {plan.billingCycle === "monthly"
                      ? "/mo"
                      : plan.billingCycle === "yearly"
                        ? "/yr"
                        : " one-time"}
                  </span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Yearly: ₹{plan.yearlyPrice.toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              {plan.features?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">
                    {plan.features.length} Features
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
                    {plan.features.slice(0, 4).map((f: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-slate-400"
                      >
                        <CheckCircle2
                          size={10}
                          className="text-success-500 flex-shrink-0 mt-0.5"
                        />
                        <span className="line-clamp-1">{f}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                        +{plan.features.length - 4} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() => toggleHidden(plan)}
                  className={`p-2 rounded-lg transition-colors ${
                    plan.hidden
                      ? "text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-900/20"
                      : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                  title={plan.hidden ? "Show" : "Hide"}
                >
                  {plan.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => toggleActive(plan)}
                  className={`p-2 rounded-lg transition-colors ${
                    plan.active
                      ? "text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20"
                      : "text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                  title={plan.active ? "Deactivate" : "Activate"}
                >
                  <CheckCircle2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditing({ ...plan });
                    setFeaturesOpen(true);
                  }}
                  className="p-2 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors ml-auto"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => remove(plan)}
                  className="p-2 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-brand-600 to-brand-700 text-white p-5 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {editing._id ? <Edit size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {editing._id ? "Edit Plan" : "Create Plan"}
                  </h2>
                  <p className="text-xs text-brand-100">{activeType.label}</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Basic Info */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Package size={14} /> Basic Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Plan ID *</label>
                      <input
                        className="input font-mono text-sm"
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
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IndianRupee size={14} /> Pricing
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Price (₹) *</label>
                    <input
                      type="number"
                      className="input"
                      value={editing.price}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          price: Number(e.target.value),
                        })
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
              </div>

              {/* Appearance */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles size={14} /> Appearance
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label">Icon</label>
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
              </div>

              {/* Type-specific fields */}
              {tab === "subscription" && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users size={14} /> Limits
                  </h3>
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

              {/* Features Section */}
              <div>
                <button
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  className="flex items-center justify-between w-full text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={14} /> Features (one per line)
                  </span>
                  {featuresOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                {featuresOpen && (
                  <textarea
                    rows={5}
                    className="input font-mono text-sm"
                    value={(editing.features || []).join("\n")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        features: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    placeholder="10 listings&#10;Unlimited photos&#10;Priority support"
                  />
                )}
              </div>

              {/* Toggles */}
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Visibility
                </h3>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.recommended}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          recommended: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-brand-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Recommended
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.hidden}
                      onChange={(e) =>
                        setEditing({ ...editing, hidden: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-brand-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Hidden
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editing.active}
                      onChange={(e) =>
                        setEditing({ ...editing, active: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-brand-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Active
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 p-4 flex gap-2">
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
                    <Save size={14} />{" "}
                    {editing._id ? "Save Changes" : "Create Plan"}
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
