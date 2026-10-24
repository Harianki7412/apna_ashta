"use client";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

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
      className="group bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden relative block"
    >
      <div className="relative h-48">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="bg-gray-200 h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {property.featured && (
          <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            ⭐ {t("featured")}
          </span>
        )}
        <button
          onClick={share}
          className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
          title="Share on WhatsApp"
        >
          <MessageCircle size={14} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate">{property.title}</h3>
        <p className="text-sm text-gray-600">
          {property.area} · {property.propertyType}
        </p>
        <p className="mt-2 font-bold text-blue-600">
          ₹{property.rent?.toLocaleString("en-IN")}
          {t("perMonth")}
        </p>
      </div>
    </Link>
  );
}
