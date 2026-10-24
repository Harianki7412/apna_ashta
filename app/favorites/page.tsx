"use client";
import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { api } from "@/lib/api-client";

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>("/api/favorites")
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Favorites</h1>
      {loading ? (
        <p>Loading...</p>
      ) : items.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No favorites yet.</p>
      )}
    </div>
  );
}
