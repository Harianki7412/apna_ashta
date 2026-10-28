"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { AlertTriangle, Flag, X, Loader2 } from "lucide-react";

const REASONS = [
  { value: "fake_listing", label: "Fake or misleading listing" },
  { value: "wrong_info", label: "Incorrect information" },
  { value: "already_rented", label: "Property is already rented" },
  { value: "spam", label: "Spam or duplicate" },
  { value: "scam", label: "Suspected scam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

export default function ReportButton({ propertyId }: { propertyId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  function handleOpen() {
    if (!session) {
      router.push(`/login?callbackUrl=/properties/${propertyId}`);
      return;
    }
    setOpen(true);
  }

  async function submit() {
    if (!reason) return toast.error("Please select a reason");
    setSending(true);
    try {
      await api.post("/api/reports", {
        propertyId,
        reason,
        description: description.trim(),
      });
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-gray-500 dark:text-slate-400 hover:text-danger-600 dark:hover:text-danger-400 flex items-center gap-1 transition-colors py-2"
      >
        <Flag size={12} /> Report this listing
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 animate-fade-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 dark:text-slate-100">
                    Report Listing
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Help us keep Apna Ashta safe
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="label">Reason *</label>
                <select
                  className="input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="">Select reason</option>
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Additional details (optional)</label>
                <textarea
                  rows={3}
                  className="input"
                  placeholder="Help us understand the issue..."
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {description.length}/500
                </p>
              </div>
            </div>

            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 border border-accent-400 dark:border-accent-600 rounded-lg mb-4 text-xs text-warning-700 dark:text-warning-300">
              ⚠️ False reports may result in account restrictions.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={sending}
                className="flex-1 btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={sending || !reason}
                className="flex-1 btn btn-danger disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Flag size={14} /> Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
