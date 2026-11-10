"use client";
import Link from "next/link";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("nav");

  if (pathname.startsWith("/admin")) return null;

  const items = [
    { href: "/", icon: Home, label: t("home") },
    { href: "/properties", icon: Search, label: t("browse") },
    { href: "/favorites", icon: Heart, label: t("favorites") },
    { href: "/chat", icon: MessageCircle, label: t("chat") },
    {
      href: session ? "/profile" : "/login",
      icon: User,
      label: session ? t("profile") : t("login"),
    },
  ];

  return (
    <nav
      aria-label={t("mobileNavigation")}
      className="mobile-bottom-nav md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/80 bg-white/95 pb-safe backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div className="mx-auto grid min-h-[4.25rem] max-w-lg grid-cols-5 items-center px-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[11px] leading-none transition-colors ${
                active
                  ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
