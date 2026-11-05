"use client";
import { memo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  MapPin,
  Home,
  Bed,
  Building2,
  Heart,
  Eye,
  Shield,
  AlertTriangle,
  Camera,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getBhkLabel } from "@/lib/property-types";
import { formatDistance } from "date-fns";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { getListingFreshness } from "@/lib/property-freshness";
import { getFavoriteIds, updateFavoriteId } from "@/lib/favorites-client";
import { trackEvent } from "@/components/GoogleAnalytics";

const PropertyCard = memo(function PropertyCard({
  property,
}: {
  property: any;
}) {
  const t = useTranslations("property");
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!userId) {
      setSaved(false);
      return;
    }
    let active = true;
    getFavoriteIds(userId)
      .then((favoriteIds) => {
        if (active) setSaved(favoriteIds.has(property._id));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, property._id]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return router.push("/login");
    if (toggling) return;
    setToggling(true);
    setSaved((s) => !s);
    try {
      const { saved: newState } = await api.post<{ saved: boolean }>(
        "/api/favorites",
        { propertyId: property._id },
      );
      if (userId) updateFavoriteId(userId, property._id, newState);
      setSaved(newState);
      trackEvent(newState ? "add_to_favorites" : "remove_from_favorites", {
        property_id: property._id,
      });
      toast.success(newState ? "Saved" : "Removed");
    } catch (err: any) {
      setSaved((s) => !s);
      toast.error(err.message);
    } finally {
      setToggling(false);
    }
  }

  function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    trackEvent("share_property", {
      property_id: property._id,
      method: "whatsapp",
    });
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = `${base}/properties/${property._id}`;
    const text = `🏠 ${property.title}\n📍 ${property.area}\n💰 ₹${property.rent}/month\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const listingAge =
    property.createdAt && now !== null
      ? now - new Date(property.createdAt).getTime()
      : undefined;
  const isNew =
    listingAge !== undefined &&
    listingAge >= 0 &&
    listingAge < 7 * 24 * 60 * 60 * 1000;
  const isStale = property.createdAt && now !== null
    ? getListingFreshness(
        property.createdAt,
        property.lastAvailabilityConfirmedAt,
        new Date(now),
      ).isStale
    : false;

  const hasWarnings =
    property.scamWarnings?.length > 0 || property.reportCount >= 3;

  return (
    <article className="group card-premium relative">
      <div className="relative">
        <Link
          href={`/properties/${property._id}`}
          aria-label={`View ${property.title}`}
          className="relative block h-52 overflow-hidden bg-gray-100 dark:bg-slate-700 sm:h-56"
        >
          {property.images?.[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 dark:text-slate-500">
              <Home size={48} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {property.featured && (
            <div className="absolute left-3 top-3 badge badge-featured">
              ⭐ {t("featured")}
            </div>
          )}

          {property.verified && !property.featured && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-success-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              <Shield size={10} /> Verified
            </div>
          )}

          {isNew && !property.featured && !property.verified && (
            <div className="absolute left-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              NEW
            </div>
          )}

          {hasWarnings && (
            <span
              aria-label="Listing safety notice"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-warning-500 text-white shadow-lg"
            >
              <AlertTriangle size={14} />
            </span>
          )}

          {property.images?.length > 1 && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur">
              <Camera size={10} /> {property.images.length}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={toggleFavorite}
          disabled={toggling}
          aria-label={saved ? "Remove from favorites" : "Save to favorites"}
          aria-pressed={saved}
          className={`absolute right-3 ${hasWarnings ? "top-12" : "top-3"} z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${
            saved
              ? "bg-red-500 text-white"
              : "bg-white/95 dark:bg-slate-800/95 backdrop-blur text-gray-600 dark:text-slate-300"
          }`}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>

        <button
          type="button"
          onClick={share}
          aria-label="Share on WhatsApp"
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 translate-y-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:bg-green-600 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          title="Share on WhatsApp"
        >
          <MessageCircle size={16} />
        </button>
      </div>

      <Link href={`/properties/${property._id}`} className="block p-4">
        <h3 className="font-bold text-gray-900 dark:text-slate-100 truncate text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 mt-1">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{property.area}</span>
          {property.city && (
            <>
              <span className="text-gray-300 dark:text-slate-600">·</span>
              <span className="truncate">{property.city}</span>
            </>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-slate-400">
          {property.bhk ? (
            <span className="flex items-center gap-1">
              <Bed size={12} className="text-gray-400" />
              {getBhkLabel(property.bhk)}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Home size={12} className="text-gray-400" />
              {property.propertyType}
            </span>
          )}
          {property.bhk && (
            <>
              <span className="text-gray-300 dark:text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <Building2 size={12} className="text-gray-400" />
                {property.propertyType}
              </span>
            </>
          )}
        </div>

        {/* Owner response label */}
        {property.owner?.responseLabel && (
          <div className="mt-2 text-xs text-success-600 dark:text-success-400 font-medium flex items-center gap-1">
            {property.owner.responseLabel}
          </div>
        )}

        {isStale && (
          <p className="mt-2 text-xs font-medium text-warning-700 dark:text-warning-300">
            {t("staleListing")}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-gray-100 pt-3 dark:border-slate-700">
          <div>
            <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 sm:text-2xl">
              ₹{property.rent?.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-gray-500 dark:text-slate-400 ml-0.5">
              {t("perMonth")}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-gray-400">
            {property.views > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye size={11} /> {property.views}
              </span>
            )}
            {property.createdAt && now !== null && (
              <span>
                {t("listedAgo", {
                  time: formatDistance(
                    new Date(property.createdAt),
                    new Date(now),
                    { addSuffix: true },
                  ),
                })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
});

export default PropertyCard;
