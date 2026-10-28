import Link from "next/link";
import {
  Home,
  Users,
  Shield,
  TrendingUp,
  Heart,
  MapPin,
  Sparkles,
  Target,
  ArrowRight,
} from "lucide-react";
import { CITIES } from "@/lib/cities";

export const metadata = {
  title: "About Us — Flatova",
  description:
    "Flatova is Ashta's own rental platform connecting verified property owners with tenants across Ashta, Kothri, and Sehore.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-16 px-6 md:py-20 mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <Home size={32} className="text-white" />
          </div>
          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{ color: "white" }}
          >
            Ashta ka Apna Rental Platform
          </h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto">
            Hum Ashta, Kothri aur Sehore ke logon ko verified, direct-from-owner
            properties se jodte hain — bina brokers, bina hidden charges.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
              <Target size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Our Mission</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Har tenant ko uski zarurat ka ghar dhundhna easy banana — through
              direct contact with owners, transparent pricing, and zero
              brokerage.
            </p>
          </div>
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Our Vision</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Chhote shehron ka #1 rental platform banna — jahan technology aur
              local trust dono milte hain.
            </p>
          </div>
          <div className="card p-6">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
              <Heart size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Our Values</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Trust, transparency, and technology — teeno ek saath. Har listing
              verified, har user protected.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mb-12">
        <div className="card p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Hamari Kahani</h2>
          <div className="prose max-w-none text-gray-700 space-y-4">
            <p>
              <strong>Flatova</strong> ek simple problem se shuru hua — Ashta
              mein ghar dhundhna ya kirae pe dena bahut mushkil tha. Log
              WhatsApp groups aur local brokers pe depend karte the, aur bahut
              baar fake listings, hidden charges, ya unreliable logon se milna
              padta tha.
            </p>
            <p>
              Hum ne socha — kyun na ek aisa platform banao jahan{" "}
              <strong>sirf verified properties</strong> hon, owners directly
              contact kar sakein tenants se, aur{" "}
              <strong>bilkul bina brokerage</strong> ke ghar mil jaye?
            </p>
            <p>
              Aaj Flatova pe <strong>Ashta, Kothri, aur Sehore</strong> ke 3
              shehron mein verified listings hain. Har property admin review ke
              baad hi live hoti hai. Har owner verified ho sakta hai. Har tenant
              ghar visit karne se pehle complete details dekh sakta hai.
            </p>
            <p>
              Yeh sirf shuruaat hai. Hum apne shehron ko digital bana rahe hain
              — ek ghar, ek mohalla, ek insaan ke bharose se.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-6 text-center">
            <p className="text-4xl font-extrabold text-brand-600 mb-1">500+</p>
            <p className="text-sm text-gray-500">Verified Properties</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-4xl font-extrabold text-brand-600 mb-1">1000+</p>
            <p className="text-sm text-gray-500">Happy Tenants</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-4xl font-extrabold text-brand-600 mb-1">3</p>
            <p className="text-sm text-gray-500">Cities</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-4xl font-extrabold text-brand-600 mb-1">0%</p>
            <p className="text-sm text-gray-500">Brokerage</p>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          Kyun Flatova?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: Shield,
              color: "success",
              title: "100% Verified Listings",
              desc: "Har property admin team ke dwara review hoti hai. Fake listings ya misleading photos — zero tolerance.",
            },
            {
              icon: Users,
              color: "brand",
              title: "Direct Owner Contact",
              desc: "Koi broker nahi, koi middleman nahi. Chat karein, WhatsApp karein, ya call karein — directly.",
            },
            {
              icon: TrendingUp,
              color: "accent",
              title: "Transparent Pricing",
              desc: "Jo rent dikhta hai wahi pay karna hai. Deposit, maintenance, availability — sab upfront.",
            },
            {
              icon: MapPin,
              color: "danger",
              title: "Local, Hyperlocal",
              desc: "Ashta ka pehla dedicated rental platform. Har mohalle ki jaankari, har area ka context.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            const colorClass =
              {
                success: "bg-success-50 text-success-600",
                brand: "bg-brand-100 text-brand-600",
                accent: "bg-accent-400/20 text-accent-600",
                danger: "bg-danger-50 text-danger-600",
              }[item.color] || "bg-brand-100 text-brand-600";
            return (
              <div key={i} className="card p-6 flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cities */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Hum kahan hain?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/rent-in/${city.slug}`}
              className="card p-5 hover:border-brand-300 hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-brand-600" size={20} />
                <h3 className="font-bold group-hover:text-brand-600 transition-colors">
                  {city.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {city.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-3" style={{ color: "white" }}>
          Ready to start?
        </h2>
        <p className="text-brand-100 mb-6 max-w-lg mx-auto">
          Chahe ghar dhundh rahe ho ya apna ghar list karna chahte ho — Apna
          Ashta aapke liye hai.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/properties"
            className="btn bg-white text-brand-700 hover:bg-brand-50"
          >
            Browse Properties <ArrowRight size={16} />
          </Link>
          <Link
            href="/properties/new"
            className="btn bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30"
          >
            List Your Property
          </Link>
        </div>
      </section>
    </div>
  );
}
