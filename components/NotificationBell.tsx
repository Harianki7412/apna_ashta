"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const d = await api.get<{ items: any[]; unread: number }>(
        "/api/notifications",
      );
      setItems(d.items);
      setUnread(d.unread);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAll() {
    await api.patch("/api/notifications");
    setUnread(0);
    setItems((i) => i.map((n) => ({ ...n, read: true })));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger-500 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in">
          <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-slate-700">
            <span className="font-bold text-sm text-gray-900 dark:text-slate-100">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                <CheckCheck size={12} /> Mark all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <div className="p-6 text-center">
                <Bell
                  size={28}
                  className="text-gray-300 dark:text-slate-600 mx-auto mb-2"
                />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  No notifications
                </p>
              </div>
            )}
            {items.slice(0, 8).map((n) => (
              <Link
                key={n._id}
                href={n.link || "/notifications"}
                onClick={() => setOpen(false)}
                className={`block p-3 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                  !n.read ? "bg-brand-50/50 dark:bg-brand-900/20" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 mt-1.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${!n.read ? "font-bold text-gray-900 dark:text-slate-100" : "font-medium text-gray-700 dark:text-slate-300"}`}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block p-3 text-center text-sm text-brand-600 dark:text-brand-400 font-semibold border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}
