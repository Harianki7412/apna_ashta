"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";
import { CITIES } from "@/lib/cities";
import { PROPERTY_TYPES, BHK_OPTIONS, needsBhk } from "@/lib/property-types";

export default function NewProperty() {
  const t = useTranslations("form");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
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
    lat: "23.0167",
    lng: "76.7167",
  });

  const cityData = useMemo(
    () => CITIES.find((c) => c.name === form.city),
    [form.city],
  );
  const showBhk = needsBhk(form.propertyType);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/properties/new");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (!["owner", "admin"].includes(role)) {
        toast.error("Only owners can add properties");
        router.push("/");
      }
    }
  }, [status, session, router]);

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
      const payload: any = { ...form, images };
      if (!showBhk) delete payload.bhk;
      await api.post("/api/properties", payload);
      toast.success("Submitted for approval");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
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
        className="input"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        required
        placeholder={t("description")}
        rows={4}
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">City</label>
          <select
            required
            className="input"
            value={form.city}
            onChange={(e) => {
              const c = CITIES.find((x) => x.name === e.target.value);
              setForm({
                ...form,
                city: e.target.value,
                area: "",
                lat: String(c?.lat || form.lat),
                lng: String(c?.lng || form.lng),
              });
            }}
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
            list="area-options"
            placeholder="e.g. College Road"
            className="input"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
          <datalist id="area-options">
            {cityData?.areas.map((a) => (
              <option key={a.slug} value={a.name} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          required
          type="number"
          placeholder={t("rent")}
          className="input"
          value={form.rent}
          onChange={(e) => setForm({ ...form, rent: e.target.value })}
        />
        <input
          type="number"
          placeholder={t("deposit")}
          className="input"
          value={form.deposit}
          onChange={(e) => setForm({ ...form, deposit: e.target.value })}
        />
      </div>
      <input
        required
        placeholder={t("address")}
        className="input"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder={t("lat")}
          className="input"
          value={form.lat}
          onChange={(e) => setForm({ ...form, lat: e.target.value })}
        />
        <input
          placeholder={t("lng")}
          className="input"
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
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
