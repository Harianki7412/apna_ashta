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
    <button onClick={share} className="btn btn-whatsapp btn-sm">
      <MessageCircle size={16} />
      <span className="hidden sm:inline">WhatsApp</span>
    </button>
  );
}
