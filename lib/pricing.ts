export interface Plan {
  id: string;
  name: string;
  price: number; // ₹ per month
  yearlyPrice?: number; // ₹ per year (10 months discount)
  listingLimit: number;
  photosPerListing: number;
  leadsPerProperty: number;
  features: string[];
  recommended?: boolean;
  icon: string;
  color: string;
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    listingLimit: 2,
    photosPerListing: 5,
    leadsPerProperty: 10,
    icon: "🎁",
    color: "gray",
    features: [
      "2 active listings",
      "5 photos per property",
      "10 free leads/month",
      "Basic chat support",
      "Standard search visibility",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 299,
    yearlyPrice: 2990,
    listingLimit: 10,
    photosPerListing: 15,
    leadsPerProperty: 50,
    icon: "⭐",
    color: "brand",
    recommended: true,
    features: [
      "10 active listings",
      "15 photos per property",
      "50 free leads/month",
      "Priority support",
      "Boosted search visibility",
      "Analytics dashboard",
      "Verified owner badge",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 999,
    yearlyPrice: 9990,
    listingLimit: 999,
    photosPerListing: 25,
    leadsPerProperty: 200,
    icon: "👑",
    color: "accent",
    features: [
      "Unlimited listings",
      "25 photos per property",
      "200 free leads/month",
      "Dedicated account manager",
      "Top search placement",
      "Bulk upload tools",
      "Priority KYC verification",
      "Advanced analytics",
      "Custom branded microsite",
    ],
  },
];

export interface LeadPack {
  id: string;
  name: string;
  price: number;
  leads: number;
  validityDays: number;
  bestValue?: boolean;
}

export const LEAD_PACKS: LeadPack[] = [
  { id: "starter", name: "Starter", price: 199, leads: 20, validityDays: 30 },
  {
    id: "popular",
    name: "Popular",
    price: 499,
    leads: 100,
    validityDays: 60,
    bestValue: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 999,
    leads: 999999,
    validityDays: 30,
  },
];

export const FEATURED_TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    days: 30,
    features: ["Top of search", "Featured badge", "3x more visibility"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 299,
    days: 30,
    features: [
      "Everything in Basic",
      "Homepage placement",
      "WhatsApp broadcast",
      "5x more visibility",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 999,
    days: 30,
    recommended: true,
    features: [
      "Everything in Premium",
      "Push notification to all tenants",
      "Social media promotion",
      "Priority admin approval",
      "10x more visibility",
    ],
  },
];

export const AGREEMENT_PRICE = 199;
export const AGREEMENT_SPLIT_PRICE = 99; // per party

export function getPlan(id: string): Plan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id);
}

export function isPlanActive(user: any): boolean {
  if (!user?.subscription?.planId || user.subscription.planId === "free")
    return false;
  if (!user.subscription.expiresAt) return false;
  return new Date(user.subscription.expiresAt) > new Date();
}

export function getCurrentPlan(user: any): Plan {
  if (!isPlanActive(user)) return SUBSCRIPTION_PLANS[0]; // free
  return getPlan(user.subscription.planId) || SUBSCRIPTION_PLANS[0];
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
