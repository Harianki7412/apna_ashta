"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CalendarClock, Loader2, X } from "lucide-react";
import { api } from "@/lib/api-client";

function localDateInputValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function VisitRequestButton({
  ownerId,
  propertyId,
  propertyTitle,
}: {
  ownerId: string;
  propertyId: string;
  propertyTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sending, setSending] = useState(false);

  async function requestVisit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/properties/${propertyId}`)}`);
      return;
    }
    if (!date || date < localDateInputValue() || !time) {
      toast.error("Choose a valid future date and time.");
      return;
    }

    setSending(true);
    try {
      const conversation = await api.post<{ _id: string }>(
        "/api/conversations",
        { otherUserId: ownerId, propertyId },
      );
      const message = `I would like to visit "${propertyTitle}" on ${date} at ${time}. Please confirm if this works for you.`;
      await api.post("/api/messages", {
        conversationId: conversation._id,
        text: message,
      });
      toast.success("Visit request sent. The owner can confirm in chat.");
      router.push(`/chat?c=${conversation._id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to request a visit.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!session) {
            router.push(
              `/login?callbackUrl=${encodeURIComponent(`/properties/${propertyId}`)}`,
            );
            return;
          }
          setOpen(true);
        }}
        className="btn btn-secondary w-full"
      >
        <CalendarClock size={16} />
        {session ? "Request a Visit" : "Login to request a visit"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visit-request-title"
        >
          <form
            onSubmit={requestVisit}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="visit-request-title" className="text-xl font-bold">
                  Request a property visit
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  The owner will confirm the time in chat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close visit request"
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block">
              <span className="label">Preferred date</span>
              <input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="input"
              />
            </label>

            <label className="block">
              <span className="label">Preferred time</span>
              <input
                required
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="input"
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Opening chat...
                </>
              ) : (
                "Continue in chat"
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
