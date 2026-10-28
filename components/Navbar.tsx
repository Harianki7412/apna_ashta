"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  LayoutDashboard,
  Heart,
  Shield,
  LogOut,
  User,
  FileText,
  Info,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  Package,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  useEffect(() => {
    setOpen(false);
    setInfoOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide on /admin routes
  if (pathname.startsWith("/admin")) return null;

  // Admin sees minimal nav
  const mainLinks = isAdmin
    ? [
        { href: "/admin", label: "Admin Panel", icon: Shield },
        { href: "/properties", label: "Browse Site", icon: Search },
      ]
    : [
        { href: "/properties", label: t("browse"), icon: Search },
        ...(role === "owner"
          ? [
              {
                href: "/properties/new",
                label: t("addProperty"),
                icon: PlusCircle,
              },
            ]
          : []),
        ...(session
          ? [
              { href: "/chat", label: t("chat"), icon: MessageCircle },
              { href: "/agreements", label: "Agreements", icon: FileText },
              {
                href: "/dashboard",
                label: t("dashboard"),
                icon: LayoutDashboard,
              },
              { href: "/favorites", label: t("favorites"), icon: Heart },
            ]
          : []),
      ];

  const infoLinks = [
    { href: "/about", label: "About Us", icon: Info },
    { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
    { href: "/pricing", label: "Pricing", icon: Package },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/safety-tips", label: "Safety Tips", icon: Shield },
    { href: "/contact", label: "Contact", icon: MessageSquare },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-md border-b border-gray-100 dark:border-slate-800"
          : "bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800"
      }`}
    >
      <div
        className={`h-1 bg-gradient-to-r ${
          isAdmin
            ? "from-danger-500 via-danger-600 to-danger-500"
            : "from-brand-500 via-brand-600 to-accent-500"
        }`}
      />

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-extrabold text-lg text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 group-hover:scale-105 transition-all">
              <Home size={18} className="text-white" />
            </div>
            <span className="hidden sm:inline tracking-tight">Flatova</span>
            {isAdmin && (
              <span className="hidden sm:inline text-[10px] bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 px-2 py-0.5 rounded font-bold uppercase">
                Admin
              </span>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                  )}
                </Link>
              );
            })}

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1.5" />

            <div className="relative">
              <button
                onClick={() => setInfoOpen(!infoOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  infoLinks.some((l) => isActive(l.href))
                    ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <Info size={16} />
                Info
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    infoOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {infoOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setInfoOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-50 animate-fade-up">
                    {infoLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setInfoOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                            isActive(link.href)
                              ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                              : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <Icon size={16} />
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            {session && <NotificationBell />}
            <LanguageSwitcher />
            <ThemeToggle />

            {session ? (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-slate-700">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm ${
                      isAdmin
                        ? "bg-gradient-to-br from-danger-500 to-danger-700"
                        : "bg-gradient-to-br from-brand-400 to-brand-600"
                    }`}
                  >
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-200 max-w-[100px] truncate">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                  className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:text-danger-600 dark:hover:text-danger-400 transition-colors"
                  title={t("logout")}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 shadow-md shadow-brand-500/25 transition-all"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-200"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container mx-auto p-4 space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 mt-2">
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">
                Information
              </p>
              {infoLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                        : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between px-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {session ? (
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 dark:bg-slate-800"
                >
                  <div
                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm ${
                      isAdmin
                        ? "bg-gradient-to-br from-danger-500 to-danger-700"
                        : "bg-gradient-to-br from-brand-400 to-brand-600"
                    }`}
                  >
                    {session.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-gray-900 dark:text-slate-100">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium"
                >
                  <User size={18} />
                  Notifications
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 text-sm font-medium"
                >
                  <LogOut size={18} />
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-brand-600 dark:text-brand-400 border-2 border-brand-600 dark:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-white bg-gradient-to-r from-brand-600 to-brand-700 shadow-md transition-all"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
