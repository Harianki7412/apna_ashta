"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function DeletePropertyButton({
  propertyId,
  propertyTitle,
  variant = "icon",
  redirectTo = "/dashboard",
  onDeleted,
}: {
  propertyId: string;
  propertyTitle?: string;
  variant?: "icon" | "button" | "danger";
  redirectTo?: string | null;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function handleDelete() {
    if (confirmText !== "DELETE") return toast.error("Type DELETE to confirm");
    setDeleting(true);
    try {
      await api.delete(`/api/properties/${propertyId}`);
      toast.success("Property deleted");
      setOpen(false);
      if (onDeleted) onDeleted();
      else if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {variant === "icon" && (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:text-danger-600 dark:hover:text-danger-400 transition-colors"
          title="Delete property"
        >
          <Trash2 size={16} />
        </button>
      )}
      {variant === "button" && (
        <button
          onClick={() => setOpen(true)}
          className="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400"
        >
          <Trash2 size={14} /> Delete
        </button>
      )}
      {variant === "danger" && (
        <button onClick={() => setOpen(true)} className="btn btn-danger w-full">
          <Trash2 size={16} /> Delete Property
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 animate-fade-up border border-gray-100 dark:border-slate-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle
                  size={24}
                  className="text-danger-600 dark:text-danger-400"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Delete property?
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  This action cannot be undone. All data including photos,
                  chats, reviews, and agreements will be permanently removed.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="p-1 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {propertyTitle && (
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm mb-4">
                <p className="text-gray-500 dark:text-slate-400 text-xs">
                  You're deleting:
                </p>
                <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                  {propertyTitle}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="label">
                Type{" "}
                <strong className="text-danger-600 dark:text-danger-400">
                  DELETE
                </strong>{" "}
                to confirm
              </label>
              <input
                type="text"
                className="input"
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={deleting}
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setConfirmText("");
                }}
                disabled={deleting}
                className="flex-1 btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== "DELETE"}
                className="flex-1 btn btn-danger disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Delete Forever
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
