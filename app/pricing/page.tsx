"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { Sparkles, Zap, FileText, Check, Loader2, Package } from "lucide-react";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  const currentPlanId = (session?.user as any)?.subscription?.planId || "free";

  useEffect(() => {
    api
      .get<any>("/api/plans")
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function subscribe(planId: string) {
    if (!session) return router.push("/login?callbackUrl=/pricing");
    if ((session.user as any).role !== "owner") {
      return toast.error("Only property owners can subscribe");
    }

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
        description: `${order.planName} Plan (${order.billingCycle})`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/api/subscription/verify", {
              ...response,
              subscriptionId: order.subscriptionId,
            });
            toast.success("Subscription activated!");
            router.push("/dashboard/subscription");
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

  async function buyLeadPack(packId: string) {
    if (!session) return router.push("/login?callbackUrl=/pricing");
    try {
      const order = await api.post<any>("/api/lead-pack", { packId });
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "Flatova",
        description: "Lead Pack",
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/api/lead-pack/verify", {
              ...response,
              leadPackId: order.leadPackId,
            });
            toast.success("Lead pack activated!");
            router.push("/dashboard");
            router.refresh();
          } catch (e: any) {
            toast.error(e.message);
          }
        },
        theme: { color: "#f59e0b" },
      };
      new (window as any).Razorpay(options).open();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (!data)
    return (
      <div className="text-center py-16 text-gray-500">
        Could not load pricing
      </div>
    );

  const { subscriptions, leadPacks, featured, settings } = data;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
            Choose a plan that fits your needs. Upgrade anytime. No hidden fees.
          </p>
        </div>

        {/* Subscriptions */}
        {settings.enableSubscriptions && subscriptions.length > 0 && (
          <>
            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setCycle("monthly")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                  cycle === "monthly"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold relative ${
                  cycle === "yearly"
                    ? "bg-brand-600 text-white"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-success-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  SAVE
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              {subscriptions.map((plan: any) => {
                const isCurrent = currentPlanId === plan.planId;
                const price =
                  cycle === "yearly" && plan.yearlyPrice
                    ? plan.yearlyPrice
                    : plan.price;

                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-2xl p-6 border-2 transition-all ${
                      plan.recommended
                        ? "border-brand-600 dark:border-brand-500 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800 shadow-xl scale-[1.02]"
                        : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                        <Sparkles size={12} /> RECOMMENDED
                      </div>
                    )}

                    <div className="text-4xl mb-3">{plan.icon}</div>
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>

                    <div className="mt-4 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold">
                          {price === 0
                            ? "Free"
                            : `₹${price.toLocaleString("en-IN")}`}
                        </span>
                        {price > 0 && (
                          <span className="text-gray-500 dark:text-slate-400 text-sm">
                            /{cycle === "yearly" ? "year" : "month"}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => !isCurrent && subscribe(plan.planId)}
                      disabled={isCurrent}
                      className={`w-full py-3 rounded-xl font-bold mb-6 ${
                        isCurrent
                          ? "bg-gray-100 dark:bg-slate-700 text-gray-500 cursor-not-allowed"
                          : plan.recommended
                            ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-lg"
                            : "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      }`}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : price === 0
                          ? "Free Forever"
                          : "Choose Plan"}
                    </button>

                    <ul className="space-y-2.5">
                      {(plan.features || []).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check
                            size={16}
                            className="text-success-500 flex-shrink-0 mt-0.5"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Lead Packs */}
        {settings.enableLeadPacks && leadPacks.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Need more leads?</h2>
              <p className="text-gray-500 dark:text-slate-400">
                Buy extra leads anytime
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {leadPacks.map((pack: any) => (
                <div
                  key={pack._id}
                  className={`card p-6 relative ${pack.recommended ? "border-2 border-brand-600" : ""}`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {pack.badge}
                    </div>
                  )}
                  <div className="text-3xl mb-2">{pack.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{pack.name}</h3>
                  <p className="text-3xl font-extrabold text-brand-600 mb-3">
                    ₹{pack.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    {pack.leadsIncluded >= 999999
                      ? "Unlimited leads"
                      : `${pack.leadsIncluded} leads`}
                    <br />
                    Valid {pack.validityDays} days
                  </p>
                  <button
                    onClick={() => buyLeadPack(pack.planId)}
                    className="w-full btn btn-primary btn-sm"
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured */}
        {settings.enableFeaturedListings && featured.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Boost your listing</h2>
              <p className="text-gray-500 dark:text-slate-400">
                Featured listings get 3-10x more views
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((tier: any) => (
                <div
                  key={tier._id}
                  className={`card p-6 relative ${tier.recommended ? "border-2 border-accent-500" : ""}`}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> POPULAR
                    </div>
                  )}
                  <div className="text-3xl mb-2">{tier.icon}</div>
                  <h3 className="font-bold text-xl mb-1">{tier.name}</h3>
                  <p className="text-3xl font-extrabold mb-1">
                    ₹{tier.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    per listing · {tier.featuredDays} days
                  </p>
                  <ul className="space-y-2">
                    {(tier.features || []).map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check
                          size={14}
                          className="text-success-500 flex-shrink-0 mt-0.5"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Agreement */}
        {settings.enableRentAgreement && (
          <section className="card p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <FileText size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  Legal Rent Agreement
                </h2>
                <p className="text-brand-100 mb-4">
                  21-clause legal PDF, court-ready. Save ₹1,000+ on lawyer fees.
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="text-3xl font-bold">
                      ₹{settings.agreementPrice}
                    </p>
                    <p className="text-xs text-brand-200">per agreement</p>
                  </div>
                  <p className="text-sm text-brand-100">
                    or <strong>₹{settings.agreementSplitPrice} each</strong> if
                    split
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
