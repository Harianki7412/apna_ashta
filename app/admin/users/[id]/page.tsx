"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
  Ban,
  UserCog,
  Key,
  Trash2,
  Loader2,
} from "lucide-react";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get<any>(`/api/admin/users/${id}`);
      setData(d);
    } catch (e: any) {
      toast.error(e.message);
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function act(action: string, extra: any = {}) {
    if (action === "delete" && !window.confirm("Delete this user permanently?"))
      return;
    if (action === "block") {
      const reason = window.prompt("Reason for block:");
      if (reason === null) return;
      extra.reason = reason;
    }
    setActionLoading(action);
    try {
      const res = await api.patch<any>(`/api/admin/users/${id}`, {
        action,
        ...extra,
      });
      if (action === "reset-password" && res.newPassword) {
        toast.success(`New password: ${res.newPassword}`, { duration: 10000 });
      } else if (action === "delete") {
        toast.success("User deleted");
        router.push("/admin/users");
        return;
      } else {
        toast.success("Done");
      }
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-8 w-32 rounded" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const { user, properties, subscriptions, leadPacks, notes } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 hover:text-brand-600"
      >
        <ArrowLeft size={16} /> Back to Users
      </Link>

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <span className="badge badge-brand capitalize">{user.role}</span>
              {user.kycStatus === "verified" && (
                <span className="badge badge-success">
                  <Shield size={10} /> KYC Verified
                </span>
              )}
              {user.blocked && (
                <span className="badge badge-danger">Blocked</span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Mail size={14} /> {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Joined{" "}
                {format(new Date(user.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
          <select
            value={user.role}
            onChange={(e) => act("change-role", { role: e.target.value })}
            className="input w-40 text-sm"
          >
            <option value="tenant">Tenant</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>

          {!user.blocked ? (
            <button
              onClick={() => act("block")}
              disabled={!!actionLoading}
              className="btn btn-danger btn-sm"
            >
              <Ban size={14} /> Block
            </button>
          ) : (
            <button
              onClick={() => act("unblock")}
              disabled={!!actionLoading}
              className="btn btn-success btn-sm"
            >
              <CheckCircle2 size={14} /> Unblock
            </button>
          )}

          <button
            onClick={() => act("reset-password")}
            disabled={!!actionLoading}
            className="btn btn-secondary btn-sm"
          >
            <Key size={14} /> Reset Password
          </button>

          {user.kycStatus === "pending" && (
            <>
              <button
                onClick={() => act("verify-kyc")}
                disabled={!!actionLoading}
                className="btn btn-success btn-sm"
              >
                <CheckCircle2 size={14} /> Verify KYC
              </button>
              <button
                onClick={() => act("reject-kyc")}
                disabled={!!actionLoading}
                className="btn btn-danger btn-sm"
              >
                <XCircle size={14} /> Reject KYC
              </button>
            </>
          )}

          <button
            onClick={() => act("delete")}
            disabled={!!actionLoading}
            className="btn btn-ghost btn-sm text-danger-600 ml-auto"
          >
            <Trash2 size={14} /> Delete User
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-brand-600" /> Properties (
          {properties.length})
        </h2>
        {properties.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            No properties
          </p>
        ) : (
          <div className="space-y-2">
            {properties.map((p: any) => (
              <Link
                key={p._id}
                href={`/properties/${p._id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {p.area} · ₹{p.rent?.toLocaleString("en-IN")}/mo
                  </p>
                </div>
                <span
                  className={`badge badge-${p.status === "approved" ? "success" : p.status === "rejected" ? "danger" : "warning"}`}
                >
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Admin Notes ({notes.length})</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">
            No notes yet
          </p>
        ) : (
          <div className="space-y-2">
            {notes.map((n: any) => (
              <div
                key={n._id}
                className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm"
              >
                {n.content}
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(n.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
