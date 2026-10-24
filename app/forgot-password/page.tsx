"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (sent)
    return (
      <p className="max-w-md mx-auto mt-12 text-center">
        Reset link sent. Check your inbox.
      </p>
    );

  return (
    <form
      onSubmit={submit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-3 mt-12"
    >
      <h1 className="text-2xl font-bold">Forgot Password</h1>
      <input
        required
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Send Reset Link
      </button>
    </form>
  );
}
