"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  User,
  Lock,
  Shield,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Mail,
  Phone,
  Building2,
  Star,
  ChevronRight,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
  Home,
  FileText,
  Download,
  ExternalLink,
  X,
  Clock,
  MessageCircle,
  Zap,
  Package,
  TrendingUp,
  Calendar,
  CreditCard,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Suspense } from "react";

function ProfileContent() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [profile, setProfile] = useState<any>({
    name: "",
    email: "",
    phone: "",
    phoneVerified: false,
    kycStatus: "none",
    role: "tenant",
    createdAt: "",
    referralCode: "",
    credits: 0,
    referralCount: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [leadPacks, setLeadPacks] = useState<any[]>([]);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const isOwner = profile.role === "owner" || profile.role === "admin";
  const isVerified = profile.kycStatus === "verified";

  // ═══ Load all data in parallel ═══
  async function loadAll() {
    if (status !== "authenticated") return;
    try {
      const [profileData, subData, leadData] = await Promise.all([
        api.get<any>("/api/profile").catch(() => null),
        api.get<any>("/api/subscription").catch(() => null),
        api.get<any>("/api/lead-pack").catch(() => []),
      ]);

      if (profileData) {
        setProfile({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          phoneVerified: profileData.phoneVerified,
          kycStatus: profileData.kycStatus,
          role: profileData.role,
          createdAt: profileData.createdAt,
          referralCode: profileData.referralCode || "",
          credits: profileData.credits || 0,
          referralCount: profileData.referralCount || 0,
        });
      }

      if (subData) {
        setSubscription(subData);
      }

      if (Array.isArray(leadData)) {
        setLeadPacks(leadData);
      } else if (leadData?.data && Array.isArray(leadData.data)) {
        setLeadPacks(leadData.data);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/profile");
  }, [status, router]);

  useEffect(() => {
    loadAll();
  }, [status]);

  // ═══ Refresh when redirected back with ?updated=1 ═══
  useEffect(() => {
    if (searchParams.get("updated") === "1") {
      loadAll();
      toast.success("Subscription updated!");
      // Clean URL
      router.replace("/profile", { scroll: false });
    }
  }, [searchParams]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/profile", {
        name: profile.name,
        phone: profile.phone,
      });
      await updateSession();
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm)
      return toast.error("Passwords do not match");
    if (pwdForm.newPassword.length < 6) return toast.error("Min 6 chars");
    setChangingPwd(true);
    try {
      await api.post("/api/profile/password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setChangingPwd(false);
    }
  }

  async function deleteAccount() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    try {
      await api.delete("/api/profile");
      await signOut({ callbackUrl: "/", redirect: true });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // ═══ Helper: get current plan ═══
  function getCurrentPlan() {
    if (!subscription?.current)
      return {
        id: "free",
        name: "Free",
        icon: "🎁",
        listingLimit: 2,
        photosPerListing: 5,
        leadsPerProperty: 10,
      };
    const planId = subscription.current.planId || "free";
    if (planId === "free")
      return {
        id: "free",
        name: "Free",
        icon: "🎁",
        listingLimit: 2,
        photosPerListing: 5,
        leadsPerProperty: 10,
      };
    if (planId === "pro")
      return {
        id: "pro",
        name: "Pro",
        icon: "⭐",
        listingLimit: 10,
        photosPerListing: 15,
        leadsPerProperty: 50,
      };
    if (planId === "business")
      return {
        id: "business",
        name: "Business",
        icon: "👑",
        listingLimit: 999,
        photosPerListing: 25,
        leadsPerProperty: 200,
      };
    return {
      id: planId,
      name: planId,
      icon: "📦",
      listingLimit: 0,
      photosPerListing: 0,
      leadsPerProperty: 0,
    };
  }

  const currentPlan = getCurrentPlan();
  const subActive =
    subscription?.current?.expiresAt &&
    new Date(subscription.current.expiresAt) > new Date();
  const daysLeft = subscription?.current?.expiresAt
    ? Math.max(
        0,
        differenceInDays(new Date(subscription.current.expiresAt), new Date()),
      )
    : 0;

  // ═══ Active lead packs ═══
  const activeLeadPacks = leadPacks.filter(
    (p: any) => p.status === "active" && new Date(p.expiresAt) > new Date(),
  );
  const totalLeadsRemaining = activeLeadPacks.reduce(
    (sum: number, p: any) =>
      sum + Math.max(0, (p.totalLeads || 0) - (p.usedLeads || 0)),
    0,
  );

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-40 rounded-3xl" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ═══ PROFILE HERO ═══ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-6 md:p-8 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
        </div>

        <div className="relative flex items-start gap-5 flex-wrap">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center font-extrabold text-4xl shadow-xl flex-shrink-0">
            {profile.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                {profile.name}
              </h1>
              {isVerified && (
                <span className="bg-white/20 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-brand-100 truncate">{profile.email}</p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="bg-white/20 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full capitalize flex items-center gap-1">
                {isOwner ? <Building2 size={12} /> : <User size={12} />}
                {profile.role}
              </span>
              {profile.phoneVerified && (
                <span className="bg-success-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Phone size={10} /> Phone verified
                </span>
              )}
              {profile.kycStatus === "pending" && (
                <span className="bg-warning-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock size={10} /> KYC pending
                </span>
              )}
            </div>

            {profile.createdAt && (
              <p className="text-xs text-brand-200 mt-3">
                Member since{" "}
                {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {!isVerified && (
              <Link
                href="/verify"
                className="btn bg-white text-brand-700 hover:bg-brand-50 btn-sm shadow-lg"
              >
                <ShieldCheck size={14} /> Get Verified
              </Link>
            )}
            {isOwner && (
              <Link
                href="/dashboard"
                className="btn bg-white/20 backdrop-blur border border-white/30 text-white hover:bg-white/30 btn-sm"
              >
                <Home size={14} /> Dashboard
              </Link>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 mt-6 pt-5 border-t border-white/20">
            {[
              {
                label: "Plan",
                value: subActive ? currentPlan.name : "Free",
                icon: Crown,
              },
              {
                label: "Credits",
                value: `₹${profile.credits || 0}`,
                icon: Wallet,
              },
              { label: "Lead Balance", value: totalLeadsRemaining, icon: Zap },
              {
                label: "Referrals",
                value: profile.referralCount || 0,
                icon: User,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur rounded-xl p-3"
                >
                  <Icon size={14} className="text-brand-200 mb-1" />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-brand-200">{stat.label}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ ⭐ SUBSCRIPTION CARD (Owner only) ═══ */}
      {isOwner && (
        <div
          className={`card p-6 ${
            subActive
              ? "border-2 border-brand-500 dark:border-brand-500 bg-gradient-to-br from-brand-50 via-white to-white dark:from-brand-900/20 dark:via-slate-800 dark:to-slate-800"
              : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                  subActive
                    ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30"
                    : "bg-gray-100 dark:bg-slate-700"
                }`}
              >
                {currentPlan.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    {currentPlan.name} Plan
                  </h2>
                  {subActive ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      <Clock size={10} /> Free
                    </span>
                  )}
                </div>
                {subActive && subscription.current.expiresAt ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    Expires{" "}
                    {format(
                      new Date(subscription.current.expiresAt),
                      "MMM d, yyyy",
                    )}
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        daysLeft <= 7
                          ? "bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300"
                          : "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                      }`}
                    >
                      {daysLeft} days left
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Upgrade to unlock more features
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Plan benefits grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                label: "Listings",
                value:
                  currentPlan.listingLimit === 999
                    ? "∞"
                    : currentPlan.listingLimit,
              },
              { label: "Photos/listing", value: currentPlan.photosPerListing },
              { label: "Leads/month", value: currentPlan.leadsPerProperty },
            ].map((b) => (
              <div
                key={b.label}
                className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-center"
              >
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  {b.value}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">
                  {b.label}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href="/dashboard/subscription"
              className={`btn flex-1 ${subActive ? "btn-secondary" : "btn-primary"}`}
            >
              <Crown size={16} />
              {subActive ? "Manage Plan" : "Upgrade Now"}
            </Link>
            {subActive && (
              <Link href="/pricing" className="btn btn-ghost">
                View Plans <ChevronRight size={14} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ═══ ⭐ LEAD PACKS CARD (Owner only) ═══ */}
      {isOwner && (
        <div className="card p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-white flex items-center justify-center shadow-md shadow-accent-500/30 flex-shrink-0">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Lead Packs
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {totalLeadsRemaining > 0
                    ? `${totalLeadsRemaining} leads remaining`
                    : "No active lead packs"}
                </p>
              </div>
            </div>
            <Link href="/pricing" className="btn btn-sm btn-secondary">
              <Package size={14} /> Buy More
            </Link>
          </div>

          {/* Active packs */}
          {activeLeadPacks.length > 0 ? (
            <div className="space-y-2">
              {activeLeadPacks.map((pack: any) => {
                const remaining = Math.max(
                  0,
                  (pack.totalLeads || 0) - (pack.usedLeads || 0),
                );
                const usedPercent =
                  pack.totalLeads > 0
                    ? ((pack.usedLeads || 0) / pack.totalLeads) * 100
                    : 0;
                const packDaysLeft = pack.expiresAt
                  ? Math.max(
                      0,
                      differenceInDays(new Date(pack.expiresAt), new Date()),
                    )
                  : 0;

                return (
                  <div
                    key={pack._id}
                    className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100 capitalize">
                          {pack.packId} Pack
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          Expires{" "}
                          {format(new Date(pack.expiresAt), "MMM d, yyyy")}
                          <span className="ml-1 text-brand-600 dark:text-brand-400 font-semibold">
                            ({packDaysLeft}d left)
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                          {pack.totalLeads >= 999999 ? "∞" : remaining}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-slate-400">
                          remaining
                        </p>
                      </div>
                    </div>
                    {pack.totalLeads < 999999 && (
                      <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent-500 to-accent-600 transition-all"
                          style={{ width: `${Math.min(100, usedPercent)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-center">
              <Zap size={32} className="text-accent-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                No active lead packs
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                Buy leads to get more tenant inquiries
              </p>
              <Link href="/pricing" className="btn btn-primary btn-sm">
                <Zap size={14} /> Buy Leads
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ═══ REFERRAL CARD ═══ */}
      {profile.referralCode && (
        <div className="card p-6 bg-gradient-to-br from-accent-50 to-white dark:from-accent-900/20 dark:to-slate-800 border-2 border-accent-300 dark:border-accent-700">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-slate-100">
                  🎁 Refer & Earn
                </h2>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Invite friends — you both get <strong>₹100 credit</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-700 rounded-xl p-4 border border-accent-200 dark:border-accent-800 mb-4">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
              Your referral code
            </p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-bold text-accent-700 dark:text-accent-300 font-mono flex-1">
                {profile.referralCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(profile.referralCode);
                  toast.success("Copied!");
                }}
                className="btn btn-secondary btn-sm"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 p-3 bg-success-50 dark:bg-success-900/20 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Credit balance
              </p>
              <p className="text-2xl font-extrabold text-success-600 dark:text-success-400">
                ₹{profile.credits || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Referrals
              </p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
                {profile.referralCount || 0}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const base =
                process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
              const url = `${base}/register?ref=${profile.referralCode}`;
              const text = `Join Apna Ashta — Ashta, Kothri & Sehore's rental platform!\n\nSign up with code *${profile.referralCode}* and get ₹100 credit.\n\n${url}`;
              window.open(
                `https://wa.me/?text=${encodeURIComponent(text)}`,
                "_blank",
              );
            }}
            className="btn btn-whatsapp w-full"
          >
            <MessageCircle size={16} /> Share on WhatsApp
          </button>
        </div>
      )}

      {/* ═══ BASIC INFO ═══ */}
      <form onSubmit={saveProfile} className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <User size={16} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Basic Information
          </h2>
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            required
            className="input"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Email (cannot be changed)</label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="email"
              className="input pl-9 bg-gray-50 dark:bg-slate-700/50"
              value={profile.email}
              disabled
            />
          </div>
        </div>

        <div>
          <label className="label">Phone Number</label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="tel"
              className="input pl-9"
              maxLength={10}
              value={profile.phone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />
            {profile.phoneVerified && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-success text-[10px]">
                ✓ Verified
              </span>
            )}
          </div>
          {!profile.phoneVerified && profile.phone && (
            <p className="text-xs text-gray-500 mt-1">
              Not verified.{" "}
              <Link href="/verify" className="text-brand-600 underline">
                Verify now →
              </Link>
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* ═══ PASSWORD ═══ */}
      <form onSubmit={changePassword} className="card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400 flex items-center justify-center">
            <Lock size={16} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Change Password
          </h2>
        </div>

        <div>
          <label className="label">Current Password</label>
          <div className="relative">
            <input
              required
              type={showPwd ? "text" : "password"}
              className="input pr-10"
              placeholder="Enter current password"
              value={pwdForm.currentPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, currentPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">New Password</label>
            <input
              required
              type="password"
              minLength={6}
              className="input"
              placeholder="Min 6 characters"
              value={pwdForm.newPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, newPassword: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              required
              type="password"
              minLength={6}
              className="input"
              placeholder="Re-enter password"
              value={pwdForm.confirm}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, confirm: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changingPwd}
            className="btn btn-primary disabled:opacity-50"
          >
            {changingPwd ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Updating...
              </>
            ) : (
              <>
                <Lock size={16} /> Change Password
              </>
            )}
          </button>
        </div>
      </form>

      {/* ═══ PRIVACY & NOTIFICATIONS ═══ */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 flex items-center justify-center">
            <Bell size={16} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Notifications & Privacy
          </h2>
        </div>

        <div className="space-y-2">
          <label className="flex items-start justify-between gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors">
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-slate-100">
                Email notifications
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Get updates when you receive a new message
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-gray-300 text-brand-600 mt-0.5"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors">
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-slate-100">
                New listing alerts
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Get notified when new properties match your saved searches
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 rounded border-gray-300 text-brand-600 mt-0.5"
            />
          </label>

          <label className="flex items-start justify-between gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors">
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-slate-100">
                Marketing emails
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Promotions, tips, and product updates
              </p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-brand-600 mt-0.5"
            />
          </label>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex gap-2 flex-wrap">
          <Link
            href="/privacy"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <FileText size={12} /> Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <FileText size={12} /> Terms
          </Link>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/profile/export");
                if (res.ok) {
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `my-data-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Data downloaded");
                }
              } catch {
                toast.error("Export failed");
              }
            }}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 ml-auto"
          >
            <Download size={12} /> Download my data
          </button>
        </div>
      </div>

      {/* ═══ DANGER ZONE ═══ */}
      <div className="card p-6 border-2 border-danger-200 dark:border-danger-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <h2 className="text-lg font-bold text-danger-600 dark:text-danger-400">
            Danger Zone
          </h2>
        </div>

        <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-xl">
          <p className="font-semibold text-danger-700 dark:text-danger-300 mb-1">
            Delete Account
          </p>
          <p className="text-xs text-danger-600 dark:text-danger-400 mb-3">
            Permanently delete your account, listings, chats, and all data. This
            cannot be undone.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={deleteAccount}
              className={`btn btn-sm ${deleteConfirm ? "btn-danger" : "btn-ghost text-danger-600"}`}
            >
              <Trash2 size={14} />
              {deleteConfirm ? "Click again to confirm" : "Delete Account"}
            </button>
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto">
          <div className="skeleton h-40 rounded-3xl" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
