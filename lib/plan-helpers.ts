import { connectDB } from "./mongodb";
import { Plan } from "@/models/Plan";
import { AppSetting } from "@/models/AppSetting";

export interface PlanData {
  _id: string;
  type: "subscription" | "lead_pack" | "featured";
  planId: string;
  name: string;
  description?: string;
  price: number;
  yearlyPrice?: number;
  billingCycle: string;
  icon: string;
  color: string;
  recommended: boolean;
  badge?: string;
  features: string[];
  listingLimit?: number;
  photosPerListing?: number;
  leadsPerProperty?: number;
  isFree?: boolean;
  leadsIncluded?: number;
  validityDays?: number;
  featuredDays?: number;
  featuredTier?: string;
  active: boolean;
  hidden: boolean;
  displayOrder: number;
}

type LeanPlanData = Omit<PlanData, "_id"> & {
  _id: { toString(): string };
};

/* ═══ Fetch all plans by type (public) ═══ */
export async function getPlansByType(
  type: "subscription" | "lead_pack" | "featured",
  options: { includeHidden?: boolean } = {},
): Promise<PlanData[]> {
  await connectDB();
  const query: { type: PlanData["type"]; active: true; hidden?: boolean } = {
    type,
    active: true,
  };
  if (!options.includeHidden) query.hidden = false;

  const plans = await Plan.find(query)
    .sort({ displayOrder: 1, price: 1 })
    .lean<LeanPlanData[]>();
  return plans.map((plan) => ({ ...plan, _id: plan._id.toString() }));
}

/* ═══ Get single plan by planId ═══ */
export async function getPlanByPlanId(
  planId: string,
): Promise<PlanData | null> {
  await connectDB();
  const plan = await Plan.findOne({
    planId,
    active: true,
  }).lean<LeanPlanData>();
  return plan ? { ...plan, _id: plan._id.toString() } : null;
}

/* ═══ Get global setting ═══ */
export async function getSetting<T = unknown>(
  key: string,
  fallback: T,
): Promise<T> {
  try {
    await connectDB();
    const doc = await AppSetting.findOne({ key }).lean();
    return (doc?.value as T) ?? fallback;
  } catch {
    return fallback;
  }
}

/* ═══ Set global setting ═══ */
export async function setSetting(
  key: string,
  value: unknown,
  description?: string,
) {
  await connectDB();
  await AppSetting.findOneAndUpdate(
    { key },
    { key, value, description, updatedAt: new Date() },
    { upsert: true, new: true },
  );
}

/* ═══ Get all settings ═══ */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  await connectDB();
  const settings = await AppSetting.find({})
    .lean<{ key: string; value: unknown }[]>();
  return Object.fromEntries(settings.map(({ key, value }) => [key, value]));
}

/* ═══ Default settings (used when DB empty) ═══ */
export const DEFAULT_SETTINGS = {
  agreementPrice: 199,
  agreementSplitPrice: 99,
  freeLeadsPerProperty: 10,
  siteName: "Flatova",
  supportEmail: "hello@Flatova.in",
  supportPhone: "+919999999999",
  enableSubscriptions: true,
  enableLeadPacks: true,
  enableFeaturedListings: true,
  enableRentAgreement: true,
};
