const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const STALE_LISTING_DAYS = 30;
export const HIDE_STALE_LISTING_DAYS = 60;

export function getListingFreshness(
  createdAt: Date | string,
  lastAvailabilityConfirmedAt?: Date | string | null,
  now = new Date(),
) {
  const lastConfirmed = lastAvailabilityConfirmedAt
    ? new Date(lastAvailabilityConfirmedAt)
    : new Date(createdAt);
  const ageInMs = now.getTime() - lastConfirmed.getTime();
  const ageInDays = Math.floor(ageInMs / DAY_IN_MS);

  return {
    lastConfirmed,
    isStale: ageInDays >= STALE_LISTING_DAYS,
    isHidden: ageInDays >= HIDE_STALE_LISTING_DAYS,
  };
}

export function getPublicListingFreshnessFilter(now = new Date()) {
  const cutoff = new Date(now.getTime() - HIDE_STALE_LISTING_DAYS * DAY_IN_MS);

  return {
    $or: [
      { lastAvailabilityConfirmedAt: { $gte: cutoff } },
      { lastAvailabilityConfirmedAt: null, createdAt: { $gte: cutoff } },
    ],
  };
}
