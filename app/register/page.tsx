"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  Eye,
  EyeOff,
  Home,
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  RefreshCw,
  Lock,
} from "lucide-react";

type Role = "tenant" | "owner";
type VerifyMethod = "email" | "phone";
type Step = "role" | "details" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [method, setMethod] = useState<VerifyMethod>("email");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [form, setForm] = useState({
    role: "tenant" as Role,
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setInterval(
      () => setResendCountdown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [resendCountdown]);

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 4);
  })();
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-danger-500",
    "bg-warning-500",
    "bg-accent-500",
    "bg-success-500",
  ];

  function validateDetails(): string | null {
    if (form.name.trim().length < 2) return "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email";
    if (!/^\d{10}$/.test(form.phone)) return "Enter a valid 10-digit phone";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    return null;
  }

  function getIdentifier(): string {
    return method === "email" ? form.email.toLowerCase() : form.phone;
  }

  async function sendOtp(isResend = false) {
    const err = validateDetails();
    if (err) return toast.error(err);

    if (isResend) setResending(true);
    else setLoading(true);

    try {
      await api.post("/api/otp/send", {
        identifier: getIdentifier(),
        method,
      });
      toast.success(
        method === "email"
          ? `OTP sent to ${form.email}`
          : `OTP sent to +91 ${form.phone}`,
      );
      setStep("otp");
      setOtp("");
      setResendCountdown(30);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setResending(false);
    }
  }

  async function verifyAndCreate() {
    if (!/^\d{6}$/.test(otp)) return toast.error("Enter 6-digit OTP");

    setLoading(true);
    try {
      // Step 1: Verify OTP
      await api.post("/api/otp/verify", {
        identifier: getIdentifier(),
        method,
        otp,
      });

      // Step 2: Register (server checks verification record)
      await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        verifiedBy: method,
      });

      toast.success("Account created! Please login.");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-2 -mx-4 -my-4">
      {/* ═══ Left: Form ═══ */}
      <div className="flex items-center justify-center p-6 md:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-lg text-brand-600 mb-8 lg:hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            Flatova
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create account</h1>
          <p className="text-gray-500 mb-8">Join Flatova in under a minute</p>

          {/* ═══ Step 1: Role ═══ */}
          {step === "role" && (
            <div className="space-y-4 animate-fade-up">
              <p className="text-sm font-medium text-gray-700 mb-3">
                How will you use Flatova?
              </p>

              <button
                onClick={() => {
                  setForm({ ...form, role: "tenant" });
                  setStep("details");
                }}
                className="w-full card p-4 text-left hover:border-brand-300 hover:bg-brand-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <User size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">I want to rent</p>
                    <p className="text-sm text-gray-500">
                      Browse and connect with owners
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </button>

              <button
                onClick={() => {
                  setForm({ ...form, role: "owner" });
                  setStep("details");
                }}
                className="w-full card p-4 text-left hover:border-brand-300 hover:bg-brand-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Building2 size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">I have a property</p>
                    <p className="text-sm text-gray-500">
                      List and find tenants
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </button>

              <div className="mt-6 text-center text-sm text-gray-500">
                Already have?{" "}
                <Link href="/login" className="text-brand-600 font-semibold">
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* ═══ Step 2: Details ═══ */}
          {step === "details" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp(false);
              }}
              className="space-y-4 animate-fade-up"
            >
              <div className="flex items-center gap-2 mb-2 text-sm">
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-brand-600 font-medium flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Role
                </button>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600 capitalize">
                  {form.role === "owner" ? "Property Owner" : "Tenant"}
                </span>
              </div>

              <div>
                <label className="label">Full name</label>
                <input
                  required
                  type="text"
                  autoComplete="name"
                  placeholder="Ram Kumar"
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Phone number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 border border-gray-200">
                    +91
                  </span>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="9876543210"
                    className="input flex-1"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="input pr-10"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Strength: {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* ═══ Verification Method Selector ═══ */}
              <div className="pt-2">
                <label className="label">Verify with</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod("email")}
                    className={`p-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                      method === "email"
                        ? "bg-brand-50 border-brand-600 text-brand-700"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Mail size={16} /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("phone")}
                    className={`p-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                      method === "phone"
                        ? "bg-brand-50 border-brand-600 text-brand-700"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Phone size={16} /> Phone (SMS)
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {method === "email"
                    ? `OTP will be sent to ${form.email || "your email"}`
                    : `OTP will be sent to +91 ${form.phone || "your phone"}`}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full mt-2"
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    {method === "email" ? (
                      <Mail size={16} />
                    ) : (
                      <Phone size={16} />
                    )}
                    Send OTP via {method === "email" ? "Email" : "SMS"}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-brand-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-brand-600 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}

          {/* ═══ Step 3: OTP ═══ */}
          {step === "otp" && (
            <div className="space-y-4 animate-fade-up">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={32} className="text-brand-600" />
              </div>

              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-1">
                  Verify your {method === "email" ? "email" : "phone"}
                </h2>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit OTP to{" "}
                  <strong className="text-gray-900">
                    {method === "email" ? form.email : `+91 ${form.phone}`}
                  </strong>
                </p>
              </div>

              <div>
                <label className="label text-center">Enter OTP</label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    className="input text-center text-3xl tracking-[0.5em] font-bold py-4 pl-12"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  OTP valid for 15 minutes
                </p>
              </div>

              <button
                onClick={verifyAndCreate}
                disabled={loading || otp.length !== 6}
                className="btn btn-primary btn-lg w-full disabled:opacity-50"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Verify & Create Account
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="text-gray-600 hover:text-brand-600 flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Change details
                </button>

                <button
                  type="button"
                  onClick={() => sendOtp(true)}
                  disabled={resendCountdown > 0 || resending}
                  className="text-brand-600 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    size={14}
                    className={resending ? "animate-spin" : ""}
                  />
                  {resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : resending
                      ? "Sending..."
                      : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Right: Gradient panel ═══ */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-md">
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-2xl text-white mb-12"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            Flatova
          </Link>

          <h2 className="text-3xl font-bold mb-4 text-white">
            {form.role === "owner"
              ? "List your property in minutes"
              : "Find your perfect home today"}
          </h2>
          <p className="text-brand-100 mb-8">
            {form.role === "owner"
              ? "Reach thousands of verified tenants across Ashta, Kothri, and Sehore."
              : "Browse 100+ verified rentals and connect directly with owners."}
          </p>

          <div className="space-y-3">
            {(form.role === "owner"
              ? [
                  "Free listing, no commission",
                  "Chat with genuine tenants",
                  "Verified badge",
                  "Rent agreement generator",
                ]
              : [
                  "100% verified properties",
                  "Direct chat with owners",
                  "Save favorites",
                  "Rent agreement generator",
                ]
            ).map((p) => (
              <div key={p} className="flex items-center gap-2">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span className="text-sm">{p}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 bg-white/10 rounded-xl backdrop-blur border border-white/20">
            <p className="text-sm font-semibold mb-1">
              🔒 Flexible Verification
            </p>
            <p className="text-xs text-brand-100">
              Verify with email OR phone — your choice. Login with either one
              later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
