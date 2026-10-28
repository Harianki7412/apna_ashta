"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import PricingCards from "@/components/PricingCards";
import {
  getCurrentPlan,
  getPlan,
  formatINR,
  isPlanActive,
} from "@/lib/pricing";
import { Crown, Calendar, TrendingUp, Zap } from "lucide-react";
import { format } from "date-fns";

export default function SubscriptionPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/subscription");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .get<any>("/api/subscription")
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  async function handleSubscribe(planId: string, cycle: "monthly" | "yearly") {
    try {
      const order = await api.post<any>("/api/subscription", {
        planId,
        billingCycle: cycle,
      });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "Flatova",
        description: `${order.planName} Plan`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/api/subscription/verify", {
              ...response,
              subscriptionId: order.subscriptionId,
            });
            toast.success("Plan activated!");
            await updateSession();
            const d = await api.get<any>("/api/subscription");
            setData(d);
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
      const d = await api.get<any>("/api/subscription");
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading" || loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  const current = data?.current || { planId: "free" };
  const currentPlan = getCurrentPlan({ subscription: current });
  const active = isPlanActive({ subscription: current });

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription</h1>
          <p className="text-gray-500 dark:text-slate-400">
            Manage your plan and unlock more features
          </p>
        </div>

        {/* Current Plan Card */}
        <div
          className={`card p-6 mb-8 ${active ? "border-2 border-brand-500 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800" : ""}`}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-2xl">
                {currentPlan.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold">
                  Current Plan
                </p>
                <p className="text-2xl font-bold">{currentPlan.name}</p>
              </div>
            </div>

            {active && current.expiresAt && (
              <div className="flex flex-col gap-1 text-right">
                <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 justify-end">
                  <Calendar size={12} /> Expires on
                </p>
                <p className="font-bold">
                  {format(new Date(current.expiresAt), "MMM d, yyyy")}
                </p>
                {current.autoRenew && (
                  <button
                    onClick={cancelAutoRenew}
                    className="text-xs text-danger-600 dark:text-danger-400 hover:underline"
                  >
                    Cancel auto-renew
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Listings
              </p>
              <p className="text-lg font-bold">
                {currentPlan.listingLimit === 999
                  ? "∞"
                  : currentPlan.listingLimit}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Photos each
              </p>
              <p className="text-lg font-bold">
                {currentPlan.photosPerListing}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Leads/month
              </p>
              <p className="text-lg font-bold">
                {currentPlan.leadsPerProperty}
              </p>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <PricingCards
            currentPlanId={currentPlan.id}
            onSelect={handleSubscribe}
          />
        </div>

        {/* History */}
        {data?.history?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Billing History</h2>
            <div className="space-y-2">
              {data.history.map((h: any) => (
                <div
                  key={h._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      {getPlan(h.planId)?.name} ({h.billingCycle})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {format(new Date(h.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatINR(h.amount)}</p>
                    <span
                      className={`badge badge-${h.status === "active" ? "success" : h.status === "pending" ? "warning" : "danger"}`}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
