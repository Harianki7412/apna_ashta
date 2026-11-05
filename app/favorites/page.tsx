"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PropertyCard from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { api, getErrorMessage } from "@/lib/api-client";
import { Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SectionHeader } from "@/components/SectionHeader";
import type { PropertySummary } from "@/types";

export default function FavoritesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/favorites");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .get<PropertySummary[]>("/api/favorites")
      .then(setItems)
      .catch((error: unknown) =>
        toast.error(getErrorMessage(error, "Could not load favorites")),
      )
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <PageShell className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="mx-auto w-full">
      <SectionHeader title="My Favorites" />
      {items.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any property to save it here."
          actionLabel="Browse Properties"
          actionHref="/properties"
        />
      )}
    </PageShell>
  );
}
