import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Search,
  MessageCircle,
  Lock,
  FileCheck,
} from "lucide-react";

export const metadata = {
  title: "Safety Tips — Flatova",
  description:
    "Learn how to stay safe while renting in Ashta. Tips to avoid scams and frauds.",
};

export default function SafetyTipsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-success-600" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Safety Tips</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Aapki safety hamari priority hai. In tips ko follow karke fraud se
          bachein.
        </p>
      </div>

      <div className="card p-5 bg-danger-50 border-danger-200 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={24}
            className="text-danger-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <h3 className="font-bold text-danger-700 mb-1">
              Never Pay Before Visiting
            </h3>
            <p className="text-sm text-danger-600">
              Kisi bhi property ke liye advance, deposit, ya "booking amount"
              mat dein until you have physically visited and met the owner.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Search size={22} className="text-brand-600" />
          For Tenants — Kya Karein
        </h2>

        <div className="space-y-3">
          {[
            {
              title: "Always visit the property first",
              desc: "Photos attractive ho sakti hain but reality different ho sakti hai. Physically dekhne ke baad hi decision lein.",
            },
            {
              title: "Verify owner identity",
              desc: 'Ask for Aadhaar/PAN. Look for "Verified Owner" badge. Cross-check name on documents.',
            },
            {
              title: "Check property ownership documents",
              desc: "Property tax receipt, electricity bill, ya registry dekhne ke liye keh sakte hain.",
            },
            {
              title: "Meet in person, not just video call",
              desc: "Direct meeting mein hi property visit karein.",
            },
            {
              title: "Never share OTPs with anyone",
              desc: "Koi bhi legitimate owner aapse OTP nahi maangega. OTP = money transfer.",
            },
            {
              title: "Sign a written rent agreement",
              desc: "Flatova se legal 21-clause PDF generate karein. Verbal promises avoid karein.",
            },
            {
              title: "Get receipts for all payments",
              desc: "Rent, deposit, maintenance — har payment ka receipt lein. Bank transfer zyada safe hai cash se.",
            },
            {
              title: "Take photos during move-in",
              desc: "Ghar ki condition ki photos lein. Move-out pe deposit dispute avoid hoga.",
            },
          ].map((tip, i) => (
            <div key={i} className="card p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-success-100 text-success-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle size={22} className="text-danger-500" />
          Red Flags — Agar Yeh Mile Toh Ruk Jaayein
        </h2>

        <div className="card p-5 bg-danger-50 border-danger-200">
          <ul className="space-y-2 text-sm text-danger-700">
            {[
              "Rent market rate se bahut kam hai (50%+ kam)",
              "Owner advance maangta hai without visit",
              'Owner phone ya chat pe hi "book" karne ki jaldi karta hai',
              "Photos reverse image search pe kahin aur dikhein",
              "Owner ID/documents dene se inkaar kare",
              'WhatsApp pe direct "Paytm" ya "cash" advance maange',
              "Bank account kisi aur ke naam pe ho",
              '"Agreement ki zarurat nahi, verbal ho jayega" bole',
            ].map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-danger-600 flex-shrink-0 font-bold">
                  ✗
                </span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileCheck size={22} className="text-success-600" />
          For Owners — Kya Karein
        </h2>

        <div className="space-y-3">
          {[
            {
              title: "Verify tenant identity before signing",
              desc: "Aadhaar/PAN, employer letter, ya previous landlord reference check karein.",
            },
            {
              title: "Always use a written rent agreement",
              desc: "Flatova se legal PDF generate karein. Registered agreement best hai.",
            },
            {
              title: "Collect deposit before handover",
              desc: "Deposit cheque ya UPI se. Cash avoid karein. Receipt dein.",
            },
            {
              title: "Photo document everything",
              desc: "Move-in condition ki photos. Inventory list sign karwaayein.",
            },
            {
              title: "Never agree to anything without payment",
              desc: '"Baat pakki hai, kal pay kar denge" — avoid. Token amount bhi receipt pe.',
            },
            {
              title: "Screen tenants properly",
              desc: "Purpose of stay, family details, work location — sab clarify karein.",
            },
            {
              title: "KYC verification karwayein",
              desc: 'Flatova se verify hokar "Verified" badge payein. Trust badhta hai.',
            },
            {
              title: "Keep rent receipts",
              desc: "Har payment ka receipt dein. Tax benefits ke liye bhi zaroori.",
            },
          ].map((tip, i) => (
            <div key={i} className="card p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Lock size={22} className="text-brand-600" />
          Flatova's Safety Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: "Verified Owner Badge",
              desc: "Aadhaar/PAN verified owners get a green ✓ badge",
              icon: CheckCircle2,
            },
            {
              title: "Property Verification",
              desc: "Admin reviews every listing before approval",
              icon: FileCheck,
            },
            {
              title: "In-App Chat",
              desc: "Communicate without sharing your phone number",
              icon: MessageCircle,
            },
            {
              title: "Report & Block",
              desc: "Report suspicious users instantly — 24hr action",
              icon: Shield,
            },
            {
              title: "Number Masking",
              desc: "Owner phone numbers only shown after you chat",
              icon: Lock,
            },
            {
              title: "Secure Payments",
              desc: "Razorpay encrypted — no card details stored",
              icon: Phone,
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-4 flex items-start gap-3">
                <Icon
                  size={20}
                  className="text-success-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">{f.title}</h3>
                  <p className="text-xs text-gray-600">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-6 bg-brand-50 border-brand-200">
        <h2 className="text-xl font-bold mb-2">Report a Problem</h2>
        <p className="text-sm text-gray-700 mb-4">
          Kisi ne aapko scam karne ki koshish ki? Fake listing dekhi? Humari
          team ko batayein — action 24 hours mein.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/contact?subject=Report%20Fake%20Listing"
            className="btn btn-primary btn-sm"
          >
            Report to Admin
          </Link>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
          >
            WhatsApp Support
          </a>
        </div>
      </section>
    </div>
  );
}
