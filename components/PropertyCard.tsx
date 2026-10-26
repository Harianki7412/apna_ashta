"use client";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, MapPin, Home, Bed, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getBhkLabel } from "@/lib/property-types";

export default function PropertyCard({ property }: { property: any }) {
  const t = useTranslations("property");

  function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = `${base}/properties/${property._id}`;
    const text = `🏠 ${property.title}\n📍 ${property.area}\n💰 ₹${property.rent}/month\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <Link
      href={`/properties/${property._id}`}
      className="group card-premium relative"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-300">
            <Home size={48} />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Featured badge */}
        {property.featured && (
          <div className="absolute top-3 left-3 badge badge-featured">
            ⭐ {t("featured")}
          </div>
        )}

        {/* BHK + Type badges (top-right) */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {property.bhk && (
            <span className="bg-brand-600/95 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              {property.bhk.replace("BHK", " BHK")}
            </span>
          )}
          <span className="bg-white/95 backdrop-blur text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {property.propertyType}
          </span>
        </div>

        {/* WhatsApp share (on hover) */}
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
        <h3 className="font-bold text-gray-900 truncate text-base group-hover:text-brand-600 transition-colors duration-200">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{property.area}</span>
          {property.city && (
            <>
              <span className="text-gray-300">·</span>
              <span className="truncate">{property.city}</span>
            </>
          )}
        </div>

        {/* BHK/Type meta row */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
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
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <Building2 size={12} className="text-gray-400" />
                {property.propertyType}
              </span>
            </>
          )}
        </div>

        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-extrabold text-brand-600">
              ₹{property.rent.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-gray-500 ml-0.5">
              {t("perMonth")}
            </span>
          </div>
          {property.deposit > 0 && (
            <span className="text-xs text-gray-400">
              + ₹{property.deposit.toLocaleString("en-IN")} dep.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
