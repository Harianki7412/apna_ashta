"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Home,
  ChevronRight,
} from "lucide-react";

const TABS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "rented", label: "Rented", icon: Home },
] as const;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [stat, setStat] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>({
    pending: 0,
    approved: 0,
    rejected: 0,
    rented: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "admin") {
        toast.error("Admin access required");
        router.push("/");
      }
    }
  }, [status, session, router]);

  async function load(s = stat) {
    setLoading(true);
    try {
      const statuses = ["pending", "approved", "rejected", "rented"];
      const results = await Promise.all(
        statuses.map((st) =>
          api
            .get<any>(`/api/admin/properties?status=${st}`)
            .catch(() => ({ items: [] })),
        ),
      );
      const newStats: any = {};
      results.forEach((r, i) => {
        newStats[statuses[i]] = r.items.length;
      });
      setStats(newStats);
      setItems(results[statuses.indexOf(s)].items);
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
      load(stat);
    }
  }, [stat, status, session]);

  async function update(id: string, newStatus: string) {
    try {
      await api.patch("/api/admin/properties", { id, status: newStatus });
      toast.success(`Marked ${newStatus}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  const filtered = items.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-brand-600" size={24} /> Admin
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Link
          href="/admin"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 group"
        >
          <Building2 size={20} className="text-brand-600" />
          <span className="flex-1 font-semibold">Properties</span>
          <ChevronRight
            size={18}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/admin/users"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 group"
        >
          <Users size={20} className="text-brand-600" />
          <span className="flex-1 font-semibold">Users</span>
          <ChevronRight
            size={18}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/admin/kyc"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 group"
        >
          <ShieldCheck size={20} className="text-brand-600" />
          <span className="flex-1 font-semibold">KYC</span>
          <ChevronRight
            size={18}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setStat(tab.key)}
              className="card p-4 text-left hover:shadow-card-hover"
            >
              <Icon size={20} className="text-brand-600 mb-2" />
              <p className="text-2xl font-extrabold">{stats[tab.key]}</p>
              <p className="text-xs text-gray-500">{tab.label}</p>
            </button>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center gap-3 mb-3 flex-wrap">
            <h2 className="text-lg font-bold">Properties ({stat})</h2>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm w-64"
              />
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = stat === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStat(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${active ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <Icon size={14} />
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-gray-100"}`}
                  >
                    {stats[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No properties</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                    Property
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 hidden md:table-cell">
                    Owner
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 hidden md:table-cell">
                    Rent
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Home size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/properties/${p._id}`}
                            className="font-semibold hover:text-brand-600 truncate block"
                          >
                            {p.title}
                          </Link>
                          <p className="text-xs text-gray-500 truncate">
                            {p.area} · {p.propertyType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm font-medium">{p.owner?.name}</p>
                      <p className="text-xs text-gray-500">{p.owner?.email}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm font-bold text-brand-600">
                        ₹{p.rent?.toLocaleString("en-IN")}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {stat !== "approved" && (
                          <button
                            onClick={() => update(p._id, "approved")}
                            className="btn btn-success btn-sm"
                          >
                            <CheckCircle2 size={14} />
                            <span className="hidden md:inline">Approve</span>
                          </button>
                        )}
                        {stat !== "rejected" && (
                          <button
                            onClick={() => update(p._id, "rejected")}
                            className="btn btn-danger btn-sm"
                          >
                            <XCircle size={14} />
                            <span className="hidden md:inline">Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
