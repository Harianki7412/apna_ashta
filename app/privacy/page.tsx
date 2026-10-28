import { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  Users,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Download,
  Trash2,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Apna Ashta",
  description:
    "How Apna Ashta collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "October 28, 2026";

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "collect", title: "Information We Collect" },
  { id: "use", title: "How We Use It" },
  { id: "share", title: "Information Sharing" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "retention", title: "Data Retention" },
  { id: "rights", title: "Your Rights" },
  { id: "security", title: "Data Security" },
  { id: "children", title: "Children's Privacy" },
  { id: "grievance", title: "Grievance Officer" },
  { id: "changes", title: "Policy Changes" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPage() {
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
              <Shield size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Legal Document
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-white">
            Privacy Policy
          </h1>
          <p className="text-brand-100 max-w-2xl mb-4 text-lg leading-relaxed">
            Your privacy matters. This policy explains how we collect, use, and
            protect your personal data — in compliance with India's{" "}
            <strong className="text-white">DPDP Act 2023</strong>.
          </p>
          <div className="flex items-center gap-4 text-sm text-brand-200 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              Last updated: {LAST_UPDATED}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              ~6 min read
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
            <p className="text-xs font-bold uppercase text-gray-500 dark:text-slate-400 mb-3">
              On this page
            </p>
            <nav className="space-y-1">
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
        <div className="lg:col-span-3 space-y-8">
          {/* Overview */}
          <section id="overview" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                1
              </span>
              Overview
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
              Apna Ashta ("we", "our", "us") operates the website{" "}
              <strong className="text-gray-900 dark:text-slate-100">
                apnaashta.in
              </strong>{" "}
              (the "Platform"), a hyperlocal rental listing service for Ashta,
              Kothri, Sehore, and nearby areas in Madhya Pradesh, India.
            </p>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              This Privacy Policy explains how we collect, use, share, and
              protect your information when you use our Platform, in compliance
              with the{" "}
              <strong className="text-gray-900 dark:text-slate-100">
                Digital Personal Data Protection Act, 2023 (DPDP Act)
              </strong>{" "}
              of India.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500">
              <p className="text-sm text-brand-700 dark:text-brand-300">
                <strong>Plain language summary:</strong> We collect minimal
                data, use it only to run the platform, never sell it to third
                parties, and you can delete it anytime.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section id="collect" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                2
              </span>
              Information We Collect
            </h2>

            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <UserCheck size={16} className="text-brand-600" />
              Information you provide directly
            </h3>
            <ul className="space-y-2 mb-5 text-gray-700 dark:text-slate-300">
              {[
                {
                  bold: "Account data:",
                  rest: "Name, email, phone number, password (encrypted), user role (owner/tenant/admin)",
                },
                {
                  bold: "Property listings:",
                  rest: "Property details, photos, address, rent, deposit, geographic coordinates",
                },
                {
                  bold: "KYC data:",
                  rest: "Government-issued ID (Aadhaar/PAN) uploaded for verification",
                },
                {
                  bold: "Communications:",
                  rest: "Chat messages, WhatsApp interactions, contact form submissions",
                },
                {
                  bold: "Reviews & ratings:",
                  rest: "Reviews you post about properties or owners",
                },
                {
                  bold: "Payment data:",
                  rest: "Billing details processed via Razorpay (we never store card details)",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    size={14}
                    className="text-success-500 flex-shrink-0 mt-1"
                  />
                  <span>
                    <strong className="text-gray-900 dark:text-slate-100">
                      {item.bold}
                    </strong>{" "}
                    {item.rest}
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Database size={16} className="text-brand-600" />
              Information collected automatically
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-slate-300">
              {[
                "IP address, browser type, device information",
                "Pages visited, time spent, referring URLs",
                "Cookies and similar tracking technologies",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    size={14}
                    className="text-success-500 flex-shrink-0 mt-1"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* How We Use It */}
          <section id="use" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                3
              </span>
              How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Create and manage your account",
                "Display property listings and enable owner-tenant communication",
                "Process payments for featured listings and subscriptions",
                "Verify user identity (KYC) and prevent fraud",
                "Send transactional emails (password resets, notifications, receipts)",
                "Improve our platform and user experience",
                "Comply with legal obligations",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <CheckCircle2
                    size={14}
                    className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Sharing */}
          <section id="share" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                4
              </span>
              Information Sharing
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-4">
              We share limited information with the following trusted third
              parties to operate the platform:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {[
                { name: "Cloudinary", purpose: "Image hosting" },
                { name: "MongoDB Atlas", purpose: "Database storage" },
                { name: "Resend", purpose: "Email delivery" },
                { name: "MSG91", purpose: "OTP via SMS" },
                { name: "Razorpay", purpose: "Payment processing" },
                { name: "Vercel", purpose: "Web hosting" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600"
                >
                  <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {s.purpose}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-success-50 dark:bg-success-900/20 border-l-4 border-success-500">
              <p className="text-sm font-semibold text-success-700 dark:text-success-300 mb-1">
                ✅ We NEVER sell your data
              </p>
              <p className="text-xs text-success-600 dark:text-success-400">
                We do not sell, rent, or trade your personal information with
                any third party for marketing purposes.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section id="cookies" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                5
              </span>
              Cookies & Tracking
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-3">
              We use the following types of cookies:
            </p>
            <div className="space-y-2">
              {[
                {
                  type: "Essential",
                  desc: "Authentication, session management (NextAuth)",
                  required: true,
                },
                {
                  type: "Preference",
                  desc: "Dark mode, language (EN/HI), last searches",
                  required: false,
                },
                {
                  type: "Analytics",
                  desc: "Anonymous usage statistics to improve the platform",
                  required: false,
                },
              ].map((c) => (
                <div
                  key={c.type}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <span
                    className={`badge ${c.required ? "badge-danger" : "badge-brand"} flex-shrink-0`}
                  >
                    {c.required ? "Required" : "Optional"}
                  </span>
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-slate-100">
                      {c.type} cookies
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {c.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data Retention */}
          <section id="retention" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                6
              </span>
              Data Retention
            </h2>
            <div className="space-y-2">
              {[
                {
                  item: "Account data",
                  period: "While account is active + 30 days after deletion",
                },
                {
                  item: "Property listings",
                  period: "Until deleted by owner or admin",
                },
                { item: "Chat messages", period: "2 years from last activity" },
                {
                  item: "Payment records",
                  period: "8 years (tax compliance requirement)",
                },
                {
                  item: "KYC documents",
                  period: "3 years after account closure",
                },
                {
                  item: "Activity logs",
                  period: "1 year (automatic deletion via TTL)",
                },
              ].map((r) => (
                <div
                  key={r.item}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {r.item}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 text-right">
                    {r.period}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Your Rights */}
          <section id="rights" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                7
              </span>
              Your Rights Under DPDP Act 2023
            </h2>
            <div className="space-y-3">
              {[
                {
                  icon: Eye,
                  title: "Right to Access",
                  desc: "Request a copy of all your personal data — download anytime from your profile.",
                },
                {
                  icon: FileText,
                  title: "Right to Correction",
                  desc: "Update or correct inaccurate information from your profile settings.",
                },
                {
                  icon: Trash2,
                  title: "Right to Erasure",
                  desc: "Delete your account and all associated data. Processed within 30 days.",
                },
                {
                  icon: Users,
                  title: "Right to Grievance Redressal",
                  desc: "File a complaint with our Grievance Officer — response within 15 days.",
                },
                {
                  icon: UserCheck,
                  title: "Right to Nominate",
                  desc: "Nominate someone to exercise your rights in case of death or incapacity.",
                },
              ].map((right) => {
                const Icon = right.icon;
                return (
                  <div
                    key={right.title}
                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                        {right.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {right.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border-l-4 border-brand-500">
              <p className="text-sm text-brand-700 dark:text-brand-300">
                <strong>How to exercise:</strong> Email{" "}
                <strong>privacy@apnaashta.in</strong>. We respond within 30 days
                as required by DPDP Act.
              </p>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                8
              </span>
              Data Security
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { title: "HTTPS encryption", desc: "All traffic encrypted" },
                { title: "Bcrypt passwords", desc: "10 rounds hashing" },
                { title: "HttpOnly cookies", desc: "XSS protection" },
                { title: "Rate limiting", desc: "API abuse prevention" },
                { title: "MongoDB encryption", desc: "At rest + in transit" },
                { title: "CSRF protection", desc: "Form tokens" },
              ].map((s) => (
                <div
                  key={s.title}
                  className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lock
                      size={12}
                      className="text-success-600 dark:text-success-400"
                    />
                    <p className="font-semibold text-xs text-success-700 dark:text-success-300">
                      {s.title}
                    </p>
                  </div>
                  <p className="text-[10px] text-success-600 dark:text-success-400">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Children */}
          <section id="children" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                9
              </span>
              Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              Our Platform is not intended for users under 18 years of age. We
              do not knowingly collect data from minors. If you believe a minor
              has created an account, please contact us at{" "}
              <strong>privacy@apnaashta.in</strong>
              and we will delete the account immediately.
            </p>
          </section>

          {/* Grievance */}
          <section id="grievance" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                10
              </span>
              Grievance Officer
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-3">
              As required by the DPDP Act and IT Rules 2021:
            </p>
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl space-y-1">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                <strong>Name:</strong> [Your Full Name]
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-1">
                <Mail size={14} />
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:grievance@apnaashta.in"
                  className="text-brand-600 dark:text-brand-400 underline"
                >
                  grievance@apnaashta.in
                </a>
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300 flex items-start gap-1">
                <MapPin size={14} className="mt-1" />
                <strong>Address:</strong> Ashta, District Sehore, Madhya Pradesh
                — 466116
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                <strong>Response Time:</strong> Acknowledge within 24 hours,
                resolve within 15 days
              </p>
            </div>
          </section>

          {/* Changes */}
          <section id="changes" className="card p-6 md:p-8 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm">
                11
              </span>
              Policy Changes
            </h2>
            <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes via email or a prominent notice on
              the Platform <strong>30 days before</strong> they take effect.
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          {/* Contact */}
          <section
            id="contact"
            className="card p-6 md:p-8 scroll-mt-24 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-800 border-2 border-brand-200 dark:border-brand-700"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center text-sm">
                12
              </span>
              Contact Us
            </h2>
            <p className="text-gray-700 dark:text-slate-300 mb-4">
              For any privacy-related questions:
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="mailto:privacy@apnaashta.in"
                className="btn btn-primary btn-sm"
              >
                <Mail size={14} /> privacy@apnaashta.in
              </a>
              <Link href="/contact" className="btn btn-secondary btn-sm">
                <ChevronRight size={14} /> Contact Form
              </Link>
              <Link href="/terms" className="btn btn-ghost btn-sm">
                <FileText size={14} /> Terms of Service
              </Link>
            </div>
          </section>

          {/* Footer Note */}
          <div className="text-center text-xs text-gray-500 dark:text-slate-400 p-4">
            This is a legal document compliant with India's DPDP Act 2023. For
            legal advice specific to your situation, please consult a qualified
            lawyer.
          </div>
        </div>
      </div>
    </article>
  );
}
