"use client";

import toast from "react-hot-toast";
import { api, getErrorMessage } from "@/lib/api-client";

const CACHE_DURATION = 30_000;

const favoriteCache = new Map<
  string,
  { ids: Set<string>; expiresAt: number }
>();
const favoriteRequests = new Map<string, Promise<Set<string>>>();
const pendingFavoriteUpdates = new Map<string, Map<string, boolean>>();

export function getFavoriteIds(userId: string): Promise<Set<string>> {
  const cached = favoriteCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.ids);
  }

  const pendingRequest = favoriteRequests.get(userId);
  if (pendingRequest) return pendingRequest;

  const request = api
    .get<string[]>("/api/favorites?idsOnly=1")
    .then((ids) => {
      const favoriteIds = new Set(ids);
      const pendingUpdates = pendingFavoriteUpdates.get(userId);
      pendingUpdates?.forEach((saved, propertyId) => {
        if (saved) favoriteIds.add(propertyId);
        else favoriteIds.delete(propertyId);
      });
      pendingFavoriteUpdates.delete(userId);
      favoriteCache.set(userId, {
        ids: favoriteIds,
        expiresAt: Date.now() + CACHE_DURATION,
      });
      return favoriteIds;
    })
    .catch((error: unknown) => {
      toast.error(getErrorMessage(error, "Unable to load favorites."));
      throw error;
    })
    .finally(() => {
      favoriteRequests.delete(userId);
    });

  favoriteRequests.set(userId, request);
  return request;
}

export function updateFavoriteId(
  userId: string,
  propertyId: string,
  saved: boolean,
) {
  const cached = favoriteCache.get(userId);
  if (cached) {
    if (saved) cached.ids.add(propertyId);
    else cached.ids.delete(propertyId);
    return;
  }

  const updates =
    pendingFavoriteUpdates.get(userId) || new Map<string, boolean>();
  updates.set(propertyId, saved);
  pendingFavoriteUpdates.set(userId, updates);
}
