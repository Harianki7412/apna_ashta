"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import PricingCards from "@/components/PricingCards";
import {
  Sparkles,
  Zap,
  FileText,
  Check,
  Loader2,
  Shield,
  Users,
  Clock,
  ArrowRight,
  Star,
  Crown,
  TrendingUp,
  Award,
} from "lucide-react";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentPlanId = (session?.user as any)?.subscription?.planId || "free";

  useEffect(() => {
    api
      .get<any>("/api/plans")
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function subscribe(
    planId: string,
    cycle: "monthly" | "yearly",
  ): Promise<void> {
    if (!session) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }
    if ((session.user as any).role !== "owner") {
      toast.error("Only property owners can subscribe");
      return;
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
        name: "Apna Ashta",
        description: `${order.planName} Plan (${order.billingCycle})`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/api/subscription/verify", {
              ...response,
              subscriptionId: order.subscriptionId,
            });
            toast.success("🎉 Subscription activated!");
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

  async function buyLeadPack(packId: string): Promise<void> {
    if (!session) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }
    try {
      const order = await api.post<any>("/api/lead-pack", { packId });
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: "Apna Ashta",
        description: "Lead Pack",
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post("/api/lead-pack/verify", {
              ...response,
              leadPackId: order.leadPackId,
            });
            toast.success("✅ Lead pack activated!");
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="skeleton h-40 rounded-3xl" />
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-96 rounded-3xl" />
          ))}
        </div>
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
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-8 md:p-12 mb-14">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
          </div>
          <div className="relative text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/25 text-xs font-semibold mb-5">
              <Sparkles size={12} className="text-accent-300" />
              Transparent pricing · Cancel anytime
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Grow your rentals with
              <br />
              <span className="text-gradient-gold">Apna Ashta Pro</span>
            </h1>
            <p className="text-brand-100 max-w-2xl mx-auto text-base md:text-lg mb-8">
              Reach more tenants, get priority placement, and unlock powerful
              tools. No lock-in, no hidden fees.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
              {[
                { icon: Shield, text: "Secure payments" },
                { icon: Clock, text: "Cancel anytime" },
                { icon: Users, text: "500+ owners" },
                { icon: Star, text: "4.8/5 rated" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 backdrop-blur rounded-xl"
                  >
                    <Icon size={14} className="text-accent-300" />
                    <span className="text-xs font-medium">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SUBSCRIPTIONS */}
        {settings.enableSubscriptions && subscriptions.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
                <Crown size={12} /> SUBSCRIPTIONS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-slate-100">
                Choose your plan
              </h2>
              <p className="text-gray-500 dark:text-slate-400">
                Upgrade, downgrade, or cancel anytime
              </p>
            </div>
            <PricingCards currentPlanId={currentPlanId} onSelect={subscribe} />
          </section>
        )}

        {/* LEAD PACKS */}
        {settings.enableLeadPacks && leadPacks.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-400/20 text-accent-700 dark:text-accent-300 text-xs font-semibold mb-3">
                <Zap size={12} /> LEAD PACKS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-slate-100">
                Need more leads?
              </h2>
              <p className="text-gray-500 dark:text-slate-400">
                Buy extra tenant inquiries anytime — no subscription required
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {leadPacks.map((pack: any) => (
                <div
                  key={pack._id}
                  className={`relative rounded-2xl p-6 transition-all hover-lift ${
                    pack.recommended
                      ? "border-2 border-accent-500 bg-gradient-to-b from-accent-50/50 to-white dark:from-accent-900/10 dark:to-slate-800 shadow-xl shadow-accent-500/10 scale-[1.02]"
                      : "border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                      {pack.badge}
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-3xl mb-4">
                    {pack.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-slate-100">
                    {pack.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-accent-600 dark:text-accent-400">
                      ₹{pack.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                    {pack.leadsIncluded >= 999999
                      ? "♾️ Unlimited leads"
                      : `${pack.leadsIncluded} leads`}
                    <span className="text-xs text-gray-500">
                      {" "}
                      · Valid {pack.validityDays} days
                    </span>
                  </p>
                  <button
                    onClick={() => buyLeadPack(pack.planId)}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                      pack.recommended
                        ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-lg shadow-accent-500/25"
                        : "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-gray-800"
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FEATURED */}
        {settings.enableFeaturedListings && featured.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 text-xs font-semibold mb-3">
                <TrendingUp size={12} /> FEATURED LISTINGS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-slate-100">
                Boost your listing
              </h2>
              <p className="text-gray-500 dark:text-slate-400">
                Featured listings get 3-10× more views
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map((tier: any) => (
                <div
                  key={tier._id}
                  className={`relative rounded-2xl p-6 transition-all hover-lift ${
                    tier.recommended
                      ? "border-2 border-brand-600 bg-gradient-to-b from-brand-50/50 to-white dark:from-brand-900/20 dark:to-slate-800 shadow-xl"
                      : "border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles size={10} /> POPULAR
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-3xl mb-4">
                    {tier.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-slate-100">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-slate-100">
                      ₹{tier.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                    per listing · {tier.featuredDays} days
                  </p>
                  <ul className="space-y-2">
                    {(tier.features || []).map((f: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300"
                      >
                        <Check
                          size={14}
                          className="text-success-500 flex-shrink-0 mt-0.5"
                          strokeWidth={3}
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

        {/* AGREEMENT */}
        {settings.enableRentAgreement && (
          <section className="mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 md:p-12 text-white">
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
              </div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <FileText size={28} />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Award size={10} /> LEGAL DOCUMENT
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Rent Agreement Generator
                  </h2>
                  <p className="text-brand-100 mb-4 max-w-lg text-sm md:text-base">
                    21-clause legal PDF, court-ready. Both parties can e-sign.
                    Save ₹1,000+ on lawyer fees.
                  </p>
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <div>
                      <p className="text-4xl font-extrabold">
                        ₹{settings.agreementPrice}
                      </p>
                      <p className="text-xs text-brand-200">per agreement</p>
                    </div>
                    <p className="text-sm text-brand-100">
                      or{" "}
                      <strong className="text-white">
                        ₹{settings.agreementSplitPrice} each
                      </strong>{" "}
                      if split
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="btn bg-white text-brand-700 hover:bg-brand-50 shadow-xl flex-shrink-0"
                >
                  Generate Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* FAQ TEASER */}
        <section className="max-w-3xl mx-auto text-center py-8">
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
            <Sparkles
              size={20}
              className="text-brand-600 dark:text-brand-400"
            />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-slate-100">
            Questions about pricing?
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-4 text-sm">
            Check our FAQ or talk to our team — we respond within 24 hours.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Link href="/faq" className="btn btn-ghost btn-sm">
              View FAQ
            </Link>
            <Link href="/contact" className="btn btn-primary btn-sm">
              Contact Us <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
