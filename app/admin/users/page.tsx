"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { ArrowLeft, Search } from "lucide-react";

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    try {
      const d = await api.get<any>(`/api/admin/users?${params}`);
      setUsers(d.users);
      setTotalPages(d.totalPages);
      setPage(p);
    } catch (e: any) {
      toast.error(e.message);
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
    if (a === "delete" && !window.confirm("Delete permanently?")) return;
    try {
      await api.patch("/api/admin/users", { userId, action: a, ...extra });
      toast.success("Done");
      load(page);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading") {
    return <div className="skeleton h-96 rounded-2xl" />;
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 mb-4"
      >
        <ArrowLeft size={16} /> Back to Admin
      </Link>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input w-32"
        >
          <option value="">All</option>
          <option value="owner">Owners</option>
          <option value="tenant">Tenants</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={() => load(1)} className="btn btn-primary">
          Search
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.phone || "—"}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      action(u._id, "change-role", { role: e.target.value })
                    }
                    className="border rounded px-1 text-xs"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-2">
                  <span
                    className={
                      u.blocked
                        ? "bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs"
                        : "bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
                    }
                  >
                    {u.blocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="p-2 flex gap-1">
                  {u.blocked ? (
                    <button
                      onClick={() => action(u._id, "unblock")}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const r = window.prompt("Reason:");
                        if (r !== null) action(u._id, "block", { reason: r });
                      }}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Block
                    </button>
                  )}
                  <button
                    onClick={() => action(u._id, "delete")}
                    className="border border-red-600 text-red-600 px-2 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => load(page - 1)}
          className="btn btn-ghost disabled:opacity-50"
        >
          ← Prev
        </button>
        <span className="text-sm">
          Page {page}/{totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => load(page + 1)}
          className="btn btn-ghost disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
