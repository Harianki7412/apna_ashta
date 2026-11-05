"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function AvailabilityConfirmationButton({
  propertyId,
  isStale,
}: {
  propertyId: string;
  isStale: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function confirmAvailability() {
    setConfirming(true);
    try {
      await api.post(`/api/properties/${propertyId}/availability`);
      toast.success("Availability confirmed. Your listing is visible again.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not confirm availability.",
      );
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isStale ? (
        <button
          type="button"
          onClick={confirmAvailability}
          disabled={confirming}
          className="btn btn-secondary btn-sm disabled:opacity-50"
        >
          {confirming ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle2 size={14} />
          )}
          {confirming ? "Confirming..." : "Confirm still available"}
        </button>
      ) : (
        <span className="text-xs text-success-700 dark:text-success-300">
          Availability recently confirmed
        </span>
      )}
    </div>
  );
}
