"use client";
import { useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { SUBSCRIPTION_PLANS, formatINR, type Plan } from "@/lib/pricing";
import toast from "react-hot-toast";

export default function PricingCards({
  currentPlanId = "free",
  onSelect,
}: {
  currentPlanId?: string;
  onSelect: (planId: string, cycle: "monthly" | "yearly") => Promise<void>;
}) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setCycle("monthly")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            cycle === "monthly"
              ? "bg-brand-600 text-white"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setCycle("yearly")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
            cycle === "yearly"
              ? "bg-brand-600 text-white"
              : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
          }`}
        >
          Yearly
          <span className="absolute -top-2 -right-2 bg-success-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            SAVE 17%
          </span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = currentPlanId === plan.id;
          const price =
            cycle === "yearly" && plan.yearlyPrice
              ? plan.yearlyPrice
              : plan.price;
          const isRecommended = plan.recommended;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border-2 transition-all ${
                isRecommended
                  ? "border-brand-600 dark:border-brand-500 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800 shadow-xl scale-[1.02]"
                  : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> RECOMMENDED
                </div>
              )}

              <div className="text-4xl mb-3">{plan.icon}</div>
              <h3 className="text-2xl font-bold mb-1 text-gray-900 dark:text-slate-100">
                {plan.name}
              </h3>

              <div className="mt-4 mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-slate-100">
                    {price === 0 ? "Free" : formatINR(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-gray-500 dark:text-slate-400 text-sm">
                      /{cycle === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </div>
                {cycle === "yearly" && plan.price > 0 && (
                  <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                    Save {formatINR(plan.price * 12 - (plan.yearlyPrice || 0))}
                    /year
                  </p>
                )}
              </div>

              <button
                onClick={() => !isCurrent && onSelect(plan.id, cycle)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-xl font-bold mb-6 transition-all ${
                  isCurrent
                    ? "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                    : isRecommended
                      ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-lg"
                      : "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-gray-800 dark:hover:bg-white"
                }`}
              >
                {isCurrent
                  ? "Current Plan"
                  : plan.price === 0
                    ? "Free Forever"
                    : "Choose Plan"}
              </button>

              <ul className="space-y-2.5">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300"
                  >
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
    </div>
  );
}
