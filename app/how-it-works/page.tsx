import Link from "next/link";
import {
  Search,
  MessageCircle,
  Home,
  CheckCircle2,
  Building2,
  Upload,
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "How It Works — Flatova",
  description:
    "Learn how to find or list rental properties on Flatova in 3 simple steps.",
};

function Step({
  num,
  icon,
  title,
  desc,
  color = "brand",
}: {
  num: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color?: "brand" | "success";
}) {
  const colors = { brand: "bg-brand-600", success: "bg-success-500" };
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-xl ${colors[color]} text-white flex items-center justify-center flex-shrink-0 relative`}
      >
        {icon}
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-bold">
          {num}
        </span>
      </div>
      <div className="flex-1 pt-0.5">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">How It Works</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Chahe tenant ho ya owner — Flatova pe sab kuch 3 simple steps mein
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TENANTS */}
        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Search size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">For Tenants</h2>
              <p className="text-sm text-gray-500">Ghar dhundhna easy</p>
            </div>
          </div>

          <div className="space-y-6">
            <Step
              num={1}
              icon={<Search size={20} />}
              title="Search karein"
              desc="City, area, BHK, budget set karein. Instant results — koi waiting nahi."
            />
            <Step
              num={2}
              icon={<MessageCircle size={20} />}
              title="Owner se baat karein"
              desc="Chat karein, details poochein, photos dekhein. Bina broker ke direct contact."
            />
            <Step
              num={3}
              icon={<Home size={20} />}
              title="Visit karein & shift ho jayein"
              desc="Ghar visit karein, terms finalize karein. Rent agreement bhi generate kar sakte hain."
            />
          </div>

          <Link href="/properties" className="btn btn-primary w-full mt-6">
            Browse Properties <ArrowRight size={16} />
          </Link>
        </div>

        {/* OWNERS */}
        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">For Owners</h2>
              <p className="text-sm text-gray-500">
                List karein, tenants payein
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Step
              num={1}
              icon={<Upload size={20} />}
              title="Property list karein"
              desc="5-step form fill karein. Photos upload karein. Free mein — koi charge nahi."
              color="success"
            />
            <Step
              num={2}
              icon={<Users size={20} />}
              title="Inquiries receive karein"
              desc="Verification ke baad property live. Tenants se chats aur WhatsApp messages aayenge."
              color="success"
            />
            <Step
              num={3}
              icon={<FileText size={20} />}
              title="Agreement banayein"
              desc="Terms finalize karein. Legal rent agreement generate karein. Done!"
              color="success"
            />
          </div>

          <Link href="/properties/new" className="btn btn-success w-full mt-6">
            List Your Property <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Aur bhi features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Verified Listings",
              desc: "Har property admin review ke baad hi live hoti hai",
            },
            {
              title: "Direct Chat",
              desc: "Bina number share ke owner se baat karein",
            },
            {
              title: "KYC Verified Owners",
              desc: "Aadhaar-verified owners ke saath deal karein",
            },
            {
              title: "Legal Rent Agreement",
              desc: "21-clause legal PDF — court-ready",
            },
            {
              title: "Saved Searches",
              desc: "Naye properties aaye toh instant alert",
            },
            {
              title: "Mobile Friendly",
              desc: "Phone pe app ki tarah use karein",
            },
          ].map((f) => (
            <div key={f.title} className="card p-4">
              <div className="flex items-start gap-2 mb-1">
                <CheckCircle2
                  size={16}
                  className="text-success-500 flex-shrink-0 mt-0.5"
                />
                <h3 className="font-semibold text-sm">{f.title}</h3>
              </div>
              <p className="text-xs text-gray-600 ml-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "white" }}>
          Ready to start?
        </h2>
        <p className="text-brand-100 mb-6">Abhi shuru karein — bilkul free!</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/properties" className="btn bg-white text-brand-700">
            Browse Properties
          </Link>
          <Link
            href="/register"
            className="btn bg-white/20 text-white border border-white/30"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
