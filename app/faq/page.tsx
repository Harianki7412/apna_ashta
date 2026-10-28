"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Search,
  HelpCircle,
  Home,
  Building2,
  CreditCard,
  Shield,
} from "lucide-react";

const CATEGORIES = [
  { key: "tenant", label: "For Tenants", icon: Home },
  { key: "owner", label: "For Owners", icon: Building2 },
  { key: "payment", label: "Payments", icon: CreditCard },
  { key: "safety", label: "Safety & Trust", icon: Shield },
] as const;

const FAQS: Record<string, { q: string; a: string }[]> = {
  tenant: [
    {
      q: "Flatova pe account kaise banayein?",
      a: "Register page pe jaayein, apna naam, email ya phone, aur password daalein. Email ya phone — dono mein se ek se OTP verify karein. 1 minute mein account ready.",
    },
    {
      q: "Property dekhne ke liye paisa lagta hai kya?",
      a: "Bilkul free. Browsing, searching, aur owner se chat karne ke liye koi charge nahi. Brokers ki tarah commission nahi hai.",
    },
    {
      q: "Owner se kaise contact karein?",
      a: 'Property page pe "Chat with Owner" button click karein — direct chat khul jayegi. Ya WhatsApp pe contact karne ka option bhi hai.',
    },
    {
      q: "Kya main ghar visit karne se pehle photos dekh sakta hoon?",
      a: "Haan, har property mein 5-10 photos hoti hain. Kuch properties mein 360° virtual tours bhi available hain.",
    },
    {
      q: "Property fake ho toh kya karein?",
      a: 'Kisi bhi property page pe "Report" button hai. Report karein — humari team 24 hours mein verify karke action leti hai.',
    },
    {
      q: "Favorites kaise save karein?",
      a: "Har property card pe ❤️ heart icon hai. Click karein — property favorites mein add ho jayegi.",
    },
    {
      q: "Saved searches kya hain?",
      a: "Aap apne filters save kar sakte hain. Jab bhi new matching property aaye, aapko email aur in-app notification milega.",
    },
    {
      q: "Rent agreement kaise banayein?",
      a: "Owner se chat karein, terms finalize karein. Owner Flatova se legal rent agreement generate kar sakta hai. Aap confirm karein — PDF download ho jayega.",
    },
  ],
  owner: [
    {
      q: "Property list karna free hai?",
      a: 'Haan, bilkul free. Basic listing 100% free hai. Sirf "Featured Listing" (₹99 for 30 days) optional paid hai.',
    },
    {
      q: "Property list karne mein kitna time lagta hai?",
      a: "5-step form fill karein — 5 minutes. Photos upload karein. Submit karein. Admin approval 24 hours mein.",
    },
    {
      q: "Listing approve hone mein kitna time?",
      a: "Usually 4-24 hours. Fast approval ke liye clear photos aur accurate details dein.",
    },
    {
      q: "Kitni properties list kar sakta hoon?",
      a: "Free plan mein 2 active listings. Pro (₹499/month) mein 10 listings. Business (₹1,499/month) mein unlimited.",
    },
    {
      q: "Featured listing kya hai?",
      a: "₹99 mein aapki property 30 din ke liye search results mein sabse upar dikhti hai. Views 3x badh jaate hain.",
    },
    {
      q: "Property edit kaise karein?",
      a: 'Dashboard → "My Properties" → Edit button. Changes karein → Save. Edited property re-approval ke liye jaati hai.',
    },
    {
      q: "Property delete kar sakte hain?",
      a: 'Haan. Dashboard, property detail, ya edit page se "Delete" button. Confirmation ke liye "DELETE" type karna hoga.',
    },
    {
      q: "KYC verification kaise karein?",
      a: 'Profile → "Get Verified" → Phone OTP verify → Aadhaar/PAN document upload. 24-48 hours mein admin verify karta hai.',
    },
  ],
  payment: [
    {
      q: "Payment kaise karein?",
      a: "Razorpay se — UPI, debit card, credit card, net banking. Secure 256-bit SSL. Har payment ka receipt email pe milega.",
    },
    {
      q: "Featured listing ka refund milega?",
      a: "Nahi, featured listing fees non-refundable hai. Lekin technical issue ki wajah se listing display nahi hui, toh full refund milega.",
    },
    {
      q: "Subscription cancel kaise karein?",
      a: 'Profile → Subscription → "Cancel". Aap next billing cycle tak use kar sakte hain. Recurring charge automatically band ho jayegi.',
    },
    {
      q: "GST invoice chahiye?",
      a: 'Haan, business users ke liye. Payment ke baad "Request GST Invoice" button. 24 hours mein email pe invoice.',
    },
    {
      q: "Refund policy kya hai?",
      a: "Detailed policy /refund-policy page pe. Summary: Featured listings non-refundable (unless technical issue).",
    },
  ],
  safety: [
    {
      q: "Fake properties se kaise bachein?",
      a: '✓ Sirf "Verified Owner" badge wali properties dekhein. ✓ Rent bahut kam ho toh suspicious. ✓ Visit se pehle advance mat dein. ✓ "Report" button use karein.',
    },
    {
      q: "Owner ne advance maanga hai — safe hai?",
      a: "Visit karne se pehle koi advance mat dein. Property physically dekh lein, agreement padh lein, phir token amount dein.",
    },
    {
      q: "Data safe kaise hai?",
      a: "Passwords bcrypt se encrypted. Personal data masked hai. DPDP Act 2023 compliant. Koi third party ko data sell nahi karte.",
    },
    {
      q: "Owner misbehave kare toh kya karein?",
      a: "Report karein (property ya profile se). Screenshots ke saath. Humari team 24 hours mein investigate karti hai.",
    },
    {
      q: "KYC verified ka matlab kya?",
      a: "Verified owner ne apna Aadhaar/PAN upload kiya hai jo admin ne check kiya hai. 100% safety guarantee nahi, but much more reliable.",
    },
  ],
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("tenant");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const allFaqs: { q: string; a: string }[] = [];
  Object.values(FAQS).forEach((arr) => allFaqs.push(...arr));

  const filteredFaqs = searchQuery
    ? allFaqs.filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : FAQS[activeCategory] || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <HelpCircle size={32} className="text-brand-600" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-500">Aapke sawaalon ke jawab</p>
      </div>

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search FAQs..."
          className="input pl-11 py-3 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {!searchQuery && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setOpenIndex(0);
                }}
                className={`card p-3 text-center transition-all ${
                  active
                    ? "bg-brand-600 text-white border-brand-600"
                    : "hover:border-brand-300"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    active ? "text-white mx-auto" : "text-brand-600 mx-auto"
                  }
                />
                <p
                  className={`text-xs font-semibold mt-1 ${active ? "text-white" : ""}`}
                >
                  {cat.label}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="card p-8 text-center">
            <Search size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No questions match your search</p>
          </div>
        ) : (
          filteredFaqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-10 card p-8 text-center bg-brand-50 border-brand-200">
        <h2 className="text-xl font-bold mb-2">Aur koi sawal hai?</h2>
        <p className="text-gray-600 mb-4">
          Humse direct baat karein — hum jaldi reply karte hain.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Link href="/contact" className="btn btn-primary">
            Contact Us
          </Link>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
