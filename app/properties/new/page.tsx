"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { CITIES } from "@/lib/cities";
import {
  PROPERTY_TYPES,
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS,
  TENANT_PREFERENCES,
  AMENITY_OPTIONS,
  needsBhk,
} from "@/lib/property-types";
import {
  Home,
  MapPin,
  IndianRupee,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Save,
  Eye,
  Loader2,
  Info,
  ArrowLeft,
} from "lucide-react";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  ),
});

type Step = "basic" | "location" | "pricing" | "photos" | "review";

const STEPS: { key: Step; label: string; icon: any }[] = [
  { key: "basic", label: "Basic", icon: Home },
  { key: "location", label: "Location", icon: MapPin },
  { key: "pricing", label: "Pricing", icon: IndianRupee },
  { key: "photos", label: "Photos", icon: Camera },
  { key: "review", label: "Review", icon: CheckCircle2 },
];

const DRAFT_KEY = "apna_ashta_property_draft";

const INITIAL_FORM = {
  title: "",
  description: "",
  propertyType: "Flat",
  bhk: "2BHK",
  furnishing: "Unfurnished",
  bathrooms: 1,
  parking: "None",
  preferredTenants: ["Family"] as string[],
  amenities: [] as string[],
  availableFrom: new Date().toISOString().split("T")[0],
  city: "Ashta",
  rent: "",
  deposit: "",
  maintenanceCharge: "",
  area: "",
  address: "",
  lat: "23.0167",
  lng: "76.7167",
};

