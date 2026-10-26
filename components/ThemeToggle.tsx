"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = document.cookie.includes("theme=dark");
    setDark(saved);
    if (saved) document.documentElement.classList.add("dark");
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }
  return (
    <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
