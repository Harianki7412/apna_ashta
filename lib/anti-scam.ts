/**
 * Anti-scam detection for properties
 * Returns flags that should be shown to users + admin
 */

export interface ScamWarning {
  level: "low" | "medium" | "high";
  message: string;
  code: string;
}

export function analyzePropertyForScams(property: any): ScamWarning[] {
  const warnings: ScamWarning[] = [];

  // 1. Too cheap (40%+ below market for area)
  const marketAvg = getMarketAvg(property.city, property.area, property.bhk);
  if (marketAvg > 0 && property.rent < marketAvg * 0.6) {
    warnings.push({
      level: "high",
      code: "price_too_low",
      message: `Rent is ${Math.round((1 - property.rent / marketAvg) * 100)}% below market average. Verify before paying.`,
    });
  }

  // 2. New account (< 7 days)
  if (property.owner?.createdAt) {
    const daysOld =
      (Date.now() - new Date(property.owner.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysOld < 7) {
      warnings.push({
        level: "medium",
        code: "new_owner",
        message: "Owner account is new. Exercise extra caution.",
      });
    }
  }

  // 3. Owner not KYC verified
  if (
    property.owner?.kycStatus !== "verified" &&
    property.owner?.phoneVerified !== true
  ) {
    warnings.push({
      level: "low",
      code: "unverified_owner",
      message:
        "Owner is not fully verified. Verify property in person before paying.",
    });
  }

  // 4. Multiple reports
  if (property.reportCount >= 3) {
    warnings.push({
      level: "high",
      code: "reported",
      message: `This listing has been reported ${property.reportCount} times.`,
    });
  }

  // 5. Very few photos
  if (!property.images || property.images.length < 2) {
    warnings.push({
      level: "low",
      code: "few_photos",
      message: "Listing has very few photos. Request more before visiting.",
    });
  }

  // 6. Flagged by admin
  if (property.flagged) {
    warnings.push({
      level: "high",
      code: "flagged",
      message: "This listing has been flagged for review.",
    });
  }

  return warnings;
}

/**
 * Approximate market rents by city + BHK.
 * Ideally you'd calculate from real data. This is a fallback.
 */
const MARKET_RENTS: Record<string, Record<string, number>> = {
  Ashta: { "1BHK": 5000, "2BHK": 8000, "3BHK": 12000, "1RK": 3500, Room: 3000 },
  Kothri: {
    "1BHK": 4500,
    "2BHK": 7000,
    "3BHK": 10000,
    "1RK": 3000,
    Room: 2500,
  },
  Sehore: {
    "1BHK": 6000,
    "2BHK": 10000,
    "3BHK": 15000,
    "1RK": 4000,
    Room: 3500,
  },
};

export function getMarketAvg(city: string, area: string, bhk?: string): number {
  const cityData = MARKET_RENTS[city] || MARKET_RENTS["Ashta"];
  if (!bhk) return 0;
  return cityData[bhk] || 0;
}

export function getScamScore(warnings: ScamWarning[]): number {
  return warnings.reduce((sum, w) => {
    if (w.level === "high") return sum + 30;
    if (w.level === "medium") return sum + 15;
    return sum + 5;
  }, 0);
}
