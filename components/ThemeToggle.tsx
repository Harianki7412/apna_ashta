"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read theme from DOM on mount (source of truth)
  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);

    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Persist to cookie (1 year)
    document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle theme"
        disabled
      >
        <Moon size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? (
        <Sun
          size={18}
          className="text-amber-500 group-hover:rotate-90 transition-transform duration-300"
        />
      ) : (
        <Moon
          size={18}
          className="text-slate-600 group-hover:-rotate-12 transition-transform duration-300"
        />
      )}
    </button>
  );
}
