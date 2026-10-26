"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  User,
  Lock,
  Shield,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Bell,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [profile, setProfile] = useState<any>({
    name: "",
    email: "",
    phone: "",
    phoneVerified: false,
    kycStatus: "none",
    role: "tenant",
    createdAt: "",
  });
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .get<any>("/api/profile")
      .then((data) =>
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          phoneVerified: data.phoneVerified,
          kycStatus: data.kycStatus,
          role: data.role,
          createdAt: data.createdAt,
        }),
      )
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/profile", {
        name: profile.name,
        phone: profile.phone,
      });
      await updateSession();
      toast.success("Updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm)
      return toast.error("Passwords do not match");
    if (pwdForm.newPassword.length < 6) return toast.error("Min 6 chars");
    setChangingPwd(true);
    try {
      await api.post("/api/profile/password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setChangingPwd(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Delete account permanently?")) return;
    if (window.prompt("Type DELETE:") !== "DELETE") return;
    try {
      await api.delete("/api/profile");
      await signOut({ callbackUrl: "/", redirect: true });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-3xl">
          {profile.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{profile.name}</h1>
          <p className="text-gray-500 text-sm truncate">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="badge badge-brand capitalize">{profile.role}</span>
            {profile.kycStatus === "verified" && (
              <span className="badge badge-success">
                <Shield size={10} /> KYC Verified
              </span>
            )}
            {profile.phoneVerified && (
              <span className="badge badge-success">
                <CheckCircle2 size={10} /> Verified
              </span>
            )}
          </div>
        </div>
        {profile.kycStatus !== "verified" && (
          <Link href="/verify" className="btn btn-primary btn-sm">
            Get Verified
          </Link>
        )}
      </div>

      <form onSubmit={saveProfile} className="card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <User size={18} className="text-brand-600" /> Basic
        </h2>
        <div>
          <label className="label">Name</label>
          <input
            required
            className="input"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={profile.email}
            disabled
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <div className="flex gap-2">
            <input
              type="tel"
              className="input flex-1"
              maxLength={10}
              value={profile.phone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
            />
            {profile.phoneVerified && (
              <span className="badge badge-success self-center">
                <CheckCircle2 size={12} /> Verified
              </span>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="card p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Lock size={18} className="text-brand-600" /> Change Password
        </h2>
        <div>
          <label className="label">Current</label>
          <input
            required
            type="password"
            className="input"
            value={pwdForm.currentPassword}
            onChange={(e) =>
              setPwdForm({ ...pwdForm, currentPassword: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">New</label>
            <input
              required
              type="password"
              minLength={6}
              className="input"
              value={pwdForm.newPassword}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, newPassword: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Confirm</label>
            <input
              required
              type="password"
              minLength={6}
              className="input"
              value={pwdForm.confirm}
              onChange={(e) =>
                setPwdForm({ ...pwdForm, confirm: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={changingPwd}
            className="btn btn-primary"
          >
            <Lock size={16} /> {changingPwd ? "Updating..." : "Change"}
          </button>
        </div>
      </form>

      <div className="card p-6 border-danger-200">
        <h2 className="text-lg font-bold flex items-center gap-2 text-danger-600 mb-4">
          <AlertTriangle size={18} /> Danger Zone
        </h2>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-danger-50 rounded-lg">
          <div>
            <p className="font-medium text-sm text-danger-700">
              Delete Account
            </p>
            <p className="text-xs text-danger-600">
              Permanently delete all data.
            </p>
          </div>
          <button onClick={deleteAccount} className="btn btn-danger btn-sm">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
