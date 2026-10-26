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
  const role = (session?.user as any)?.role;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Role-aware links
  const links = [
    { href: "/properties", label: t("browse"), icon: Search },
    ...(role === "owner" || role === "admin"
      ? [{ href: "/properties/new", label: t("addProperty"), icon: PlusCircle }]
      : []),
    ...(role === "admin"
      ? [{ href: "/admin", label: t("admin"), icon: Shield }]
      : []),
    ...(session
      ? [
          { href: "/chat", label: t("chat"), icon: MessageCircle },
          { href: "/agreements", label: "Agreements", icon: FileText },
          { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
          { href: "/favorites", label: t("favorites"), icon: Heart },
        ]
      : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100"
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-lg text-brand-600"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="hidden sm:inline">Apna Ashta</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {session && <NotificationBell />}
            <LanguageSwitcher />
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {session.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {session.user?.name}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                  className="p-2 rounded-lg text-gray-500 hover:bg-danger-50 hover:text-danger-600"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  {t("login")}
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  {t("register")}
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white animate-fade-in">
          <div className="container mx-auto p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    isActive(link.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t flex items-center justify-between px-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {session ? (
              <div className="pt-3 border-t space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {session.user?.name?.[0]?.toUpperCase()}
                  </div>
                  {session.user?.name}
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50"
                >
                  <User size={18} /> Notifications
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-danger-600 hover:bg-danger-50"
                >
                  <LogOut size={18} />
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 btn btn-secondary btn-sm text-center"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 btn btn-primary btn-sm text-center"
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
