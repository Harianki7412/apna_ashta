"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError(
        normalizedEmail
          ? "Enter a valid email address."
          : "Enter the email address linked to your account.",
      );
      return;
    }

    setEmailError("");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email: normalizedEmail });
      setSent(true);
      toast.success("If an account exists, a reset link will be sent shortly.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send a reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent)
    return (
      <section
        className="max-w-md mx-auto mt-12 rounded-2xl border border-green-200 bg-green-50 p-6 text-center"
        aria-live="polite"
      >
        <CheckCircle2 size={32} className="mx-auto mb-3 text-green-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-sm text-gray-600">
          If an account exists for <strong>{email.trim()}</strong>, we’ll send a
          password reset link shortly. Check your spam folder too.
        </p>
        <Link href="/login" className="btn btn-primary mt-5 w-full">
          Back to sign in
        </Link>
      </section>
    );

  return (
    <form
      onSubmit={submit}
      noValidate
      className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 mt-12"
    >
      <Link href="/login" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we’ll send instructions to reset your password.
        </p>
      </div>
      <label className="label" htmlFor="forgot-email">Email address</label>
      <input
        id="forgot-email"
        required
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        className={`input${emailError ? " input-error" : ""}`}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError("");
        }}
        aria-invalid={Boolean(emailError)}
        aria-describedby={emailError ? "forgot-email-error" : undefined}
      />
      {emailError && (
        <p id="forgot-email-error" className="text-sm text-red-600" role="alert">
          {emailError}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Sending reset link...
          </>
        ) : (
          <>
            <Mail size={18} aria-hidden="true" />
            Send reset link
          </>
        )}
      </button>
    </form>
  );
}
