"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  ArrowLeft,
  Search,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Ban,
  Trash2,
  Users as UsersIcon,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/users");
      return;
    }
    if (status === "authenticated") {
      const r = (session?.user as any)?.role;
      if (r !== "admin") {
        toast.error("Admin access required");
        router.push("/");
      }
    }
  }, [status, session, router]);

  async function load(p = 1) {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    try {
      const d = await api.get<any>(`/api/admin/users?${params}`);
      setUsers(d.users);
      setTotalPages(d.totalPages);
      setTotal(d.total);
      setPage(p);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as any)?.role === "admin"
    ) {
      load(1);
    }
  }, [status, session]);

  async function action(userId: string, a: string, extra: any = {}) {
    if (
      a === "delete" &&
      !window.confirm("Delete user permanently? This cannot be undone.")
    )
      return;
    if (a === "block") {
      const reason = window.prompt("Reason for block:");
      if (reason === null) return;
      extra.reason = reason;
    }
    try {
      await api.patch("/api/admin/users", { userId, action: a, ...extra });
      toast.success("Done");
      load(page);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function exportCSV() {
    window.open("/api/admin/export?type=users", "_blank");
  }

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-16 rounded-xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4"
      >
        <ArrowLeft size={16} /> Back to Admin
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <UsersIcon className="text-brand-600" size={28} />
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {total} total users
          </p>
        </div>
        <button onClick={exportCSV} className="btn btn-secondary btn-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
          />
          <input
            placeholder="Search name, email, phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1)}
            className="input pl-9"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input w-40"
        >
          <option value="">All Roles</option>
          <option value="owner">Owners</option>
          <option value="tenant">Tenants</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={() => load(1)} className="btn btn-primary">
          Search
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <UsersIcon
                size={40}
                className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
              />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                No users found
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    Name
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    Email
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase hidden md:table-cell">
                    Phone
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    Role
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase hidden md:table-cell">
                    Status
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase hidden md:table-cell">
                    KYC
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3">
                      <Link
                        href={`/admin/users/${u._id}`}
                        className="font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                      >
                        {u.name}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="p-3 hidden md:table-cell text-gray-600 dark:text-slate-300">
                      {u.phone || "—"}
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          action(u._id, "change-role", { role: e.target.value })
                        }
                        className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-2 py-1 text-xs"
                      >
                        <option value="tenant">Tenant</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {u.blocked ? (
                        <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded text-xs font-semibold">
                          Blocked
                        </span>
                      ) : (
                        <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          u.kycStatus === "verified"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : u.kycStatus === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : u.kycStatus === "rejected"
                                ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                        }`}
                      >
                        {u.kycStatus || "none"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/users/${u._id}`}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Link>
                        {u.blocked ? (
                          <button
                            onClick={() => action(u._id, "unblock")}
                            className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700"
                            title="Unblock"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => action(u._id, "block")}
                            className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700"
                            title="Block"
                          >
                            <Ban size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => action(u._id, "delete")}
                          className="p-1.5 rounded border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => load(page - 1)}
          className="btn btn-ghost btn-sm disabled:opacity-50"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          Page {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => load(page + 1)}
          className="btn btn-ghost btn-sm disabled:opacity-50"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
