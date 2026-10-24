"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function Login() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else router.push("/");
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-3 mt-12"
    >
      <h1 className="text-2xl font-bold">{t("login")}</h1>
      <input
        required
        type="email"
        placeholder={t("email")}
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        required
        type="password"
        placeholder={t("password")}
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "..." : t("login")}
      </button>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-blue-600">
          {t("forgot")}
        </Link>
        <Link href="/register" className="text-blue-600">
          {t("register")}
        </Link>
      </div>
    </form>
  );
}
