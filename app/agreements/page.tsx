"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "@/lib/api-client";
import AgreementCard from "@/components/AgreementCard";
import { EmptyState } from "@/components/EmptyState";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import { FileText } from "lucide-react";
import type { AgreementListResponse } from "@/types";

export default function AgreementsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [data, setData] = useState<AgreementListResponse>({
    asOwner: [],
    asTenant: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/agreements");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .get<AgreementListResponse>("/api/agreements")
      .then(setData)
      .catch((error: unknown) =>
        toast.error(getErrorMessage(error, "Could not load agreements")),
      )
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <PageShell className="max-w-4xl mx-auto">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  const received = data.asTenant;
  const sent = data.asOwner;
  const current = tab === "received" ? received : sent;

  return (
    <PageShell className="max-w-4xl mx-auto">
      <SectionHeader
        icon={FileText}
        title="Rent Agreements"
        description={
          tab === "received"
            ? "Agreements sent to you — review and confirm"
            : "Agreements you sent to tenants"
        }
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("received")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === "received"
              ? "bg-brand-600 text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Received ({received.length})
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === "sent"
              ? "bg-brand-600 text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          Sent ({sent.length})
        </button>
      </div>

      {current.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={
              tab === "received"
                ? "No agreements received"
                : "No agreements sent"
            }
            description={
              tab === "received"
                ? "You'll see rent agreements sent by owners here."
                : "Send agreements from any of your property detail pages."
            }
            actionLabel={tab === "sent" ? "My Properties" : undefined}
            actionHref={tab === "sent" ? "/dashboard" : undefined}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {current.map((a) => (
            <AgreementCard
              key={a._id}
              agreement={a}
              role={tab === "received" ? "tenant" : "owner"}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
