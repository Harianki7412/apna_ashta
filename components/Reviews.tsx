"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";

export default function Reviews({ propertyId }: { propertyId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function load() {
    try {
      const d = await api.get<{ reviews: any[]; avgRating: number }>(
        `/api/reviews?property=${propertyId}`,
      );
      setReviews(d.reviews);
      setAvg(d.avgRating);
    } catch {}
  }
  useEffect(() => {
    load();
  }, [propertyId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/reviews", { propertyId, rating, comment });
      setComment("");
      load();
      toast.success("Review posted");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="mt-8 bg-white p-4 rounded shadow">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1 text-yellow-600 text-sm">
            <Star size={16} fill="currentColor" /> {avg.toFixed(1)} (
            {reviews.length})
          </span>
        )}
      </div>

      {session && (
        <form onSubmit={submit} className="mb-4 border-b pb-4">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}>
                <Star
                  size={20}
                  fill={n <= rating ? "#f59e0b" : "none"}
                  color="#f59e0b"
                />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border p-2 rounded"
            rows={2}
          />
          <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm">
            Post
          </button>
        </form>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="border-b pb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{r.author?.name}</span>
              <span className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={12}
                    fill={n <= r.rating ? "#f59e0b" : "none"}
                    color="#f59e0b"
                  />
                ))}
              </span>
            </div>
            {r.comment && (
              <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
            )}
          </div>
        ))}
        {!reviews.length && (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
