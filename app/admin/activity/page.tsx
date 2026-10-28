"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Trash2,
  UserCog,
  Shield,
  Loader2,
  Filter,
} from "lucide-react";

const ACTION_ICONS: Record<string, any> = {
  approve: CheckCircle2,
  bulk_approve: CheckCircle2,
  reject: XCircle,
  bulk_reject: XCircle,
  delete: Trash2,
  bulk_delete: Trash2,
  role_change: UserCog,
  block: Shield,
  unblock: Shield,
  kyc_verify: CheckCircle2,
  kyc_reject: XCircle,
};

const ACTION_COLORS: Record<string, string> = {
  approve: "bg-success-50 text-success-600",
  bulk_approve: "bg-success-50 text-success-600",
  reject: "bg-danger-50 text-danger-600",
  bulk_reject: "bg-danger-50 text-danger-600",
  delete: "bg-danger-50 text-danger-600",
  bulk_delete: "bg-danger-50 text-danger-600",
  role_change: "bg-brand-50 text-brand-600",
  block: "bg-warning-50 text-warning-600",
  unblock: "bg-success-50 text-success-600",
  kyc_verify: "bg-success-50 text-success-600",
  kyc_reject: "bg-danger-50 text-danger-600",
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState("");

  async function load(p = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (action) params.set("action", action);
      const d = await api.get<any>(`/api/admin/activity?${params}`);
      setLogs(d.logs);
      setTotalPages(d.totalPages);
      setPage(p);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, [action]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Activity className="text-brand-600" /> Activity Log
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Audit trail of all admin actions
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="input w-48"
        >
          <option value="">All Actions</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="delete">Delete</option>
          <option value="bulk_approve">Bulk Approve</option>
          <option value="bulk_reject">Bulk Reject</option>
          <option value="role_change">Role Change</option>
          <option value="block">Block</option>
          <option value="unblock">Unblock</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <Activity
            size={40}
            className="text-gray-300 dark:text-slate-600 mx-auto mb-3"
          />
          <p className="text-gray-500 dark:text-slate-400">No activity yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || Activity;
              const color =
                ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600";
              return (
                <div key={log._id} className="card p-4 flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <strong>{log.actor?.name || "Admin"}</strong>{" "}
                      <span className="text-gray-600 dark:text-slate-400">
                        {log.action.replace(/_/g, " ")}
                      </span>{" "}
                      {log.targetLabel && <strong>{log.targetLabel}</strong>}
                    </p>
                    {log.metadata && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-mono">
                        {JSON.stringify(log.metadata).slice(0, 100)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              disabled={page === 1}
              onClick={() => load(page - 1)}
              className="btn btn-ghost btn-sm disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
              className="btn btn-ghost btn-sm disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
