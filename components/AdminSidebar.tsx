"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { api } from "@/lib/api-client";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Mail,
  Home,
  TrendingUp,
  FileText,
  MessageSquare,
  AlertTriangle,
  Globe,
  MapPinned,
  Building2,
} from "lucide-react";

interface Stats {
  pendingProperties: number;
  pendingKyc: number;
  newMessages: number;
  total: number;
}

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
    badge: null,
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: TrendingUp,
    badge: null,
  },
  { href: "/admin/users", label: "Users", icon: Users, badge: null },
  { href: "/admin/kyc", label: "KYC", icon: ShieldCheck, badge: "pendingKyc" },
  { href: "/admin/states", label: "States", icon: Globe, badge: null },
  { href: "/admin/cities", label: "Cities", icon: Building2, badge: null },
  {
    href: "/admin/locations",
    label: "Locations",
    icon: MapPinned,
    badge: null,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: AlertTriangle,
    badge: null,
  },
  { href: "/admin/plans", label: "Plans", icon: Package, badge: null },
  { href: "/admin/activity", label: "Activity", icon: FileText, badge: null },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: MessageSquare,
    badge: "newMessages",
  },
  { href: "/admin/settings", label: "Settings", icon: Settings, badge: null },
];

const OTHER_ITEMS = [
  { href: "/properties", label: "View Public Site", icon: ExternalLink },
  { href: "/", label: "Homepage", icon: Home },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    pendingProperties: 0,
    pendingKyc: 0,
    newMessages: 0,
    total: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const d = await api.get<Stats>("/api/admin/stats");
        setStats(d);
      } catch {}
    }
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const getBadge = (key: string | null) => {
    if (!key) return 0;
    return (stats as any)[key] || 0;
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } p-4 border-b border-gray-100 dark:border-slate-700`}
      >
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 font-extrabold"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-danger-500 to-danger-700 text-white flex items-center justify-center shadow-md shadow-danger-500/25 flex-shrink-0 relative">
            <ShieldCheck size={18} />
            {stats.total > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {stats.total > 9 ? "9+" : stats.total}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100 leading-tight">
                Admin Panel
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">
                Apna Ashta
              </p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400"
            title="Collapse"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex items-center justify-center w-full py-2 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"
          title="Expand"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, (item as any).exact);
          const badgeCount = getBadge(item.badge);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                active
                  ? "bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300"
                  : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : ""}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="bg-danger-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && badgeCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
              )}
            </Link>
          );
        })}

        <div className="my-3 border-t border-gray-100 dark:border-slate-700" />

        {OTHER_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
              title={collapsed ? item.label : ""}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-slate-700 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-[10px] text-gray-500 dark:text-slate-400">
            <kbd className="bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
              ⌘K
            </kbd>
            <span>Search anything</span>
          </div>
        )}

        <div
          className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 truncate">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/", redirect: true })}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors w-full ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-danger-500 to-danger-700 text-white flex items-center justify-center relative">
            <ShieldCheck size={16} />
            {stats.total > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                {stats.total > 9 ? "9+" : stats.total}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-900 dark:text-slate-100">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 bg-white dark:bg-slate-900 flex flex-col h-full animate-fade-in shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-700 h-screen sticky top-0 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
