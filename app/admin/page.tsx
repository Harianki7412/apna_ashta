"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  canAccessManagementRoute,
  hasAdminAccess,
  hasFullAdminAccess,
} from "@/lib/role-access";
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
  MessageSquare,
  Activity,
  Mail,
  AlertTriangle,
  Globe,
  MapPinned,
  Shield,
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
  const isAdmin = hasFullAdminAccess(session?.user?.role);
  const [items, setItems] = useState<any[]>([]);
  const [stat, setStat] = useState("pending");
  const [loading, setLoading] = useState(true);
  const propertiesByStatus = useRef<Record<string, any[]> | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loadError, setLoadError] = useState("");
  const [badgeError, setBadgeError] = useState("");
  const [stats, setStats] = useState<any>({
    pending: 0,
    approved: 0,
    rejected: 0,
    rented: 0,
  });
  const [badges, setBadges] = useState<any>({
    pendingProperties: 0,
    pendingKyc: 0,
    newMessages: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (!hasAdminAccess(role)) {
        toast.error("Admin access required");
        router.push("/");
      }
    }
  }, [status, session, router]);

  async function load(s = stat, refresh = false) {
    if (!refresh && propertiesByStatus.current) {
      setItems(propertiesByStatus.current[s] || []);
      setLoading(false);
      setLoadError("");
      return;
    }

    if (refresh) propertiesByStatus.current = null;
    setLoading(true);
    try {
      const statuses = ["pending", "approved", "rejected", "rented"];
      const results = await Promise.all(
        statuses.map((st) =>
          api.get<any>(`/api/admin/properties?status=${st}`),
        ),
      );
      const newStats: any = {};
      const newPropertiesByStatus: Record<string, any[]> = {};
      results.forEach((r, i) => {
        newStats[statuses[i]] = r.total ?? r.items.length;
        newPropertiesByStatus[statuses[i]] = r.items;
      });
      propertiesByStatus.current = newPropertiesByStatus;
      setStats(newStats);
      setItems(newPropertiesByStatus[s] || []);
      setLoadError("");
    } catch (e: any) {
      setLoadError(e instanceof Error ? e.message : "Unable to load properties.");
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadBadges() {
    try {
      const d = await api.get<any>("/api/admin/stats");
      setBadges(d);
      setBadgeError("");
    } catch (e: any) {
      setBadgeError(e instanceof Error ? e.message : "Unable to load admin alerts.");
    }
  }

  useEffect(() => {
    if (
      status === "authenticated" &&
      hasAdminAccess(session?.user?.role)
    ) {
      load(stat);
      loadBadges();
    }
  }, [stat, status, session]);

  async function update(id: string, newStatus: string) {
    try {
      await api.patch("/api/admin/properties", { id, status: newStatus });
      toast.success(`Marked ${newStatus}`);
      load(stat, true);
      loadBadges();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function verifyProperty(id: string, currentlyVerified: boolean) {
    try {
      await api.post(`/api/admin/properties/${id}/verify`, {
        action: currentlyVerified ? "unverify" : "verify",
      });
      toast.success(currentlyVerified ? "Unverified" : "Property verified!");
      load(stat, true);
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
  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sort === "rent-low") return Number(a.rent || 0) - Number(b.rent || 0);
    if (sort === "rent-high") return Number(b.rent || 0) - Number(a.rent || 0);
    if (sort === "views") return Number(b.views || 0) - Number(a.views || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalListings =
    stats.pending + stats.approved + stats.rejected + stats.rented;

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
      href: "/admin/analytics",
      label: "Analytics",
      desc: "Charts & KPIs",
      icon: TrendingUp,
      color: "accent",
      isNew: true,
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
      desc:
        badges.pendingKyc > 0 ? `${badges.pendingKyc} pending` : "Verify users",
      icon: ShieldCheck,
      color: "success",
      isNew: false,
    },
    {
      href: "/admin/states",
      label: "States",
      desc: "Geography",
      icon: Globe,
      color: "brand",
      isNew: true,
    },
    {
      href: "/admin/cities",
      label: "Cities",
      desc: "Manage cities",
      icon: Building2,
      color: "brand",
      isNew: true,
    },
    {
      href: "/admin/locations",
      label: "Locations",
      desc: "Owner submissions",
      icon: MapPinned,
      color: "success",
      isNew: false,
    },
    {
      href: "/admin/reports",
      label: "Reports",
      desc: "User reports queue",
      icon: AlertTriangle,
      color: "danger",
      isNew: false,
    },
    {
      href: "/admin/messages",
      label: "Messages",
      desc:
        badges.newMessages > 0 ? `${badges.newMessages} new` : "Contact inbox",
      icon: MessageSquare,
      color: "success",
      isNew: false,
    },
    {
      href: "/admin/activity",
      label: "Activity",
      desc: "Audit trail",
      icon: Activity,
      color: "gray",
      isNew: false,
    },
    {
      href: "/admin/plans",
      label: "Plans",
      desc: "Pricing & leads",
      icon: Package,
      color: "accent",
      isNew: false,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      desc: "Global config",
      icon: Settings,
      color: "gray",
      isNew: false,
    },
  ].filter((item) =>
    canAccessManagementRoute(session?.user?.role, item.href),
  );
  const visibleTabs = isAdmin
    ? TABS
    : TABS.filter((tab) => tab.key !== "rented");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-danger-500 to-danger-700 text-white flex items-center justify-center shadow-md shadow-danger-500/25">
            <ShieldCheck size={20} />
          </div>
          {badgeError && (
            <div role="status" className="mb-5 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-200">
              Admin alerts could not be refreshed: {badgeError}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">
              {isAdmin ? "Admin Dashboard" : "Management Team Dashboard"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {isAdmin
                ? "Manage properties, users, plans, and settings"
                : "Review listings and KYC, manage users and locations, and handle messages and settings"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
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
            danger:
              "bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400",
          };

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`card p-4 transition-all relative hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-lg ${
                isActive ? "ring-2 ring-brand-500 dark:ring-brand-400" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg ${colorClasses[item.color]} flex items-center justify-center mb-2`}
              >
                <Icon size={18} />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
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
        {visibleTabs.map((tab) => {
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
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                />
                <input
                  type="search"
                  placeholder="Search title, owner, area..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9 py-2 text-sm"
                  aria-label="Search properties"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input sm:w-48"
                aria-label="Sort properties"
              >
                <option value="newest">Newest first</option>
                <option value="rent-low">Rent: low to high</option>
                <option value="rent-high">Rent: high to low</option>
                <option value="views">Most viewed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => {
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
          ) : loadError ? (
            <div role="alert" className="p-10 text-center">
              <AlertTriangle size={32} className="text-danger-500 mx-auto mb-3" />
              <p className="font-semibold">Properties could not be loaded</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{loadError}</p>
              <button onClick={() => load()} className="btn btn-secondary btn-sm mt-4">
                Try again
              </button>
            </div>
          ) : sortedFiltered.length === 0 ? (
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
                {sortedFiltered.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt=""
                            width={56}
                            height={56}
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
                          {p.verified && (
                            <span className="text-[10px] text-success-600 dark:text-success-400 flex items-center gap-1 mt-0.5">
                              <Shield size={10} /> Verified
                            </span>
                          )}
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
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Link
                          href={`/properties/${p._id}`}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>

                        {p.status === "approved" && (
                          <button
                            onClick={() => verifyProperty(p._id, p.verified)}
                            className={`btn btn-sm ${
                              p.verified
                                ? "btn-ghost text-success-600"
                                : "btn-secondary"
                            }`}
                            title={
                              p.verified
                                ? "Unverify"
                                : "Mark as physically verified"
                            }
                          >
                            <Shield size={14} />
                            <span className="hidden md:inline">
                              {p.verified ? "Verified" : "Verify"}
                            </span>
                          </button>
                        )}

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
      {isAdmin && <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        <Link
          href="/admin/analytics"
          className="card p-5 hover:border-accent-300 dark:hover:border-accent-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent-400/20 text-accent-600 dark:text-accent-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-accent-600 group-hover:translate-x-1 transition-all"
            />
          </div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">
            View Analytics
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Revenue, users, and listings trend
          </p>
        </Link>

        <Link
          href="/admin/states"
          className="card p-5 hover:border-brand-300 dark:hover:border-brand-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all"
            />
          </div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">
            Manage States
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Top-level geography and cities
          </p>
        </Link>

        <Link
          href="/admin/cities"
          className="card p-5 hover:border-success-300 dark:hover:border-success-600 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <ChevronRight
              size={18}
              className="text-gray-400 group-hover:text-success-600 group-hover:translate-x-1 transition-all"
            />
          </div>
          <p className="font-semibold text-gray-900 dark:text-slate-100">
            Manage Cities
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Add cities under any state
          </p>
        </Link>
      </div>
      }
    </div>
  );
}
