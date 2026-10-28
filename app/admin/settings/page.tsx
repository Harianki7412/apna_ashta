"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  Save,
  Loader2,
  Settings,
  Globe,
  FileText,
  Zap,
  Star,
} from "lucide-react";

const FIELDS = [
  {
    key: "agreementPrice",
    label: "Rent Agreement Price (₹)",
    type: "number",
    icon: FileText,
    group: "Services",
  },
  {
    key: "agreementSplitPrice",
    label: "Agreement Split Price (₹ per party)",
    type: "number",
    icon: FileText,
    group: "Services",
  },
  {
    key: "freeLeadsPerProperty",
    label: "Free Leads per Property",
    type: "number",
    icon: Zap,
    group: "Limits",
  },
  {
    key: "siteName",
    label: "Site Name",
    type: "text",
    icon: Globe,
    group: "General",
  },
  {
    key: "supportEmail",
    label: "Support Email",
    type: "email",
    icon: Globe,
    group: "General",
  },
  {
    key: "supportPhone",
    label: "Support Phone",
    type: "text",
    icon: Globe,
    group: "General",
  },
];

const TOGGLES = [
  { key: "enableSubscriptions", label: "Enable Subscriptions", icon: Settings },
  { key: "enableLeadPacks", label: "Enable Lead Packs", icon: Zap },
  {
    key: "enableFeaturedListings",
    label: "Enable Featured Listings",
    icon: Star,
  },
  {
    key: "enableRentAgreement",
    label: "Enable Rent Agreement Service",
    icon: FileText,
  },
];

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/admin/settings");
    else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "admin"
    ) {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.role !== "admin")
      return;
    api
      .get<any>("/api/admin/settings")
      .then(setSettings)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [status, session]);

  async function save() {
    setSaving(true);
    try {
      const updated = await api.patch<any>("/api/admin/settings", settings);
      setSettings(updated);
      toast.success("Settings saved");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  const groups = FIELDS.reduce((acc: any, f) => {
    acc[f.group] = acc[f.group] || [];
    acc[f.group].push(f);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Global Settings</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Site-wide configuration — changes are instant
        </p>
      </div>

      <div className="space-y-6">
        {/* Text/number fields */}
        {Object.entries(groups).map(([groupName, fields]: any) => (
          <div key={groupName} className="card p-6">
            <h2 className="text-lg font-bold mb-4">{groupName}</h2>
            <div className="space-y-4">
              {fields.map((f: any) => {
                const Icon = f.icon;
                return (
                  <div key={f.key}>
                    <label className="label flex items-center gap-2">
                      <Icon size={14} className="text-brand-600" />
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      className="input"
                      value={settings[f.key] ?? ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [f.key]:
                            f.type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Toggles */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Feature Toggles</h2>
          <div className="space-y-3">
            {TOGGLES.map((t) => {
              const Icon = t.icon;
              return (
                <label
                  key={t.key}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-brand-600" />
                    <span className="font-medium text-sm">{t.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!settings[t.key]}
                    onChange={(e) =>
                      setSettings({ ...settings, [t.key]: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-brand-600"
                  />
                </label>
              );
            })}
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="btn btn-primary w-full btn-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} /> Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
