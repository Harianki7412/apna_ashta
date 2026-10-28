"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";
import Link from "next/link";
import { api } from "@/lib/api-client";
import PricingCards from "@/components/PricingCards";
import {
  getCurrentPlan,
  getPlan,
  formatINR,
  isPlanActive,
} from "@/lib/pricing";
import {
  Crown,
  Calendar,
  TrendingUp,
  Zap,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Sparkles,
  Shield,
  CreditCard,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function SubscriptionPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/dashboard/subscription");
  }, [status, router]);

  async function load() {
    try {
      const d = await api.get<any>("/api/subscription");
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  async function handleSubscribe(
    planId: string,
    selectedCycle: "monthly" | "yearly",
  ) {
    try {
      const order = await api.post<any>("/api/subscription", {
        planId,
        billingCycle: selectedCycle,
      });
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "Apna Ashta",
        description: `${order.planName} Plan (${order.billingCycle})`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/api/subscription/verify", {
              ...response,
              subscriptionId: order.subscriptionId,
            });
            toast.success("🎉 Plan activated!");
            await updateSession();
            await load();
            router.refresh();
          } catch (e: any) {
            toast.error(e.message);
          }
        },
        theme: { color: "#2563eb" },
      };
      new (window as any).Razorpay(options).open();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function cancelAutoRenew() {
    if (!confirm("Disable auto-renew? You keep access until expiry.")) return;
    try {
      await api.delete("/api/subscription");
      toast.success("Auto-renew disabled");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-56 rounded-2xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  const current = data?.current || { planId: "free" };
  const currentPlan = getCurrentPlan({ subscription: current });
  const active = isPlanActive({ subscription: current });
  const daysLeft = current.expiresAt
    ? Math.max(0, differenceInDays(new Date(current.expiresAt), new Date()))
    : 0;
  const expiringSoon = active && daysLeft <= 7 && daysLeft > 0;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-white flex items-center justify-center shadow-lg shadow-accent-500/25">
              <Crown size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Subscription
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Manage your plan and unlock more features
              </p>
            </div>
          </div>
        </div>

        {/* Expiry Warning */}
        {expiringSoon && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-warning-50 to-warning-100/50 dark:from-warning-900/20 dark:to-warning-900/10 border border-warning-500/40 flex items-start gap-3 animate-fade-up">
            <div className="w-10 h-10 rounded-xl bg-warning-500 text-white flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-warning-700 dark:text-warning-300 text-sm">
                Plan expiring in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-warning-600 dark:text-warning-400 mt-0.5">
                {current.autoRenew
                  ? "✅ Auto-renew is ON — will charge automatically."
                  : "⚠️ Auto-renew is OFF. Please renew manually to avoid losing access."}
              </p>
            </div>
            <button
              onClick={() =>
                document
                  .getElementById("plans-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn btn-sm bg-warning-500 text-white hover:bg-warning-600 flex-shrink-0"
            >
              Renew Now
            </button>
          </div>
        )}

        {/* Current Plan Hero Card */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 md:p-8 mb-8 ${
            active
              ? "bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white shadow-2xl shadow-brand-500/20"
              : "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700"
          }`}
        >
          {active && (
            <>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            </>
          )}

          <div className="relative">
            {/* Badge row */}
            <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    active
                      ? "bg-white/20 backdrop-blur text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                  }`}
                >
                  CURRENT PLAN
                </span>
                {active && (
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-success-500 text-white flex items-center gap-1">
                    <CheckCircle2 size={10} /> ACTIVE
                  </span>
                )}
              </div>
              {active && current.autoRenew && (
                <button
                  onClick={cancelAutoRenew}
                  className="text-xs text-brand-200 hover:text-white underline transition-colors"
                >
                  Cancel auto-renew
                </button>
              )}
            </div>

            {/* Main content */}
            <div className="flex items-start gap-5 flex-wrap">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0 ${
                  active
                    ? "bg-white/20 backdrop-blur shadow-lg"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600"
                }`}
              >
                {currentPlan.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h2
                  className={`text-4xl md:text-5xl font-extrabold mb-2 ${
                    active ? "text-white" : "text-gray-900 dark:text-slate-100"
                  }`}
                >
                  {currentPlan.name}
                </h2>

                {active && current.expiresAt ? (
                  <p className="text-sm text-brand-100 flex items-center gap-1.5">
                    <Calendar size={14} />
                    Renews on{" "}
                    {format(new Date(current.expiresAt), "MMMM d, yyyy")}
                    {daysLeft > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                        {daysLeft} days left
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock size={14} /> Free plan · No expiry
                  </p>
                )}
              </div>

              {/* Price paid (if active) */}
              {active && data?.history?.[0] && (
                <div
                  className={`rounded-2xl p-4 ${
                    active
                      ? "bg-white/10 backdrop-blur"
                      : "bg-gray-50 dark:bg-slate-700"
                  }`}
                >
                  <p
                    className={`text-xs ${active ? "text-brand-200" : "text-gray-500"}`}
                  >
                    Last payment
                  </p>
                  <p
                    className={`text-2xl font-bold ${active ? "text-white" : "text-gray-900 dark:text-slate-100"}`}
                  >
                    {formatINR(data.history[0].amount)}
                  </p>
                  <p
                    className={`text-xs ${active ? "text-brand-200" : "text-gray-500"}`}
                  >
                    {format(new Date(data.history[0].createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <div
              className={`grid grid-cols-3 gap-3 mt-8 pt-6 border-t ${
                active
                  ? "border-white/20"
                  : "border-gray-100 dark:border-slate-700"
              }`}
            >
              {[
                {
                  label: "Listings",
                  value:
                    currentPlan.listingLimit === 999
                      ? "∞"
                      : currentPlan.listingLimit,
                  icon: Home,
                },
                {
                  label: "Photos/listing",
                  value: currentPlan.photosPerListing,
                  icon: Sparkles,
                },
                {
                  label: "Leads/month",
                  value: currentPlan.leadsPerProperty,
                  icon: Zap,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`rounded-xl p-3 ${
                      active
                        ? "bg-white/10 backdrop-blur"
                        : "bg-gray-50 dark:bg-slate-700"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        active ? "text-brand-200 mb-1" : "text-gray-400 mb-1"
                      }
                    />
                    <p
                      className={`text-2xl font-bold ${active ? "text-white" : "text-gray-900 dark:text-slate-100"}`}
                    >
                      {stat.value}
                    </p>
                    <p
                      className={`text-xs ${active ? "text-brand-200" : "text-gray-500 dark:text-slate-400"}`}
                    >
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div id="plans-section" className="mb-12">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {active ? "Upgrade or change plan" : "Choose a plan"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                Switch anytime · Instant activation
              </p>
            </div>
          </div>
          <PricingCards
            currentPlanId={currentPlan.id}
            onSelect={handleSubscribe}
          />
        </div>

        {/* Billing History */}
        {data?.history?.length > 0 && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
                <Receipt
                  size={20}
                  className="text-brand-600 dark:text-brand-400"
                />
                Billing History
              </h2>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {data.history.length} transactions
              </span>
            </div>
            <div className="space-y-2">
              {data.history.map((h: any) => {
                const statusConfig: Record<
                  string,
                  { cls: string; icon: any; label: string }
                > = {
                  active: {
                    cls: "badge-success",
                    icon: CheckCircle2,
                    label: "Active",
                  },
                  pending: {
                    cls: "badge-warning",
                    icon: Clock,
                    label: "Pending",
                  },
                  failed: {
                    cls: "badge-danger",
                    icon: XCircle,
                    label: "Failed",
                  },
                  expired: {
                    cls: "badge-danger",
                    icon: XCircle,
                    label: "Expired",
                  },
                  cancelled: {
                    cls: "badge-danger",
                    icon: XCircle,
                    label: "Cancelled",
                  },
                };
                const cfg = statusConfig[h.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                const plan = getPlan(h.planId);

                return (
                  <div
                    key={h._id}
                    className="flex items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
                        <CreditCard
                          size={16}
                          className="text-brand-600 dark:text-brand-400"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                          {plan?.name || h.planId}
                          <span className="text-xs text-gray-500 dark:text-slate-400 font-normal ml-1.5 capitalize">
                            ({h.billingCycle})
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {format(
                            new Date(h.createdAt),
                            "MMM d, yyyy · h:mm a",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="font-bold text-gray-900 dark:text-slate-100">
                        {formatINR(h.amount)}
                      </p>
                      <span className={`badge ${cfg.cls}`}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card p-6 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800 border-brand-200 dark:border-brand-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
              <Shield size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-1">
                Need help with your subscription?
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Our team is here to help with billing, upgrades, cancellations,
                and any questions.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/contact" className="btn btn-primary btn-sm">
                  Contact Support <ArrowRight size={14} />
                </Link>
                <Link href="/faq" className="btn btn-ghost btn-sm">
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Home(props: any) {
  return (
    <svg
      width={props.size || 16}
      height={props.size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
