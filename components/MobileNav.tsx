"use client";
import Link from "next/link";
import { Home, Search, Heart, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname.startsWith("/admin")) return null;

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/properties", icon: Search, label: "Search" },
    { href: "/favorites", icon: Heart, label: "Saved" },
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    {
      href: session ? "/profile" : "/login",
      icon: User,
      label: session ? "Profile" : "Login",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800 z-40 pb-safe">
      <div className="flex justify-around">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 px-3 text-xs transition-colors ${
                active
                  ? "text-brand-600 dark:text-brand-400 font-semibold"
                  : "text-gray-500 dark:text-slate-400"
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
