"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { EmptyState } from "@/components/EmptyState";
import {
  Bell,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Home,
  ShieldCheck,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, any> = {
  message: MessageCircle,
  property_approved: CheckCircle2,
  property_rejected: XCircle,
  new_listing: Home,
  kyc_verified: ShieldCheck,
  kyc_rejected: XCircle,
  system: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  message: "bg-brand-100 text-brand-600",
  property_approved: "bg-success-50 text-success-500",
  property_rejected: "bg-danger-50 text-danger-500",
  new_listing: "bg-brand-100 text-brand-600",
  kyc_verified: "bg-success-50 text-success-500",
  kyc_rejected: "bg-danger-50 text-danger-500",
  system: "bg-gray-100 text-gray-500",
};

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/notifications");
    }
  }, [status, router]);

  async function load() {
    setLoading(true);
    try {
      const { items } = await api.get<{ items: any[] }>("/api/notifications");
      setItems(items);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  async function markAllRead() {
    try {
      await api.patch("/api/notifications");
      setItems((p) => p.map((n) => ({ ...n, read: true })));
      toast.success("Marked all");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function remove(id: string) {
    try {
      await api.delete("/api/notifications", { id });
      setItems((p) => p.filter((n) => n._id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="skeleton h-8 w-48 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const filtered = filter === "unread" ? items.filter((n) => !n.read) : items;
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="text-brand-600" size={28} /> Notifications
          </h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        {[
          { key: "all", label: `All (${items.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === tab.key
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "No unread" : "No notifications"}
            description="Come back later."
            actionLabel="Browse"
            actionHref="/properties"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = TYPE_ICONS[n.type] || Bell;
            const colorClass = TYPE_COLORS[n.type] || TYPE_COLORS.system;
            const content = (
              <div
                className={`card p-4 flex items-start gap-3 hover:shadow-card-hover group ${!n.read ? "border-l-4 border-l-brand-500" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className={`text-sm ${!n.read ? "font-bold" : "font-medium text-gray-700"}`}
                      >
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(n._id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-500 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n._id} href={n.link}>
                {content}
              </Link>
            ) : (
              <div key={n._id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
