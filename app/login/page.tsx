"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Home,
  Shield,
  Zap,
  LogIn,
  Mail,
  Phone,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  const isEmail = identifier.includes("@");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
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

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email or Phone</label>
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
                  required
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com or 9876543210"
                  className="input pl-10"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.trim())}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use email or phone you registered with
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-600 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {loading ? (
                "Signing in..."
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
