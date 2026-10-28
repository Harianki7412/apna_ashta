"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import {
  Search,
  User,
  Building2,
  FileText,
  Loader2,
  Command,
} from "lucide-react";

interface Result {
  type: "user" | "property" | "agreement";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export default function AdminCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  // ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const d = await api.get<{ results: Result[] }>(
          `/api/admin/search?q=${encodeURIComponent(query)}`,
        );
        setResults(d.results || []);
      } catch {
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, open]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  if (!open) return null;

  const icons = {
    user: User,
    property: Building2,
    agreement: FileText,
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center pt-[10vh] p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-slate-700">
          <Search size={20} className="text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, properties, agreements..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-slate-100 text-lg"
          />
          {loading && (
            <Loader2 size={16} className="animate-spin text-gray-400" />
          )}
          <kbd className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-gray-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.length < 2 && (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-400">
              Type at least 2 characters to search
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-slate-400">
              No results for "{query}"
            </div>
          )}

          {results.map((r) => {
            const Icon = icons[r.type];
            return (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => navigate(r.href)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-3 border-b border-gray-50 dark:border-slate-700/30 last:border-0"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                    {r.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {r.subtitle}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  {r.type}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-2 text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2">
          <Command size={12} /> + K to open anywhere
        </div>
      </div>
    </div>
  );
}