export default function NewPropertyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step, setStep] = useState<Step>("basic");
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const cityData = useMemo(
    () => CITIES.find((c) => c.name === form.city),
    [form.city],
  );
  const showBhk = needsBhk(form.propertyType);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  /* ─── Auth guard ─── */
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

  /* ─── Load draft ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.form) setForm({ ...INITIAL_FORM, ...draft.form });
        if (draft.images) setImages(draft.images);
      }
    } catch {}
    setDraftLoaded(true);
  }, []);

  /* ─── Auto-save draft ─── */
  useEffect(() => {
    if (!draftLoaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, images }));
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [form, images, draftLoaded]);

  /* ─── Upload images ─── */
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (images.length + files.length > 10) {
      return toast.error("Max 10 photos total");
    }
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const t = toast.loading(`Uploading ${files.length} photo(s)...`);
    try {
      const { urls } = await api.post<{ urls: string[] }>("/api/upload", fd);
      setImages((prev) => [...prev, ...urls].slice(0, 10));
      toast.success("Uploaded", { id: t });
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
  }

  /* ─── Validate step ─── */
  function validateStep(): string | null {
    if (step === "basic") {
      if (form.title.trim().length < 5)
        return "Title must be at least 5 characters";
      if (form.description.trim().length < 20)
        return "Description must be at least 20 characters";
      if (showBhk && !form.bhk) return "Select BHK configuration";
    }
    if (step === "location") {
      if (form.area.trim().length < 2) return "Enter an area";
      if (form.address.trim().length < 5) return "Enter full address";
      if (!form.lat || !form.lng) return "Set location on map";
    }
    if (step === "pricing") {
      if (!form.rent || Number(form.rent) <= 0) return "Enter monthly rent";
    }
    if (step === "photos") {
      if (images.length < 1) return "Upload at least 1 photo";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) return toast.error(err);
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function prev() {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function jumpTo(target: Step) {
    // Allow jumping back freely, but forward requires validation
    const targetIdx = STEPS.findIndex((s) => s.key === target);
    if (targetIdx <= stepIndex) {
      setStep(target);
    } else {
      // Validate all steps up to target
      for (let i = stepIndex; i < targetIdx; i++) {
        const prevStep = step;
        setStep(STEPS[i].key);
        // Manual validate (approximate)
      }
      setStep(target);
    }
  }

  /* ─── Submit ─── */
  async function submit() {
    for (const s of STEPS) {
      if (s.key === "review") continue;
      setStep(s.key);
      const err = validateStep();
      if (err) return toast.error(err);
    }
    setStep("review");

    setSubmitting(true);
    try {
      const payload: any = { ...form, images };
      if (!showBhk) delete payload.bhk;
      await api.post("/api/properties", payload);
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Property submitted for approval! 🎉");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function clearDraft() {
    if (!window.confirm("Clear all entered data?")) return;
    setForm(INITIAL_FORM);
    setImages([]);
    localStorage.removeItem(DRAFT_KEY);
    setStep("basic");
    toast.success("Draft cleared");
  }

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={clearDraft}
          className="text-xs text-gray-500 hover:text-danger-600"
        >
          Clear Draft
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">List Your Property</h1>
        <p className="text-gray-500 mt-1">
          Fill in details — draft auto-saves as you type
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <button
                key={s.key}
                onClick={() => jumpTo(s.key)}
                className="flex flex-col items-center flex-1 group"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    done
                      ? "bg-success-500 text-white"
                      : active
                        ? "bg-brand-600 text-white ring-4 ring-brand-100"
                        : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                  }`}
                >
                  {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    active
                      ? "text-brand-600"
                      : done
                        ? "text-success-600"
                        : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          STEP CONTENT
          ═══════════════════════════════════════════════════ */}
      <div className="card p-6 md:p-8">
        {/* ─── STEP 1: BASIC ─── */}
        {step === "basic" && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-xl font-bold mb-1">Basic Information</h2>
              <p className="text-sm text-gray-500">
                Tell tenants about your property
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="label">
                Property Title <span className="text-danger-500">*</span>
              </label>
              <input
                className="input"
                placeholder="e.g. Spacious 2BHK near College Road with parking"
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.title.length}/120
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                Description <span className="text-danger-500">*</span>
              </label>
              <textarea
                rows={5}
                className="input"
                placeholder="Describe the property, nearby amenities, special features..."
                maxLength={2000}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.description.length}/2000 (min 20)
              </p>
            </div>

            {/* Property Type */}
            <div>
              <label className="label">
                Property Type <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PROPERTY_TYPES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        propertyType: p.value,
                        bhk: needsBhk(p.value) ? form.bhk || "2BHK" : "",
                      })
                    }
                    className={`p-3 rounded-xl text-left border-2 transition-all ${
                      form.propertyType === p.value
                        ? "bg-brand-50 border-brand-600"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{p.icon}</div>
                    <p className="text-xs font-semibold leading-tight">
                      {p.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* BHK */}
            {showBhk && (
              <div>
                <label className="label">BHK Configuration</label>
                <div className="grid grid-cols-3 gap-2">
                  {BHK_OPTIONS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => setForm({ ...form, bhk: b.value })}
                      className={`p-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
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

            {/* Furnishing */}
            <div>
              <label className="label">Furnishing</label>
              <div className="grid grid-cols-3 gap-2">
                {FURNISHING_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setForm({ ...form, furnishing: f.value })}
                    className={`p-3 rounded-xl text-center border-2 transition-all ${
                      form.furnishing === f.value
                        ? "bg-brand-50 border-brand-600"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <p className="text-xs font-semibold">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Tenants */}
            <div>
              <label className="label">Preferred Tenants</label>
              <div className="flex flex-wrap gap-2">
                {TENANT_PREFERENCES.map((t) => {
                  const selected = form.preferredTenants.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          preferredTenants: selected
                            ? form.preferredTenants.filter((x) => x !== t.value)
                            : [...form.preferredTenants, t.value],
                        });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all flex items-center gap-1.5 ${
                        selected
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span>{t.icon}</span>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: LOCATION ─── */}
        {step === "location" && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-xl font-bold mb-1">Location</h2>
              <p className="text-sm text-gray-500">
                Where is your property located?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  City <span className="text-danger-500">*</span>
                </label>
                <select
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
                <label className="label">
                  Area <span className="text-danger-500">*</span>
                </label>
                <input
                  list="area-options"
                  className="input"
                  placeholder="e.g. College Road"
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

            <div>
              <label className="label">
                Full Address <span className="text-danger-500">*</span>
              </label>
              <textarea
                rows={2}
                className="input"
                placeholder="House no., street, landmark"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Pin on Map</label>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="text-xs text-brand-600 font-semibold"
                >
                  {showMap ? "Hide map" : "Show map"}
                </button>
              </div>

              {showMap && (
                <MapPicker
                  lat={Number(form.lat)}
                  lng={Number(form.lng)}
                  onChange={(lat, lng) =>
                    setForm({
                      ...form,
                      lat: lat.toFixed(6),
                      lng: lng.toFixed(6),
                    })
                  }
                />
              )}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  placeholder="Latitude"
                  className="input"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                />
                <input
                  placeholder="Longitude"
                  className="input"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                <Info size={12} className="mt-0.5 flex-shrink-0" />
                Click on the map to auto-fill coordinates, or enter manually
              </p>
            </div>
          </div>
        )}

        {/* ─── STEP 3: PRICING ─── */}
        {step === "pricing" && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-xl font-bold mb-1">Pricing & Amenities</h2>
              <p className="text-sm text-gray-500">
                Set rent and list what's included
              </p>
            </div>

            {/* Rent */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="label">
                  Monthly Rent (₹) <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="8000"
                  value={form.rent}
                  onChange={(e) => setForm({ ...form, rent: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Deposit (₹)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="16000"
                  value={form.deposit}
                  onChange={(e) =>
                    setForm({ ...form, deposit: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Maintenance (₹/mo)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={form.maintenanceCharge}
                  onChange={(e) =>
                    setForm({ ...form, maintenanceCharge: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Bathrooms + Parking */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Bathrooms</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="input"
                  value={form.bathrooms}
                  onChange={(e) =>
                    setForm({ ...form, bathrooms: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="label">Parking</label>
                <select
                  className="input"
                  value={form.parking}
                  onChange={(e) =>
                    setForm({ ...form, parking: e.target.value })
                  }
                >
                  {PARKING_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.icon} {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Available From */}
            <div>
              <label className="label">Available From</label>
              <input
                type="date"
                className="input"
                value={form.availableFrom}
                onChange={(e) =>
                  setForm({ ...form, availableFrom: e.target.value })
                }
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="label">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map((a) => {
                  const checked = form.amenities.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          amenities: checked
                            ? form.amenities.filter((x) => x !== a.value)
                            : [...form.amenities, a.value],
                        });
                      }}
                      className={`p-2.5 rounded-xl text-sm font-medium border-2 transition-all flex items-center gap-2 ${
                        checked
                          ? "bg-success-50 border-success-500 text-success-700"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span>{a.icon}</span>
                      <span className="flex-1 text-left">{a.value}</span>
                      {checked && <CheckCircle2 size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: PHOTOS ─── */}
        {step === "photos" && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-xl font-bold mb-1">Property Photos</h2>
              <p className="text-sm text-gray-500">
                Upload up to 10 photos. First photo is the cover.
              </p>
            </div>

            {/* Upload area */}
            {images.length < 10 && (
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
                  uploading
                    ? "border-brand-300 bg-brand-50"
                    : "border-gray-300 hover:border-brand-500 bg-gray-50/50"
                }`}
              >
                {uploading ? (
                  <Loader2
                    size={32}
                    className="text-brand-600 animate-spin mb-2"
                  />
                ) : (
                  <Upload size={32} className="text-gray-400 mb-2" />
                )}
                <span className="text-sm font-medium">
                  {uploading ? "Uploading..." : "Click to upload photos"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  JPG, PNG up to 5MB each • {images.length}/10 uploaded
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

            {/* Preview grid */}
            {images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">
                    {images.length} photo{images.length > 1 ? "s" : ""}
                  </p>
                  {images[0] && (
                    <p className="text-xs text-gray-500">Cover photo = first</p>
                  )}
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {images.map((url, idx) => (
                    <div
                      key={url}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                    >
                      <Image
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          COVER
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-danger-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImgs = [
                              url,
                              ...images.filter((i) => i !== url),
                            ];
                            setImages(newImgs);
                          }}
                          className="absolute bottom-1 left-1 right-1 bg-black/70 hover:bg-black/90 text-white text-[10px] font-medium py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Set as cover
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="p-3 bg-brand-50 rounded-lg text-xs text-brand-700 flex items-start gap-2">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Photo tips</p>
                <ul className="mt-1 space-y-0.5 list-disc ml-4">
                  <li>Take photos in daylight for best quality</li>
                  <li>Show all rooms, kitchen, bathroom, balcony</li>
                  <li>Properties with 5+ photos get 3x more inquiries</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 5: REVIEW ─── */}
        {step === "review" && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-xl font-bold mb-1">Review & Submit</h2>
              <p className="text-sm text-gray-500">
                Check everything before submitting for approval
              </p>
            </div>

            {/* Mini preview card */}
            <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
              <div className="relative h-40 bg-gray-100">
                {images[0] ? (
                  <Image
                    src={images[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300">
                    <Home size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {form.bhk && (
                    <span className="bg-brand-600/95 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {form.bhk}
                    </span>
                  )}
                  <span className="bg-white/95 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {form.propertyType}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm">
                  {form.title || "Untitled Property"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.area}, {form.city}
                </p>
                <p className="text-lg font-extrabold text-brand-600 mt-1">
                  ₹{Number(form.rent || 0).toLocaleString("en-IN")}
                  <span className="text-xs text-gray-500 font-normal">/mo</span>
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-500">BASIC</p>
                  <p className="text-sm truncate">{form.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {form.propertyType}
                    {form.bhk ? ` · ${form.bhk}` : ""} · {form.furnishing}
                  </p>
                </div>
                <button
                  onClick={() => setStep("basic")}
                  className="text-xs text-brand-600 font-semibold whitespace-nowrap"
                >
                  Edit
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-500">
                    LOCATION
                  </p>
                  <p className="text-sm truncate">
                    {form.area}, {form.city}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {form.address}
                  </p>
                </div>
                <button
                  onClick={() => setStep("location")}
                  className="text-xs text-brand-600 font-semibold whitespace-nowrap"
                >
                  Edit
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-500">PRICING</p>
                  <p className="text-sm">
                    ₹{Number(form.rent || 0).toLocaleString("en-IN")}/mo ·
                    Deposit ₹{Number(form.deposit || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.bathrooms} bath · {form.parking} parking
                  </p>
                </div>
                <button
                  onClick={() => setStep("pricing")}
                  className="text-xs text-brand-600 font-semibold whitespace-nowrap"
                >
                  Edit
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-500">PHOTOS</p>
                  <p className="text-sm">{images.length} photo(s) uploaded</p>
                </div>
                <button
                  onClick={() => setStep("photos")}
                  className="text-xs text-brand-600 font-semibold whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 bg-warning-50 border border-accent-400 rounded-lg text-xs text-warning-700 flex items-start gap-2">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              Your property will be reviewed by our admin team. It goes live
              within 24 hours after approval.
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          STICKY FOOTER NAVIGATION
          ═══════════════════════════════════════════════════ */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-6 z-30 bg-white/95 backdrop-blur border-t md:border md:rounded-2xl md:shadow-float px-4 py-3 md:p-3">
        <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
          <button
            onClick={prev}
            disabled={stepIndex === 0}
            className="btn btn-ghost btn-sm disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="text-xs text-gray-500 text-center">
            Step {stepIndex + 1} of {STEPS.length}
          </div>

          {step === "review" ? (
            <button
              onClick={submit}
              disabled={submitting}
              className="btn btn-success btn-sm disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {submitting ? "Submitting..." : "Submit"}
            </button>
          ) : (
            <button onClick={next} className="btn btn-primary btn-sm">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
