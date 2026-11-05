"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import PasswordInput from "@/components/PasswordInput";
import {
  Home,
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  ShieldCheck,
  RefreshCw,
  Lock,
  Loader2,
} from "lucide-react";

type Role = "tenant" | "owner";
type Step = "role" | "details" | "otp";
type DetailsField = "name" | "email" | "password" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<DetailsField, string>>
  >({});

  const [form, setForm] = useState({
    role: "tenant" as Role,
    name: "",
    email: "",
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

  function clearFieldError(field: DetailsField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateDetails(): boolean {
    const errors: Partial<Record<DetailsField, string>> = {};
    if (form.name.trim().length < 2)
      errors.name = "Enter your full name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = "Enter a valid email address.";
    if (form.password.length < 6)
      errors.password = "Use at least 6 characters for your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function sendOtp(isResend = false) {
    if (!validateDetails()) return;

    const email = form.email.trim().toLowerCase();
    if (isResend) setResending(true);
    else setLoading(true);

    try {
      await api.post("/api/otp/send", {
        identifier: email,
        method: "email",
      });
      toast.success(`OTP sent to ${email}`);
      setStep("otp");
      setOtp("");
      setResendCountdown(30);
    } catch (e: unknown) {
      toast.error(
        e instanceof Error ? e.message : "Unable to send email verification code",
      );
    } finally {
      setLoading(false);
      setResending(false);
    }
  }

  async function verifyAndCreate() {
    if (!/^\d{6}$/.test(otp)) {
      setFieldErrors((current) => ({ ...current, otp: "Enter the 6-digit verification code." }));
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      await api.post("/api/otp/verify", {
        identifier: form.email.trim().toLowerCase(),
        method: "email",
        otp,
      });

      // Step 2: Register (server checks verification record)
      await api.post("/api/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        verifiedBy: "email",
      });

      toast.success("Account created! Please login.");
      router.push("/login");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Unable to create account");
    } finally {
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
                type="button"
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
                type="button"
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
              noValidate
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
                <label className="label" htmlFor="register-name">Full name</label>
                <input
                  id="register-name"
                  required
                  type="text"
                  autoComplete="name"
                  placeholder="Ram Kumar"
                  className={`input${fieldErrors.name ? " input-error" : ""}`}
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    clearFieldError("name");
                  }}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
                />
                {fieldErrors.name && (
                  <p id="register-name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input${fieldErrors.email ? " input-error" : ""}`}
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    clearFieldError("email");
                  }}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
                />
                {fieldErrors.email && (
                  <p id="register-email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="register-password">Password</label>
                <PasswordInput
                    id="register-password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="input"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      clearFieldError("password");
                    }}
                    invalid={Boolean(fieldErrors.password)}
                    describedBy={fieldErrors.password ? "register-password-error" : undefined}
                  />
                {fieldErrors.password && (
                  <p id="register-password-error" className="mt-1 text-sm text-red-600" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
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

              <div className="pt-2">
                <label className="label">Email verification</label>
                <p className="text-xs text-gray-500 mt-2">
                  A verification code will be sent to{" "}
                  {form.email || "your email"}.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send email verification code
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
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void verifyAndCreate();
              }}
              className="space-y-4 animate-fade-up"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={32} className="text-brand-600" />
              </div>

              <div className="text-center mb-4">
                <h2 className="text-xl font-bold mb-1">
                  Verify your email
                </h2>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit OTP to{" "}
                  <strong className="text-gray-900">
                    {form.email}
                  </strong>
                </p>
              </div>

              <div>
                <label className="label text-center" htmlFor="register-otp">Enter OTP</label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    id="register-otp"
                    required
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    className={`input text-center text-3xl tracking-[0.5em] font-bold py-4 pl-12${fieldErrors.otp ? " input-error" : ""}`}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      clearFieldError("otp");
                    }}
                    aria-invalid={Boolean(fieldErrors.otp)}
                    aria-describedby={fieldErrors.otp ? "register-otp-error" : undefined}
                    autoFocus
                  />
                </div>
                {fieldErrors.otp && (
                  <p id="register-otp-error" className="mt-1 text-center text-sm text-red-600" role="alert">
                    {fieldErrors.otp}
                  </p>
                )}
                <p className="text-xs text-gray-500 text-center mt-2">
                  OTP valid for 15 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Verifying...
                  </>
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
            </form>
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
              🔒 Email verification
            </p>
            <p className="text-xs text-brand-100">
              Verify your email address to create your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
