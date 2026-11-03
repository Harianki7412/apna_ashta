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
      q: "How do I create a Flatova account?",
      a: "Go to the registration page and enter your name, email or phone number, and password. Verify your email or phone number with an OTP. Your account will be ready in about a minute.",
    },
    {
      q: "Does it cost anything to browse properties?",
      a: "No, it is completely free. There is no charge to browse or search listings or chat with an owner. Unlike brokers, we do not charge a commission.",
    },
    {
      q: "How do I contact an owner?",
      a: 'Click the "Chat with Owner" button on the property page to start a direct conversation. You can also contact the owner on WhatsApp.',
    },
    {
      q: "Can I see photos before visiting a property?",
      a: "Yes. Each property has 5–10 photos, and some properties also offer 360° virtual tours.",
    },
    {
      q: "What should I do if a property listing is fake?",
      a: 'Use the "Report" button on the property page. Our team will review the report and take action within 24 hours.',
    },
    {
      q: "How do I save a property to my favorites?",
      a: "Click the ❤️ heart icon on any property card to add that property to your favorites.",
    },
    {
      q: "What are saved searches?",
      a: "You can save your search filters. When a new matching property is listed, you will receive an email and an in-app notification.",
    },
    {
      q: "How do I create a rental agreement?",
      a: "Chat with the owner and finalize the terms. The owner can generate a rental agreement through Flatova. Once you confirm it, you can download the agreement as a PDF.",
    },
  ],
  owner: [
    {
      q: "Is it free to list a property?",
      a: 'Yes. Basic listings are completely free. The optional "Featured Listing" costs ₹99 for 30 days.',
    },
    {
      q: "How long does it take to list a property?",
      a: "Complete the five-step form and upload photos. It takes about five minutes, and admin approval usually takes up to 24 hours.",
    },
    {
      q: "How long does listing approval take?",
      a: "Approval usually takes 4–24 hours. Provide clear photos and accurate details to help speed up the process.",
    },
    {
      q: "How many properties can I list?",
      a: "The free plan includes 2 active listings. Pro (₹499/month) includes 10 listings, and Business (₹1,499/month) includes unlimited listings.",
    },
    {
      q: "What is a Featured Listing?",
      a: "For ₹99, your property appears at the top of search results for 30 days. Featured listings can receive up to 3x more views.",
    },
    {
      q: "How do I edit a property?",
      a: 'Go to Dashboard → "My Properties" → Edit. Make your changes and save them. Edited properties are sent for approval again.',
    },
    {
      q: "Can I delete a property?",
      a: 'Yes. Use the "Delete" button on the dashboard, property details, or edit page. You will need to type "DELETE" to confirm.',
    },
    {
      q: "How do I complete KYC verification?",
      a: 'Go to Profile → "Get Verified," verify your phone with an OTP, and upload an Aadhaar or PAN document. An admin will review it within 24–48 hours.',
    },
  ],
  payment: [
    {
      q: "How can I make a payment?",
      a: "Payments are processed through Razorpay. You can pay by UPI, debit card, credit card, or net banking. Payments are secured with 256-bit SSL, and you will receive a receipt by email.",
    },
    {
      q: "Can I get a refund for a Featured Listing?",
      a: "Featured Listing fees are non-refundable. However, if a technical issue prevents your listing from being displayed, you will receive a full refund.",
    },
    {
      q: "How do I cancel my subscription?",
      a: 'Go to Profile → Subscription → "Cancel." You can continue using your subscription until the end of the current billing cycle. Recurring charges will stop automatically.',
    },
    {
      q: "Can I get a GST invoice?",
      a: 'Yes, business users can click "Request GST Invoice" after making a payment. The invoice will be emailed within 24 hours.',
    },
    {
      q: "What is the refund policy?",
      a: "See the /refund-policy page for details. In brief, Featured Listing fees are non-refundable unless there is a technical issue.",
    },
  ],
  safety: [
    {
      q: "How can I avoid fake property listings?",
      a: '✓ Look for properties with the "Verified Owner" badge. ✓ Be cautious if the rent seems unusually low. ✓ Do not pay an advance before visiting. ✓ Use the "Report" button to flag suspicious listings.',
    },
    {
      q: "The owner asked for an advance payment. Is that safe?",
      a: "Do not pay an advance before visiting. See the property in person and read the agreement before paying a token amount.",
    },
    {
      q: "How is my data protected?",
      a: "Passwords are hashed using bcrypt, and personal data is masked. We comply with the DPDP Act 2023 and do not sell your data to third parties.",
    },
    {
      q: "What should I do if an owner behaves inappropriately?",
      a: "Report the owner from the property or profile page, and include screenshots. Our team will investigate within 24 hours.",
    },
    {
      q: "What does KYC verified mean?",
      a: "A verified owner has uploaded an Aadhaar or PAN document that has been reviewed by an admin. This does not guarantee complete safety, but it does provide an additional layer of trust.",
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
        <p className="text-gray-500">Answers to your questions</p>
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
        <h2 className="text-xl font-bold mb-2">Have another question?</h2>
        <p className="text-gray-600 mb-4">
          Contact us directly — we will get back to you as soon as possible.
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
