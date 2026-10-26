"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function change(newLocale: string) {
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    router.refresh();
  }

  return (
    <div className="relative">
      <Globe
        size={16}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
      <select
        value={locale}
        onChange={(e) => change(e.target.value)}
        className="appearance-none bg-transparent border border-gray-200 rounded-lg pl-8 pr-6 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-50"
      >
        <option value="en">EN</option>
        <option value="hi">हिं</option>
      </select>
    </div>
  );
}
