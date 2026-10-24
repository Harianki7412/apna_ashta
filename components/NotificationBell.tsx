"use client";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";

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
      <button onClick={() => setOpen(!open)} className="relative p-2">
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between p-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-blue-600">
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 && (
            <p className="p-3 text-gray-500 text-sm">No notifications</p>
          )}
          {items.map((n) => (
            <Link
              key={n._id}
              href={n.link || "#"}
              onClick={() => setOpen(false)}
              className={`block p-3 border-b hover:bg-gray-50 ${!n.read ? "bg-blue-50" : ""}`}
            >
              <p className="text-sm font-medium">{n.title}</p>
              {n.body && <p className="text-xs text-gray-500">{n.body}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
