"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
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
  Upload,
  X,
  CheckCircle2,
  Save,
  Loader2,
  Info,
  Plus,
  Building2,
  Globe,
  Navigation,
  AlertCircle,
  CircleCheck,
} from "lucide-react";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-500">
      <Loader2 className="animate-spin mr-2" size={20} />
      Loading map...
    </div>
  ),
});

interface Area {
  _id?: string;
  name: string;
  slug: string;
  type?: string;
  active?: boolean;
}

interface City {
  _id: string;
  name: string;
  slug: string;
  state: string;
  stateName: string;
  lat: number;
  lng: number;
  areas: Area[];
}

interface StateOption {
  _id: string;
  name: string;
  slug: string;
  code?: string;
  lat?: number;
  lng?: number;
}

// ═══ Validation constants ═══
const MIN_TITLE = 5;
const MIN_DESCRIPTION = 15;

export default function NewPropertyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [form, setForm] = useState({
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
    stateId: "",
    city: "",
    rent: "",
    deposit: "",
    maintenanceCharge: "",
    area: "",
    address: "",
    lat: "",
    lng: "",
  });

  // Inline add modals
  const [addCityOpen, setAddCityOpen] = useState(false);
  const [addAreaOpen, setAddAreaOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaType, setNewAreaType] = useState("area");
  const [adding, setAdding] = useState(false);

  /* ═══ Auth guard ═══ */
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

  /* ═══ Load states + cities in parallel ═══ */
  async function loadData() {
    try {
      const [statesData, citiesData] = await Promise.all([
        api.get<StateOption[]>("/api/states").catch(() => []),
        api.get<City[]>("/api/cities").catch(() => []),
      ]);
      setStates(statesData || []);
      setCities(citiesData || []);
    } catch (e) {
      toast.error("Could not load location data");
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ═══ Derived state ═══ */
  const selectedState = useMemo(
    () => states.find((s) => s._id === form.stateId),
    [form.stateId, states],
  );

  const cityData = useMemo(
    () => cities.find((c) => c.name === form.city && c.state === form.stateId),
    [form.city, form.stateId, cities],
  );

  const filteredCities = useMemo(
    () => (form.stateId ? cities.filter((c) => c.state === form.stateId) : []),
    [cities, form.stateId],
  );

  const showBhk = needsBhk(form.propertyType);

  /* ═══ Validation state ═══ */
  const titleValid = form.title.trim().length >= MIN_TITLE;
  const descValid = form.description.trim().length >= MIN_DESCRIPTION;

  const formValid =
    titleValid &&
    descValid &&
    images.length > 0 &&
    !!form.stateId &&
    !!form.city &&
    !!form.area.trim() &&
    !!form.address.trim() &&
    !!form.rent &&
    Number(form.rent) > 0 &&
    !!form.lat &&
    !!form.lng;

  /* ═══ Handlers ═══ */
  function handleStateChange(stateId: string) {
    const state = states.find((s) => s._id === stateId);
    setForm({
      ...form,
      stateId,
      city: "",
      area: "",
      lat: state?.lat ? String(state.lat) : "23.5",
      lng: state?.lng ? String(state.lng) : "78.5",
    });
  }

  function handleCityChange(cityName: string) {
    const c = cities.find(
      (x) => x.name === cityName && x.state === form.stateId,
    );
    setForm({
      ...form,
      city: cityName,
      area: "",
      lat: c?.lat ? String(c.lat) : form.lat,
      lng: c?.lng ? String(c.lng) : form.lng,
    });
  }

  /* ═══ Inline add city ═══ */
  async function handleAddCity() {
    if (!newCityName.trim()) return toast.error("City name required");
    if (!form.stateId) return toast.error("Select a state first");

    setAdding(true);
    try {
      const newCity = await api.post<any>("/api/owner/cities", {
        name: newCityName.trim(),
        stateId: form.stateId,
      });
      toast.success(`City "${newCity.name}" added!`);
      await loadData();
      setForm({
        ...form,
        city: newCity.name,
        area: "",
        lat: newCity.lat ? String(newCity.lat) : form.lat,
        lng: newCity.lng ? String(newCity.lng) : form.lng,
      });
      setAddCityOpen(false);
      setNewCityName("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  }

  /* ═══ Inline add area ═══ */
  async function handleAddArea() {
    if (!newAreaName.trim()) return toast.error("Area name required");
    if (!cityData) return toast.error("Select a city first");

    setAdding(true);
    try {
      await api.post("/api/owner/areas", {
        cityId: cityData._id,
        name: newAreaName.trim(),
        type: newAreaType,
      });
      toast.success(`Area "${newAreaName}" added!`);
      await loadData();
      setForm({ ...form, area: newAreaName.trim() });
      setAddAreaOpen(false);
      setNewAreaName("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  }

  /* ═══ Image upload ═══ */
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (images.length + files.length > 10) return toast.error("Max 10 photos");

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const t = toast.loading("Uploading...");
    setUploading(true);

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

  /* ═══ Submit ═══ */
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // ═══ Validation sequence ═══
    if (!form.title.trim()) return toast.error("Property title is required");
    if (!titleValid) {
      return toast.error(
        `Title too short — ${MIN_TITLE - form.title.trim().length} more chars needed (min ${MIN_TITLE})`,
      );
    }
    if (!form.description.trim()) return toast.error("Description is required");
    if (!descValid) {
      return toast.error(
        `Description too short — ${MIN_DESCRIPTION - form.description.trim().length} more chars needed (min ${MIN_DESCRIPTION})`,
      );
    }
    if (!images.length) return toast.error("Upload at least 1 photo");
    if (!form.stateId) return toast.error("Select a state");
    if (!form.city) return toast.error("Select a city");
    if (!form.area.trim()) return toast.error("Enter area / colony");
    if (!form.address.trim()) return toast.error("Enter full address");
    if (!form.rent || Number(form.rent) <= 0)
      return toast.error("Enter a valid monthly rent");
    if (!form.lat || !form.lng)
      return toast.error("Click on map to pin exact location");

    setLoading(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        propertyType: form.propertyType,
        furnishing: form.furnishing,
        bathrooms: Number(form.bathrooms),
        parking: form.parking,
        preferredTenants: form.preferredTenants,
        amenities: form.amenities,
        availableFrom: form.availableFrom,
        city: form.city,
        rent: Number(form.rent),
        deposit: Number(form.deposit) || 0,
        maintenanceCharge: Number(form.maintenanceCharge) || 0,
        area: form.area.trim(),
        address: form.address.trim(),
        lat: Number(form.lat),
        lng: Number(form.lng),
        images,
      };
      if (showBhk) payload.bhk = form.bhk;

      await api.post("/api/properties", payload);
      toast.success("Property submitted for approval! 🎉");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || dataLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto space-y-4">
      {/* ═══ Header ═══ */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
          <Home className="text-brand-600" size={28} />
          List Your Property
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Fill in details — admin will review within 24 hours
        </p>
      </div>

      {/* ═══ BASIC INFO ═══ */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
          <Home size={18} className="text-brand-600" /> Basic Information
        </h2>

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">
              Title <span className="text-danger-500">*</span>
            </label>
            <span
              className={`text-[10px] font-mono ${
                form.title.length === 0
                  ? "text-gray-400"
                  : !titleValid
                    ? "text-danger-600"
                    : "text-success-600"
              }`}
            >
              {form.title.length}/120
            </span>
          </div>
          <input
            required
            className={`input ${
              form.title.length > 0 && !titleValid
                ? "border-danger-500 focus:border-danger-500"
                : ""
            }`}
            placeholder="e.g. Spacious 2BHK near College Road"
            maxLength={120}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="mt-1 min-h-[18px]">
            {form.title.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                💡 Make it descriptive — include BHK + location
              </p>
            ) : !titleValid ? (
              <p className="text-xs text-danger-600 dark:text-danger-400 font-medium flex items-center gap-1">
                <AlertCircle size={11} />
                {MIN_TITLE - form.title.trim().length} more characters needed
              </p>
            ) : (
              <p className="text-xs text-success-600 dark:text-success-400 font-medium flex items-center gap-1">
                <CircleCheck size={11} /> Title looks good
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">
              Description <span className="text-danger-500">*</span>
            </label>
            <span
              className={`text-[10px] font-mono ${
                form.description.length === 0
                  ? "text-gray-400"
                  : !descValid
                    ? "text-danger-600"
                    : "text-success-600"
              }`}
            >
              {form.description.length}/2000
            </span>
          </div>
          <textarea
            required
            rows={4}
            className={`input ${
              form.description.length > 0 && !descValid
                ? "border-danger-500 focus:border-danger-500"
                : ""
            }`}
            placeholder="Describe the property, nearby amenities, special features... (minimum 15 characters)"
            maxLength={2000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="mt-1 min-h-[18px]">
            {form.description.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500">
                💡 Mention BHK, floor, parking, nearby landmarks
              </p>
            ) : !descValid ? (
              <p className="text-xs text-danger-600 dark:text-danger-400 font-medium flex items-center gap-1">
                <AlertCircle size={11} />
                {MIN_DESCRIPTION - form.description.trim().length} more
                characters needed
              </p>
            ) : (
              <p className="text-xs text-success-600 dark:text-success-400 font-medium flex items-center gap-1">
                <CircleCheck size={11} /> Description looks good
              </p>
            )}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="label">Property Type *</label>
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
                    ? "bg-brand-50 dark:bg-brand-900/30 border-brand-600"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{p.icon}</div>
                <p className="text-xs font-semibold leading-tight text-gray-900 dark:text-slate-100">
                  {p.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* BHK */}
        {showBhk && (
          <div>
            <label className="label">BHK</label>
            <div className="grid grid-cols-3 gap-2">
              {BHK_OPTIONS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setForm({ ...form, bhk: b.value })}
                  className={`p-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.bhk === b.value
                      ? "bg-brand-50 dark:bg-brand-900/30 border-brand-600 text-brand-700 dark:text-brand-300"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
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
                    ? "bg-brand-50 dark:bg-brand-900/30 border-brand-600"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                  {f.label}
                </p>
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
                  onClick={() =>
                    setForm({
                      ...form,
                      preferredTenants: selected
                        ? form.preferredTenants.filter((x) => x !== t.value)
                        : [...form.preferredTenants, t.value],
                    })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 flex items-center gap-1.5 ${
                    selected
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700"
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

      {/* ═══ LOCATION ═══ */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
          <MapPin size={18} className="text-brand-600" /> Location
        </h2>

        {/* State */}
        <div>
          <label className="label">
            State <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <Globe
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              required
              className="input pl-9"
              value={form.stateId}
              onChange={(e) => handleStateChange(e.target.value)}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                  {s.code ? ` (${s.code})` : ""}
                </option>
              ))}
            </select>
          </div>
          {states.length === 0 && (
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> No states available. Contact admin.
            </p>
          )}
        </div>

        {/* City */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">
              City <span className="text-danger-500">*</span>
            </label>
            {form.stateId && (
              <button
                type="button"
                onClick={() => setAddCityOpen(true)}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add new city
              </button>
            )}
          </div>
          <div className="relative">
            <Building2
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              required
              className="input pl-9"
              value={form.city}
              disabled={!form.stateId}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="">
                {form.stateId ? "Select City" : "Select state first"}
              </option>
              {filteredCities.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Area / Colony */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">
              Area / Colony <span className="text-danger-500">*</span>
            </label>
            {form.city && (
              <button
                type="button"
                onClick={() => setAddAreaOpen(true)}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add new area
              </button>
            )}
          </div>
          <input
            required
            list="area-options"
            className="input"
            placeholder="e.g. College Road, Gandhi Colony"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
          <datalist id="area-options">
            {(cityData?.areas || [])
              .filter((a) => a.active !== false)
              .map((a) => (
                <option key={a.slug} value={a.name} />
              ))}
          </datalist>
        </div>

        {/* Full Address */}
        <div>
          <label className="label">
            Full Address <span className="text-danger-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            className="input"
            placeholder="House no., street, landmark"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        {/* MAP PICKER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0 flex items-center gap-1.5">
              <Navigation size={14} className="text-brand-600" />
              Pin Location on Map <span className="text-danger-500">*</span>
            </label>
            {form.lat && form.lng && (
              <span className="text-[10px] text-success-600 dark:text-success-400 font-mono bg-success-50 dark:bg-success-900/20 px-2 py-0.5 rounded">
                📍 {Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}
              </span>
            )}
          </div>

          {!form.stateId ? (
            <div className="h-[320px] bg-gray-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 dark:border-slate-600">
              <MapPin size={32} className="text-gray-400 mb-2" />
              <p className="text-sm font-medium">
                Select a state to enable map
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Then click on the map to pin exact location
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-slate-700">
                <MapPicker
                  key={`${form.stateId}-${form.city}`}
                  lat={Number(form.lat) || selectedState?.lat || 23.5}
                  lng={Number(form.lng) || selectedState?.lng || 78.5}
                  onChange={(lat, lng) =>
                    setForm({
                      ...form,
                      lat: lat.toFixed(6),
                      lng: lng.toFixed(6),
                    })
                  }
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 flex items-start gap-1.5">
                <Info size={12} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Click anywhere on the map</strong> to pin the exact
                  location of your property. Zoom in for better accuracy.
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* ═══ PRICING ═══ */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-slate-100">
          <IndianRupee size={18} className="text-brand-600" /> Pricing
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="label">
              Rent (₹) <span className="text-danger-500">*</span>
            </label>
            <input
              required
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
              onChange={(e) => setForm({ ...form, deposit: e.target.value })}
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
              onChange={(e) => setForm({ ...form, parking: e.target.value })}
            >
              {PARKING_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div>
          <label className="label">Amenities</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AMENITY_OPTIONS.map((a) => {
              const checked = form.amenities.includes(a.value);
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      amenities: checked
                        ? form.amenities.filter((x) => x !== a.value)
                        : [...form.amenities, a.value],
                    })
                  }
                  className={`p-2.5 rounded-xl text-xs font-medium border-2 flex items-center gap-2 ${
                    checked
                      ? "bg-success-50 dark:bg-success-900/20 border-success-500 text-success-700 dark:text-success-300"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300"
                  }`}
                >
                  <span>{a.icon}</span>
                  <span className="flex-1 text-left">{a.value}</span>
                  {checked && <CheckCircle2 size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ PHOTOS ═══ */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center justify-between text-gray-900 dark:text-slate-100">
          <span>Photos</span>
          <span className="text-xs text-gray-500">{images.length}/10</span>
        </h2>

        {images.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {images.map((url, idx) => (
              <div
                key={url}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                {idx === 0 && (
                  <div className="absolute top-1 left-1 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    COVER
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => prev.filter((i) => i !== url))
                  }
                  className="absolute top-1 right-1 bg-black/70 hover:bg-danger-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 10 && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer border-gray-300 dark:border-slate-700 hover:border-brand-500">
            {uploading ? (
              <Loader2 size={32} className="text-brand-600 animate-spin mb-2" />
            ) : (
              <Upload size={32} className="text-gray-400 mb-2" />
            )}
            <span className="text-sm font-medium">
              {uploading ? "Uploading..." : "Click to upload photos"}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              JPG, PNG up to 5MB each
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

      {/* ═══ SUBMIT ═══ */}
      <div className="flex gap-3 justify-end sticky bottom-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading || !formValid}
          className="btn btn-primary disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Save size={16} /> Submit
            </>
          )}
        </button>
      </div>

      {/* ═══ ADD CITY MODAL ═══ */}
      {addCityOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Add New City
              </h2>
              <button
                onClick={() => setAddCityOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
              Under <strong>{selectedState?.name}</strong>
            </p>
            <input
              className="input mb-3"
              placeholder="City name (e.g. Bhopal)"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setAddCityOpen(false)}
                disabled={adding}
                className="flex-1 btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCity}
                disabled={adding || !newCityName.trim()}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}{" "}
                Add City
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD AREA MODAL ═══ */}
      {addAreaOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Add New Area
              </h2>
              <button
                onClick={() => setAddAreaOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
              In <strong>{form.city}</strong>
            </p>
            <input
              className="input mb-3"
              placeholder="Area name (e.g. Gandhi Colony)"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              autoFocus
            />
            <select
              className="input mb-3"
              value={newAreaType}
              onChange={(e) => setNewAreaType(e.target.value)}
            >
              <option value="area">Area</option>
              <option value="colony">Colony</option>
              <option value="locality">Locality</option>
              <option value="landmark">Landmark</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setAddAreaOpen(false)}
                disabled={adding}
                className="flex-1 btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddArea}
                disabled={adding || !newAreaName.trim()}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {adding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}{" "}
                Add Area
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
