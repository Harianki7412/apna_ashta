import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Plan } from "@/models/Plan";
import { AppSetting } from "@/models/AppSetting";
import { DEFAULT_SETTINGS } from "@/lib/plan-helpers";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

const SEED_PLANS = [
  // SUBSCRIPTIONS
  {
    type: "subscription",
    planId: "free",
    name: "Free",
    icon: "🎁",
    price: 0,
    billingCycle: "monthly",
    isFree: true,
    listingLimit: 2,
    photosPerListing: 5,
    leadsPerProperty: 10,
    features: [
      "2 active listings",
      "5 photos per property",
      "10 free leads/month",
      "Basic chat support",
    ],
    displayOrder: 1,
  },
  {
    type: "subscription",
    planId: "pro",
    name: "Pro",
    icon: "⭐",
    price: 299,
    yearlyPrice: 2990,
    billingCycle: "monthly",
    recommended: true,
    listingLimit: 10,
    photosPerListing: 15,
    leadsPerProperty: 50,
    features: [
      "10 active listings",
      "15 photos per property",
      "50 free leads/month",
      "Priority support",
      "Analytics dashboard",
      "Verified badge",
    ],
    displayOrder: 2,
  },
  {
    type: "subscription",
    planId: "business",
    name: "Business",
    icon: "👑",
    price: 999,
    yearlyPrice: 9990,
    billingCycle: "monthly",
    listingLimit: 999,
    photosPerListing: 25,
    leadsPerProperty: 200,
    features: [
      "Unlimited listings",
      "25 photos per property",
      "200 free leads/month",
      "Dedicated account manager",
      "Top placement",
      "Bulk tools",
    ],
    displayOrder: 3,
  },
  // LEAD PACKS
  {
    type: "lead_pack",
    planId: "starter",
    name: "Starter",
    icon: "⚡",
    price: 199,
    leadsIncluded: 20,
    validityDays: 30,
    features: ["20 extra leads", "Valid 30 days", "Any property"],
    displayOrder: 1,
  },
  {
    type: "lead_pack",
    planId: "popular",
    name: "Popular",
    icon: "🔥",
    price: 499,
    leadsIncluded: 100,
    validityDays: 60,
    recommended: true,
    badge: "BEST VALUE",
    features: [
      "100 extra leads",
      "Valid 60 days",
      "Any property",
      "Priority support",
    ],
    displayOrder: 2,
  },
  {
    type: "lead_pack",
    planId: "unlimited",
    name: "Unlimited",
    icon: "💎",
    price: 999,
    leadsIncluded: 999999,
    validityDays: 30,
    features: ["Unlimited leads", "Valid 30 days", "All properties"],
    displayOrder: 3,
  },
  // FEATURED
  {
    type: "featured",
    planId: "basic",
    name: "Basic",
    icon: "📌",
    price: 99,
    featuredDays: 30,
    featuredTier: "basic",
    features: ["Top of search", "Featured badge", "3x more visibility"],
    displayOrder: 1,
  },
  {
    type: "featured",
    planId: "premium",
    name: "Premium",
    icon: "🌟",
    price: 299,
    featuredDays: 30,
    featuredTier: "premium",
    features: [
      "Everything in Basic",
      "Homepage placement",
      "WhatsApp broadcast",
      "5x visibility",
    ],
    displayOrder: 2,
  },
  {
    type: "featured",
    planId: "elite",
    name: "Elite",
    icon: "👑",
    price: 999,
    featuredDays: 30,
    featuredTier: "elite",
    recommended: true,
    features: [
      "Everything in Premium",
      "Push notification",
      "Social promotion",
      "10x visibility",
    ],
    displayOrder: 3,
  },
];

export async function POST() {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    await connectDB();

    let created = 0;
    let skipped = 0;

    for (const p of SEED_PLANS) {
      const exists = await Plan.findOne({ planId: p.planId, type: p.type });
      if (exists) {
        skipped++;
        continue;
      }
      await Plan.create({ ...p, active: true, hidden: false });
      created++;
    }

    // Seed default settings
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const exists = await AppSetting.findOne({ key });
      if (!exists) await AppSetting.create({ key, value });
    }

    return ok({ created, skipped, total: SEED_PLANS.length });
  } catch (e) {
    return handleError(e);
  }
}
