"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/auth/reset-password", { token, password });
      toast.success("Password updated");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-3 mt-12"
    >
      <h1 className="text-2xl font-bold">Set New Password</h1>
      <input
        required
        type="password"
        minLength={6}
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Update Password
      </button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetForm />
    </Suspense>
  );
}
