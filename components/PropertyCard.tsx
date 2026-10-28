"use client";
import { useState, useEffect } from "react";
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
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function PropertyCard({ property }: { property: any }) {
  const t = useTranslations("property");
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!session) return;
    api
      .get<any[]>("/api/favorites")
      .then((favs) => setSaved(favs.some((p) => p._id === property._id)))
      .catch(() => {});
  }, [session, property._id]);

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
      setSaved(newState);
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
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = `${base}/properties/${property._id}`;
    const text = `🏠 ${property.title}\n📍 ${property.area}\n💰 ₹${property.rent}/month\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // Check if new (< 7 days)
  const isNew =
    property.createdAt &&
    Date.now() - new Date(property.createdAt).getTime() <
      7 * 24 * 60 * 60 * 1000;

  const hasWarnings =
    property.scamWarnings?.length > 0 || property.reportCount >= 3;

  return (
    <Link
      href={`/properties/${property._id}`}
      className="group card-premium relative"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-slate-700">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-300 dark:text-slate-500">
            <Home size={48} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Featured badge */}
        {property.featured && (
          <div className="absolute top-3 left-3 badge badge-featured">
            ⭐ {t("featured")}
          </div>
        )}

        {/* Verified badge */}
        {property.verified && !property.featured && (
          <div className="absolute top-3 left-3 bg-success-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Shield size={10} /> Verified
          </div>
        )}

        {/* New badge */}
        {isNew && !property.featured && !property.verified && (
          <div className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            NEW
          </div>
        )}

        {/* Warning badge */}
        {hasWarnings && (
          <div className="absolute top-3 right-3 bg-warning-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <AlertTriangle size={10} />
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={toggleFavorite}
          disabled={toggling}
          className={`absolute top-3 ${hasWarnings ? "top-12" : "top-3"} right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
            saved
              ? "bg-red-500 text-white"
              : "bg-white/95 dark:bg-slate-800/95 backdrop-blur text-gray-600 dark:text-slate-300"
          }`}
          style={hasWarnings ? { top: "3rem" } : {}}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>

        {/* Photo count */}
        {property.images?.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Camera size={10} /> {property.images.length}
          </div>
        )}

        {/* WhatsApp share on hover */}
        <button
          onClick={share}
          className="absolute bottom-3 right-3 bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          title="Share on WhatsApp"
        >
          <MessageCircle size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
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

        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <div>
            <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
              ₹{property.rent?.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-gray-500 dark:text-slate-400 ml-0.5">
              {t("perMonth")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {property.views > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye size={11} /> {property.views}
              </span>
            )}
            {property.createdAt && (
              <span className="hidden md:inline">
                {formatDistanceToNow(new Date(property.createdAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
