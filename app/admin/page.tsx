"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
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
  Package,
  Settings,
  TrendingUp,
  Eye,
} from "lucide-react";

const TABS = [
  { key: "pending", label: "Pending", icon: Clock, color: "warning" },
  { key: "approved", label: "Approved", icon: CheckCircle2, color: "success" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "danger" },
  { key: "rented", label: "Rented", icon: Home, color: "brand" },
] as const;

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const filtered = items.filter(
    (p) =>
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.area?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalListings =
    stats.pending + stats.approved + stats.rejected + stats.rented;

  // Quick access cards config
  const quickLinks = [
    {
      href: "/admin",
      label: "Properties",
      desc: `${totalListings} total`,
      icon: Building2,
      color: "brand",
      isNew: false,
    },
    {
      href: "/admin/users",
      label: "Users",
      desc: "Manage accounts",
      icon: Users,
      color: "brand",
      isNew: false,
    },
    {
      href: "/admin/kyc",
      label: "KYC",
      desc: "Verify users",
      icon: ShieldCheck,
      color: "success",
      isNew: false,
    },
    {
      href: "/admin/plans",
      label: "Plans",
      desc: "Pricing & leads",
      icon: Package,
      color: "accent",
      isNew: true,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      desc: "Global config",
      icon: Settings,
      color: "gray",
      isNew: true,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      desc: "Coming soon",
      icon: TrendingUp,
      color: "gray",
      isNew: false,
      disabled: true,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-danger-500 to-danger-700 text-white flex items-center justify-center shadow-md shadow-danger-500/25">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Manage properties, users, plans, and settings
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          const colorClasses: any = {
            brand:
              "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400",
            success:
              "bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400",
            accent:
              "bg-accent-400/20 dark:bg-accent-400/10 text-accent-600 dark:text-accent-400",
            gray: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300",
          };

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={`card p-4 transition-all relative ${
                item.disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-lg"
              } ${
                isActive && !item.disabled
                  ? "ring-2 ring-brand-500 dark:ring-brand-400"
                  : ""
              }`}
              title={item.disabled ? "Coming soon" : item.desc}
            >
              <div
                className={`w-9 h-9 rounded-lg ${colorClasses[item.color]} flex items-center justify-center mb-2`}
              >
                <Icon size={18} />
              </div>
              <p
                className={`text-sm font-semibold ${
                  item.disabled
                    ? "text-gray-500 dark:text-slate-400"
                    : "text-gray-900 dark:text-slate-100"
                }`}
              >
                {item.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {item.desc}
              </p>
              {item.isNew && (
                <span className="absolute top-2 right-2 text-[10px] bg-accent-500 text-white px-1.5 py-0.5 rounded font-bold">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = stat === tab.key;
          const colors: any = {
            warning:
              "bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400",
            success:
              "bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400",
            danger:
              "bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400",
            brand:
              "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400",
          };
          return (
            <button
              key={tab.key}
              onClick={() => setStat(tab.key)}
              className={`card p-4 text-left transition-all hover:shadow-lg ${
                active ? "ring-2 ring-brand-500 dark:ring-brand-400" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg ${colors[tab.color]} flex items-center justify-center mb-2`}
              >
                <Icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
                {stats[tab.key]}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {tab.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Properties Section */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex justify-between items-center gap-3 mb-3 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Properties ({stat})
            </h2>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              />
              <input
                type="text"
                placeholder="Search title, owner, area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 py-2 text-sm w-64"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = stat === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStat(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-brand-600 text-white shadow-md"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white/20" : "bg-gray-100 dark:bg-slate-700"
                    }`}
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
            <div className="p-8 text-center">
              <div className="skeleton h-16 w-full rounded mb-2" />
              <div className="skeleton h-16 w-full rounded mb-2" />
              <div className="skeleton h-16 w-full rounded" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Building2
                size={40}
                className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
              />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {search
                  ? "No properties match your search"
                  : `No ${stat} properties`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase px-4 py-3">
                    Property
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase px-4 py-3 hidden md:table-cell">
                    Owner
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase px-4 py-3 hidden md:table-cell">
                    Rent
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                            <Home
                              size={20}
                              className="text-gray-400 dark:text-slate-500"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/properties/${p._id}`}
                            className="font-semibold text-gray-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 truncate block"
                          >
                            {p.title}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                            {p.area} · {p.propertyType}
                            {p.bhk && ` · ${p.bhk}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {p.owner?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                        {p.owner?.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                        ₹{p.rent?.toLocaleString("en-IN")}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/properties/${p._id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
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

      {/* Quick Actions Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        <Link
          href="/admin/plans"
          className="card p-5 hover:border-accent-300 dark:hover:border-accent-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent-400/20 text-accent-600 dark:text-accent-400 flex items-center justify-center">
              <Package size={20} />
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-accent-600 group-hover:translate-x-1 transition-all"
            />
          </div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">
            Manage Pricing Plans
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Add, edit, or remove subscription plans, lead packs, and featured
            tiers
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="card p-5 hover:border-brand-300 dark:hover:border-brand-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all"
            />
          </div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">
            Global Settings
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Site name, prices, feature toggles, and more
          </p>
        </Link>

        <Link
          href="/admin/kyc"
          className="card p-5 hover:border-success-300 dark:hover:border-success-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-success-600 group-hover:translate-x-1 transition-all"
            />
          </div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">
            KYC Verification
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Review and verify identity documents
          </p>
        </Link>
      </div>
    </div>
  );
}
