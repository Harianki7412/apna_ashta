"use client";
import { MessageCircle } from "lucide-react";

export default function WhatsAppShare({
  title,
  rent,
  area,
  propertyId,
}: {
  title: string;
  rent: number;
  area: string;
  propertyId: string;
}) {
  function share() {
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const url = `${base}/properties/${propertyId}`;
    const text = `🏠 *${title}*\n📍 ${area}\n💰 ₹${rent}/month\n🔗 ${url}\n\n_Apna Ashta_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }
  return (
    <button
      onClick={share}
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
    >
      <MessageCircle size={18} />
      <span className="hidden sm:inline">WhatsApp</span>
    </button>
  );
}
