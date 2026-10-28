"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import { Mail, Reply, Check, Loader2, X, MessageSquare } from "lucide-react";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
  { key: "closed", label: "Closed" },
];

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get<any>(`/api/admin/messages?status=${status}`);
      setMessages(d.messages);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`/api/admin/messages/${selected._id}/reply`, { reply });
      toast.success("Reply sent");
      setSelected(null);
      setReply("");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  }

  async function markStatus(id: string, newStatus: string) {
    try {
      await api.patch("/api/admin/messages", { id, status: newStatus });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Mail className="text-brand-600" /> Contact Messages
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage messages from contact form
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              status === t.key
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="card p-12 text-center">
          <Mail
            size={40}
            className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-slate-400">No messages</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`card p-4 hover:shadow-lg transition-all cursor-pointer ${
                m.status === "new" ? "border-l-4 border-l-brand-600" : ""
              }`}
              onClick={() => {
                setSelected(m);
                setReply("");
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold flex-shrink-0">
                  {m.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold">{m.name}</p>
                    <span
                      className={`badge badge-${
                        m.status === "new"
                          ? "brand"
                          : m.status === "replied"
                            ? "success"
                            : "warning"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 truncate">
                    {m.subject && <strong>{m.subject}: </strong>}
                    {m.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {m.email} · {format(new Date(m.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reply to {selected.name}</h2>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg mb-4 text-sm">
              <p className="font-semibold mb-1">
                {selected.subject || "General Inquiry"}
              </p>
              <p className="text-gray-600 dark:text-slate-300 whitespace-pre-wrap">
                {selected.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                From: {selected.email}
              </p>
            </div>

            <textarea
              rows={6}
              className="input mb-4"
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => markStatus(selected._id, "closed")}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Reply size={14} />
                )}
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
