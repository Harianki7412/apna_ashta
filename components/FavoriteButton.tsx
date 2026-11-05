"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "@/lib/api-client";
import { getFavoriteIds, updateFavoriteId } from "@/lib/favorites-client";
import { trackEvent } from "@/components/GoogleAnalytics";

export default function FavoriteButton({ propertyId }: { propertyId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSaved(false);
      return;
    }
    let active = true;
    getFavoriteIds(userId)
      .then((favoriteIds) => {
        if (active) setSaved(favoriteIds.has(propertyId));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, propertyId]);

  async function toggle() {
    if (!session) return router.push("/login");
    setLoading(true);
    try {
      const { saved: s } = await api.post<{ saved: boolean }>(
        "/api/favorites",
        { propertyId },
      );
      if (userId) updateFavoriteId(userId, propertyId, s);
      setSaved(s);
      trackEvent(s ? "add_to_favorites" : "remove_from_favorites", {
        property_id: propertyId,
      });
      toast.success(s ? "Saved" : "Removed");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not update favorites"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-full bg-white shadow hover:bg-gray-50 ${saved ? "text-red-500" : "text-gray-400"}`}
    >
      <Heart size={20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
