import { ok, handleError } from "@/lib/api-helpers";
import {
  getPlansByType,
  getAllSettings,
  DEFAULT_SETTINGS,
} from "@/lib/plan-helpers";

export async function GET(req: Request) {
  try {
    const type = new URL(req.url).searchParams.get("type");

    if (type && ["subscription", "featured"].includes(type)) {
      const plans = await getPlansByType(type as "subscription" | "featured");
      return ok({ plans });
    }

    // Return all types + settings
    const [subscriptions, featured, settings] = await Promise.all([
      getPlansByType("subscription"),
      getPlansByType("featured"),
      getAllSettings(),
    ]);

    return ok({
      subscriptions,
      featured,
      settings: { ...DEFAULT_SETTINGS, ...settings },
    });
  } catch (e) {
    return handleError(e);
  }
}
