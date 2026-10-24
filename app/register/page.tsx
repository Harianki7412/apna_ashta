"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api-client";

export default function Register() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      toast.success("Registered! Please login.");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-3 mt-12"
    >
      <h1 className="text-2xl font-bold">{t("register")}</h1>
      <input
        required
        placeholder={t("name")}
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
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
        minLength={6}
        placeholder={t("password")}
        className="w-full border p-2 rounded"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <select
        className="w-full border p-2 rounded"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="tenant">{t("tenant")}</option>
        <option value="owner">{t("owner")}</option>
      </select>
      <button
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "..." : t("register")}
      </button>
      <Link href="/login" className="block text-center text-sm text-blue-600">
        {t("login")}
      </Link>
    </form>
  );
}
