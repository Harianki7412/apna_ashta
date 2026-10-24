"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function FavoriteButton({ propertyId }: { propertyId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    api
      .get<any[]>("/api/favorites")
      .then((favs) => setSaved(favs.some((p) => p._id === propertyId)))
      .catch(() => {});
  }, [session, propertyId]);

  async function toggle() {
    if (!session) return router.push("/login");
    setLoading(true);
    try {
      const { saved: s } = await api.post<{ saved: boolean }>(
        "/api/favorites",
        { propertyId },
      );
      setSaved(s);
      toast.success(s ? "Saved" : "Removed");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-2 rounded-full bg-white shadow hover:bg-gray-50 transition ${saved ? "text-red-500" : "text-gray-400"}`}
    >
      <Heart size={20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
