import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Plan } from "@/models/Plan";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

/* ═══ GET: List all plans (admin) ═══ */
export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const type = new URL(req.url).searchParams.get("type");
    await connectDB();

    const query: any = {};
    if (type) query.type = type;

    const plans = await Plan.find(query)
      .sort({ type: 1, displayOrder: 1 })
      .lean();
    return ok(plans);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ POST: Create new plan ═══ */
export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const body = await req.json();
    const {
      type,
      planId,
      name,
      description,
      price,
      yearlyPrice,
      billingCycle,
      icon,
      color,
      recommended,
      badge,
      features,
      listingLimit,
      photosPerListing,
      leadsPerProperty,
      isFree,
      leadsIncluded,
      validityDays,
      featuredDays,
      featuredTier,
      displayOrder,
      hidden,
    } = body;

    if (!type || !["subscription", "lead_pack", "featured"].includes(type)) {
      return fail("Invalid type");
    }
    if (!planId || !name) return fail("planId and name required");
    if (typeof price !== "number" || price < 0) return fail("Invalid price");

    await connectDB();

    // Check duplicate planId
    const existing = await Plan.findOne({ planId });
    if (existing) return fail("planId already exists");

    const plan = await Plan.create({
      type,
      planId: planId.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      name,
      description,
      price,
      yearlyPrice: yearlyPrice || undefined,
      billingCycle:
        billingCycle || (type === "subscription" ? "monthly" : "one-time"),
      icon: icon || "🎁",
      color: color || "brand",
      recommended: !!recommended,
      badge,
      features: Array.isArray(features) ? features : [],
      listingLimit,
      photosPerListing,
      leadsPerProperty,
      isFree: !!isFree || price === 0,
      leadsIncluded,
      validityDays,
      featuredDays,
      featuredTier,
      displayOrder: displayOrder || 0,
      hidden: !!hidden,
      active: true,
    });

    return ok(plan, 201);
  } catch (e) {
    return handleError(e);
  }
}
