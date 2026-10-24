"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function change(newLocale: string) {
    const parts = pathname.split("/").filter(Boolean);
    if (["en", "hi"].includes(parts[0])) parts.shift();
    router.push(`/${newLocale}${parts.length ? "/" + parts.join("/") : ""}`);
  }

  return (
    <select
      value={locale}
      onChange={(e) => change(e.target.value)}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="en">EN</option>
      <option value="hi">हिं</option>
    </select>
  );
}
