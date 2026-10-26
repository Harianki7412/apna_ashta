"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/lib/api-client";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/favorites");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .get<any[]>("/api/favorites")
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
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
          description="Tap the heart on any property."
          actionLabel="Browse"
          actionHref="/properties"
        />
      )}
    </div>
  );
}
