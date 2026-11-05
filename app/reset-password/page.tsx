"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setSubmitError("This reset link is invalid. Request a new one to continue.");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Use at least 6 characters for your password.");
      return;
    }

    setPasswordError("");
    setSubmitError("");
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to update your password. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 mt-12"
    >
      <Link href="/forgot-password" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Request another link
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-gray-500">Choose a password with at least 6 characters.</p>
      </div>
      {!token && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          This reset link is invalid or missing. Request a new one to continue.
        </p>
      )}
      {submitError && token && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}
      <div>
        <label className="label" htmlFor="reset-password">New password</label>
        <PasswordInput
          id="reset-password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError("");
            setSubmitError("");
          }}
          invalid={Boolean(passwordError)}
          describedBy={passwordError ? "reset-password-error" : undefined}
        />
        {passwordError && (
          <p id="reset-password-error" className="mt-1 text-sm text-red-600" role="alert">
            {passwordError}
          </p>
        )}
      </div>
      <button type="submit" disabled={loading || !token} className="btn btn-primary w-full">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Updating password...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} aria-hidden="true" />
            Update password
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<p className="text-center mt-12">Loading...</p>}>
      <ResetForm />
    </Suspense>
  );
}
