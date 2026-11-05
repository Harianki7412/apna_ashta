"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Home,
  Shield,
  Zap,
  LogIn,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCallback = searchParams.get("callbackUrl") || "/";
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const isEmail = identifier.includes("@");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedIdentifier = identifier.trim();
    const nextIdentifierError =
      !trimmedIdentifier
        ? "Enter the email address or phone number on your account."
        : trimmedIdentifier.includes("@") &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier)
          ? "Enter a valid email address."
          : "";
    const nextPasswordError = password ? "" : "Enter your password.";

    setIdentifierError(nextIdentifierError);
    setPasswordError(nextPasswordError);
    setSubmitError("");
    if (nextIdentifierError || nextPasswordError) return;

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: trimmedIdentifier,
        password,
        redirect: false,
      });
      if (res?.error) {
        const message =
          res.error === "CredentialsSignin"
            ? "Email/phone or password is incorrect."
            : res.error;
        setSubmitError(message);
        toast.error(message);
      } else if (res?.ok) {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      } else {
        const message = "Unable to sign in. Please try again.";
        setSubmitError(message);
        toast.error(message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-2 -mx-4 -my-4">
      <div className="flex items-center justify-center p-6 md:p-12">
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

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Login to continue</p>

          {callbackUrl !== "/" && (
            <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-lg text-sm text-brand-700">
              🔒 Please login to access that page.
            </div>
          )}

          <form onSubmit={submit} noValidate className="space-y-4">
            {submitError && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {submitError}
              </p>
            )}
            <div>
              <label className="label" htmlFor="login-identifier">
                Email or phone
              </label>
              <div className="relative">
                {isEmail ? (
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                ) : (
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                )}
                <input
                  id="login-identifier"
                  required
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com or 9876543210"
                  className={`input pl-10${identifierError ? " input-error" : ""}`}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setIdentifierError("");
                    setSubmitError("");
                  }}
                  aria-invalid={Boolean(identifierError)}
                  aria-describedby={
                    identifierError ? "login-identifier-error" : "login-identifier-hint"
                  }
                />
              </div>
              {identifierError ? (
                <p id="login-identifier-error" className="mt-1 text-sm text-red-600" role="alert">
                  {identifierError}
                </p>
              ) : (
                <p id="login-identifier-hint" className="text-xs text-gray-500 mt-1">
                Use email or phone you registered with
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="label mb-0" htmlFor="login-password">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-600 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <PasswordInput
                  id="login-password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                    setSubmitError("");
                  }}
                  invalid={Boolean(passwordError)}
                  describedBy={passwordError ? "login-password-error" : undefined}
                />
              {passwordError && (
                <p id="login-password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-brand-600 font-semibold">
              Create one
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white relative overflow-hidden">
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
            Find your next home
          </h2>
          <p className="text-brand-100 mb-8">
            Login with your email or phone — whichever you used.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="mt-1" />
              <div>
                <p className="font-semibold">100% Verified</p>
                <p className="text-sm text-brand-100">
                  Admin reviewed listings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap size={20} className="mt-1" />
              <div>
                <p className="font-semibold">Direct Contact</p>
                <p className="text-sm text-brand-100">No middlemen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-gray-500">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
