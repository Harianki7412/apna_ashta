"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

export default function NewProperty() {
  const t = useTranslations("form");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "Room",
    rent: "",
    deposit: "",
    area: "",
    address: "",
    lat: "23.0167",
    lng: "76.7167",
  });

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const toastId = toast.loading("Uploading...");
    try {
      const { urls } = await api.post<{ urls: string[] }>("/api/upload", fd);
      setImages(urls);
      toast.success("Uploaded", { id: toastId });
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/properties", { ...form, images });
      toast.success("Submitted for approval");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-3"
    >
      <h1 className="text-2xl font-bold">Add Property</h1>
      <input
        required
        placeholder={t("title")}
        className="w-full border p-2 rounded"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        required
        placeholder={t("description")}
        rows={4}
        className="w-full border p-2 rounded"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <select
        className="w-full border p-2 rounded"
        value={form.propertyType}
        onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
      >
        <option>Room</option>
        <option>Home</option>
        <option>Flat</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          required
          type="number"
          placeholder={t("rent")}
          className="border p-2 rounded"
          value={form.rent}
          onChange={(e) => setForm({ ...form, rent: e.target.value })}
        />
        <input
          type="number"
          placeholder={t("deposit")}
          className="border p-2 rounded"
          value={form.deposit}
          onChange={(e) => setForm({ ...form, deposit: e.target.value })}
        />
      </div>
      <input
        required
        placeholder={t("area")}
        className="w-full border p-2 rounded"
        value={form.area}
        onChange={(e) => setForm({ ...form, area: e.target.value })}
      />
      <input
        required
        placeholder={t("address")}
        className="w-full border p-2 rounded"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder={t("lat")}
          className="border p-2 rounded"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
        />
        <input
          placeholder={t("lng")}
          className="border p-2 rounded"
          value={form.lng}
          onChange={(e) => setForm({ ...form, lng: e.target.value })}
        />
      </div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => upload(e.target.files)}
      />
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((u) => (
            <img key={u} src={u} alt="" className="h-20 object-cover rounded" />
          ))}
        </div>
      )}
      <button
        disabled={loading || !images.length}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
