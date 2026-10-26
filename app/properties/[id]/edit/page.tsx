"use client";
import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { CITIES } from "@/lib/cities";
import { PROPERTY_TYPES, BHK_OPTIONS, needsBhk } from "@/lib/property-types";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  MapPin,
  IndianRupee,
  Home,
} from "lucide-react";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "Flat",
    bhk: "2BHK",
    city: "Ashta",
    rent: "",
    deposit: "",
    area: "",
    address: "",
    lat: "",
    lng: "",
  });

  const cityData = useMemo(
    () => CITIES.find((c) => c.name === form.city),
    [form.city],
  );
  const showBhk = needsBhk(form.propertyType);

  useEffect(() => {
    api
      .get<any>(`/api/properties/${id}`)
      .then((data) => {
        setForm({
          title: data.title || "",
          description: data.description || "",
          propertyType: data.propertyType || "Flat",
          bhk: data.bhk || "2BHK",
          city: data.city || "Ashta",
          rent: String(data.rent || ""),
          deposit: String(data.deposit || ""),
          area: data.area || "",
          address: data.address || "",
          lat: String(data.location?.coordinates?.[1] || ""),
          lng: String(data.location?.coordinates?.[0] || ""),
        });
        setImages(data.images || []);
      })
      .catch((e) => {
        toast.error(e.message);
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const { urls } = await api.post<{ urls: string[] }>("/api/upload", fd);
      setImages((prev) => [...prev, ...urls].slice(0, 10));
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!images.length) return toast.error("At least 1 image required");
    setSaving(true);
    try {
      const payload: any = { ...form, images };
      if (!showBhk) delete payload.bhk;
      await api.patch(`/api/properties/${id}`, payload);
      toast.success("Updated! Pending re-approval.");
      router.push(`/properties/${id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="max-w-3xl mx-auto">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/properties/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 mb-4"
      >
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-3xl font-bold mb-6">Edit Property</h1>
      <form onSubmit={submit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Home size={18} className="text-brand-600" /> Basic
          </h2>
          <input
            required
            placeholder="Title"
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            required
            rows={4}
            placeholder="Description"
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div>
            <label className="label">Property Type</label>
            <select
              required
              className="input"
              value={form.propertyType}
              onChange={(e) =>
                setForm({
                  ...form,
                  propertyType: e.target.value,
                  bhk: needsBhk(e.target.value) ? form.bhk || "2BHK" : "",
                })
              }
            >
              {PROPERTY_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>

          {showBhk && (
            <div>
              <label className="label">BHK Configuration</label>
              <div className="grid grid-cols-3 gap-2">
                {BHK_OPTIONS.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setForm({ ...form, bhk: b.value })}
                    className={`p-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.bhk === b.value
                        ? "bg-brand-50 border-brand-600 text-brand-700"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin size={18} className="text-brand-600" /> Location
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <select
                required
                className="input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                {CITIES.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Area</label>
              <input
                required
                list="edit-area-options"
                placeholder="e.g. College Road"
                className="input"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
              />
              <datalist id="edit-area-options">
                {cityData?.areas.map((a) => (
                  <option key={a.slug} value={a.name} />
                ))}
              </datalist>
            </div>
          </div>
          <input
            required
            placeholder="Address"
            className="input"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Lat"
              className="input"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
            />
            <input
              placeholder="Lng"
              className="input"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
            />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <IndianRupee size={18} className="text-brand-600" /> Pricing
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              placeholder="Rent"
              className="input"
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: e.target.value })}
            />
            <input
              type="number"
              placeholder="Deposit"
              className="input"
              value={form.deposit}
              onChange={(e) => setForm({ ...form, deposit: e.target.value })}
            />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold">Photos ({images.length}/10)</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {images.map((url) => (
              <div
                key={url}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <button
                  type="button"
                  onClick={() => setImages((p) => p.filter((i) => i !== url))}
                  className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          {images.length < 10 && (
            <label className="flex flex-col items-center border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-xl p-8 cursor-pointer">
              <Upload size={32} className="text-gray-400 mb-2" />
              <span className="text-sm font-medium">
                {uploading ? "Uploading..." : "Click to upload"}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => upload(e.target.files)}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card p-6 border-danger-200 mt-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-danger-600 mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Permanently delete this property and all its data (photos, chats,
            reviews). This action cannot be undone.
          </p>
          <DeletePropertyButton
            propertyId={id}
            propertyTitle={form.title}
            variant="danger"
            redirectTo="/dashboard"
          />
        </div>
      </form>
    </div>
  );
}
