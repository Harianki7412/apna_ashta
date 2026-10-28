import { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Shield,
  CreditCard,
  Users,
  Home,
  MessageSquare,
  FileCheck,
  Ban,
  Crown,
  Mail,
  Gavel,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Flatova",
  description: "Terms and conditions for using the Flatova rental platform.",
};

const LAST_UPDATED = "October 28, 2026";

const SECTIONS = [
  { id: "what", title: "What Flatova Is" },
  { id: "eligibility", title: "Eligibility" },
  { id: "account", title: "Account Responsibilities" },
  { id: "owners", title: "For Property Owners" },
  { id: "tenants", title: "For Tenants" },
  { id: "prohibited", title: "Prohibited Activities" },
  { id: "payments", title: "Payments & Fees" },
  { id: "kyc", title: "KYC Verification" },
  { id: "reviews", title: "Reviews & Ratings" },
  { id: "disputes", title: "Disputes" },
  { id: "ip", title: "Intellectual Property" },
  { id: "termination", title: "Account Termination" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "indemnity", title: "Indemnification" },
  { id: "law", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <article className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-8 md:p-12 text-white mb-10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Scale size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Legal Document
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-white">
            Terms of Service
          </h1>
          <p className="text-brand-100 max-w-2xl mb-4 text-lg leading-relaxed">
            These terms govern your use of Flatova. By accessing our platform,
            you agree to be bound by these terms.
          </p>
          <div className="flex items-center gap-4 text-sm text-brand-200 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              Last updated: {LAST_UPDATED}
            </div>
            <div className="flex items-center gap-1.5">
              <Gavel size={14} />
              Governed by Indian law
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* TOC */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
            <p className="text-xs font-bold uppercase text-gray-500 dark:text-slate-400 mb-3">
              Table of Contents
            </p>
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
              {SECTIONS.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* 1: What Flatova Is */}
          <section id="what" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                1
              </span>
              What Flatova Is
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-4">
              Flatova is an{" "}
              <strong className="text-gray-900 dark:text-slate-100">
                online marketplace
              </strong>{" "}
              that connects property owners (landlords) with prospective tenants
              in Ashta, Kothri, Sehore, and nearby areas.
            </p>
            <div className="p-4 rounded-xl bg-warning-50 dark:bg-warning-900/20 border-l-4 border-warning-500">
              <p className="text-sm font-semibold text-warning-700 dark:text-warning-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Important
              </p>
              <p className="text-sm text-warning-600 dark:text-warning-400">
                We are <strong>NOT</strong> a real estate broker, agent, or
                party to any rental agreement. All transactions, agreements, and
                payments for rent are solely between the owner and tenant.
              </p>
            </div>
          </section>

          {/* 2: Eligibility */}
          <section id="eligibility" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                2
              </span>
              Eligibility
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "You must be at least 18 years old",
                "You must provide accurate and truthful information",
                "You must be legally capable of entering into contracts under Indian law",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-success-500 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3: Account Responsibilities */}
          <section id="account" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                3
              </span>
              Account Responsibilities
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "You are responsible for maintaining the confidentiality of your password",
                "You must not share your account with others",
                "You must notify us immediately of unauthorized access",
                "You are responsible for all activity under your account",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Shield
                    size={16}
                    className="text-brand-600 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4: For Owners */}
          <section
            id="owners"
            className="card p-6 md:p-8 scroll-mt-24 border-l-4 border-brand-500"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                4
              </span>
              For Property Owners
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-3">
              By listing a property, you represent and warrant that:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "You are the legal owner or authorized agent of the property",
                "Property details (rent, deposit, address, photos) are accurate",
                "Photos are of the actual property (not stock images or unrelated photos)",
                "The property is legally available for rent in Ashta, MP",
                "You will not list the same property multiple times",
                "You will respond to genuine tenant inquiries within a reasonable time",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-success-500 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-700 dark:text-brand-300">
              <strong>Note:</strong> All listings are subject to admin approval.
              We may reject or remove listings that violate these terms or
              appear fraudulent.
            </div>
          </section>

          {/* 5: For Tenants */}
          <section
            id="tenants"
            className="card p-6 md:p-8 scroll-mt-24 border-l-4 border-success-500"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                5
              </span>
              For Tenants
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "Verify all property details before signing any agreement",
                "Do not make advance payments without visiting the property",
                "Respect the owner's privacy and property rules",
                "Do not use the platform for any illegal purposes",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-success-500 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 6: Prohibited */}
          <section
            id="prohibited"
            className="card p-6 md:p-8 scroll-mt-24 border-2 border-danger-200 dark:border-danger-800"
          >
            <h2 className="text-2xl font-bold mb-4 text-danger-600 dark:text-danger-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-danger-100 dark:bg-danger-900/30 text-danger-600 dark:text-danger-400 flex items-center justify-center text-sm">
                6
              </span>
              Prohibited Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Posting false, misleading, or fraudulent information",
                "Harassment, threats, or abuse of other users",
                "Posting obscene, defamatory, or illegal content",
                "Attempting to hack, scrape, or disrupt the platform",
                "Impersonating another person or entity",
                "Collecting user data without consent",
                "Using the platform for spam or unauthorized marketing",
                "Posting properties you do not own",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 bg-danger-50 dark:bg-danger-900/20 rounded-lg"
                >
                  <XCircle
                    size={14}
                    className="text-danger-500 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-danger-700 dark:text-danger-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 7: Payments */}
          <section id="payments" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                7
              </span>
              Payments & Fees
            </h2>
            <div className="space-y-2">
              {[
                {
                  icon: CheckCircle2,
                  text: "Basic use of the platform is FREE for both owners and tenants",
                },
                {
                  icon: Crown,
                  text: 'Optional "Featured Listing" costs ₹99-₹999 based on tier for 30 days',
                },
                {
                  icon: CreditCard,
                  text: "Payments are processed by Razorpay and are non-refundable once the listing is featured",
                },
                {
                  icon: Shield,
                  text: "We reserve the right to change fees with 30 days advance notice",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <Icon
                      size={16}
                      className="text-brand-600 flex-shrink-0 mt-0.5"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 8: KYC */}
          <section id="kyc" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                8
              </span>
              KYC Verification
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              Owners and tenants may optionally submit government-issued ID for
              verification. We display a "Verified" badge on successful
              verification. Verification does{" "}
              <strong className="text-gray-900 dark:text-slate-100">not</strong>{" "}
              constitute a guarantee of character or property quality — users
              must still exercise due diligence.
            </p>
          </section>

          {/* 9: Reviews */}
          <section id="reviews" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                9
              </span>
              Reviews & Ratings
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "Reviews must be honest, based on genuine experience",
                "Fake reviews will be removed and accounts may be blocked",
                "We reserve the right to moderate, hide, or delete reviews",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <MessageSquare
                    size={16}
                    className="text-brand-600 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 10: Disputes */}
          <section id="disputes" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                10
              </span>
              Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
              Flatova is{" "}
              <strong className="text-gray-900 dark:text-slate-100">
                not responsible
              </strong>{" "}
              for any disputes between owners and tenants regarding:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "Rent amount or deposit refund",
                "Property condition or damages",
                "Eviction or tenancy termination",
                "Any other matter related to the rental relationship",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-warning-500 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-700 dark:text-brand-300">
              Users are advised to sign a written rent agreement and consult a
              lawyer for legal matters.
            </div>
          </section>

          {/* 11: IP */}
          <section id="ip" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                11
              </span>
              Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              All content on the Platform (logo, design, code) is owned by Apna
              Ashta. You may not copy, modify, or redistribute it without
              written permission. Photos you upload remain your property, but
              you grant us a license to display them on the Platform.
            </p>
          </section>

          {/* 12: Termination */}
          <section id="termination" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                12
              </span>
              Account Termination
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              We may suspend or permanently delete your account without notice
              if you violate these Terms. Users can delete their own accounts at
              any time from Account Settings.
            </p>
          </section>

          {/* 13: Liability */}
          <section
            id="liability"
            className="card p-6 md:p-8 scroll-mt-24 border-2 border-warning-200 dark:border-warning-800"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400 flex items-center justify-center text-sm">
                13
              </span>
              Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
              The Platform is provided{" "}
              <strong className="text-gray-900 dark:text-slate-100">
                "as is"
              </strong>
              . We do not guarantee:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "Uninterrupted service or error-free operation",
                "Accuracy of listings or user information",
                "That the property is available at contact time",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-warning-500 flex-shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed mt-3">
              To the maximum extent permitted by law, Flatova is not liable for
              any direct, indirect, incidental, or consequential damages arising
              from use of the Platform.
            </p>
          </section>

          {/* 14: Indemnity */}
          <section id="indemnity" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                14
              </span>
              Indemnification
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              You agree to indemnify and hold harmless Flatova, its team, and
              partners from any claims, damages, or expenses arising from your
              use of the Platform or violation of these Terms.
            </p>
          </section>

          {/* 15: Law */}
          <section id="law" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                15
              </span>
              Governing Law & Jurisdiction
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              These Terms are governed by the laws of India. Any disputes shall
              be subject to the exclusive jurisdiction of the courts in{" "}
              <strong className="text-gray-900 dark:text-slate-100">
                Ashta, District Sehore, Madhya Pradesh
              </strong>
              .
            </p>
          </section>

          {/* 16: Changes */}
          <section id="changes" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                16
              </span>
              Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              We may update these Terms at any time. Continued use of the
              Platform after changes constitutes acceptance. Material changes
              will be communicated via email 30 days in advance.
            </p>
          </section>

          {/* 17: Contact */}
          <section
            id="contact"
            className="card p-6 md:p-8 scroll-mt-24 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800 border-2 border-brand-200 dark:border-brand-700"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm">
                17
              </span>
              Contact
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-4">
              For questions about these Terms:
            </p>
            <div className="p-4 bg-white dark:bg-slate-700 rounded-xl mb-4">
              <p className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2 mb-1">
                <Mail size={14} /> <strong>Legal:</strong>{" "}
                <a
                  href="mailto:legal@Flatova.in"
                  className="text-brand-600 dark:text-brand-400 underline"
                >
                  legal@Flatova.in
                </a>
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <Mail size={14} /> <strong>Support:</strong>{" "}
                <a
                  href="mailto:support@Flatova.in"
                  className="text-brand-600 dark:text-brand-400 underline"
                >
                  support@Flatova.in
                </a>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/privacy" className="btn btn-primary btn-sm">
                <Shield size={14} /> Privacy Policy
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-sm">
                <MessageSquare size={14} /> Contact Form
              </Link>
              <Link href="/refund-policy" className="btn btn-ghost btn-sm">
                <CreditCard size={14} /> Refund Policy
              </Link>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 dark:text-slate-400 p-4">
            These Terms comply with the laws of India including the Consumer
            Protection Act, 2019 and IT Act, 2000. For legal advice specific to
            your situation, please consult a qualified lawyer.
          </div>
        </div>
      </div>
    </article>
  );
}
