"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const role = (session?.user as any)?.role;

  const links = [
    { href: "/properties", label: t("browse") },
    ...(role === "owner" || role === "admin"
      ? [{ href: "/properties/new", label: t("addProperty") }]
      : []),
    ...(role === "admin" ? [{ href: "/admin", label: t("admin") }] : []),
    ...(session
      ? [
          { href: "/chat", label: t("chat") },
          { href: "/dashboard", label: t("dashboard") },
          { href: "/favorites", label: t("favorites") },
        ]
      : []),
  ];

  return (
    <nav className="bg-white shadow sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Apna Ashta
        </Link>

        <div className="hidden md:flex gap-4 items-center text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          {session && <NotificationBell />}
          <LanguageSwitcher />
          {session ? (
            <button onClick={() => signOut()} className="text-red-600">
              {t("logout")}
            </button>
          ) : (
            <>
              <Link href="/login">{t("login")}</Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white p-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <LanguageSwitcher />
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-red-600 text-left"
            >
              {t("logout")}
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                {t("login")}
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-center"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
