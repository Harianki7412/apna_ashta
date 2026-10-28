"use client";
import { useEffect, useState } from "react";
import {
  Star,
  MessageCircle,
  Lock,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";

export default function Reviews({
  propertyId,
  ownerId,
}: {
  propertyId: string;
  ownerId?: string;
}) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hasChatted, setHasChatted] = useState<boolean | null>(null);
  const [myReview, setMyReview] = useState<any>(null);

  async function load() {
    setLoading(true);
    try {
      const d = await api.get<{
        reviews: any[];
        avgRating: number;
        count: number;
      }>(`/api/reviews?property=${propertyId}`);
      setReviews(d.reviews || []);
      setAvg(d.avgRating || 0);
      setCount(d.count || 0);
      if (session?.user && (session.user as any).id) {
        const mine = (d.reviews || []).find(
          (r: any) => (r.author?._id || r.author) === (session.user as any).id,
        );
        setMyReview(mine || null);
      }
    } catch (e: any) {
      console.error("[Reviews load]", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status !== "authenticated") {
      setHasChatted(null);
      return;
    }
    api
      .get<any[]>("/api/conversations")
      .then((convos) => {
        const hasConvo = convos.some((c: any) => {
          const propId =
            typeof c.property === "object" ? c.property?._id : c.property;
          return propId === propertyId;
        });
        setHasChatted(hasConvo);
      })
      .catch(() => setHasChatted(false));
  }, [status, propertyId, session]);

  useEffect(() => {
    load();
  }, [propertyId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!comment.trim() && !rating)
      return toast.error("Please provide a rating");
    setSubmitting(true);
    try {
      await api.post("/api/reviews", {
        propertyId,
        rating,
        comment: comment.trim(),
      });
      setComment("");
      setRating(5);
      await load();
      toast.success("Review posted!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const isLoggedIn = status === "authenticated";
  const isOwner =
    isLoggedIn && ownerId && (session?.user as any).id === ownerId;
  const canReview = isLoggedIn && !isOwner && !myReview && hasChatted === true;

  return (
    <div className="mt-8 card p-6">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          Reviews
        </h2>
        {count > 0 && (
          <span className="flex items-center gap-1 text-accent-500 dark:text-accent-400 text-sm font-semibold">
            <Star size={16} fill="currentColor" />
            {avg.toFixed(1)} · {count} review{count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {canReview && (
        <form
          onSubmit={submit}
          className="mb-4 pb-4 border-b border-gray-100 dark:border-slate-700"
        >
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  fill={n <= rating ? "#f59e0b" : "none"}
                  color="#f59e0b"
                />
              </button>
            ))}
            <span className="text-sm text-gray-500 dark:text-slate-400 self-center ml-2">
              {rating} / 5
            </span>
          </div>
          <textarea
            placeholder="Share your experience with this property..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {comment.length}/500
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </div>
        </form>
      )}

      {!isLoggedIn && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm text-gray-600 dark:text-slate-400 flex items-start gap-2">
          <Lock size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <Link
              href="/login"
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            >
              Login
            </Link>{" "}
            to leave a review.
          </div>
        </div>
      )}

      {isOwner && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm text-gray-600 dark:text-slate-400 flex items-start gap-2">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <div>You can't review your own property.</div>
        </div>
      )}

      {isLoggedIn && !isOwner && hasChatted === false && !myReview && (
        <div className="mb-4 p-3 bg-warning-50 dark:bg-warning-900/20 border border-accent-400 dark:border-accent-600 rounded-lg text-sm flex items-start gap-2">
          <MessageCircle
            size={16}
            className="text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="font-medium text-warning-700 dark:text-warning-300">
              Chat with owner first
            </p>
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-0.5">
              After you contact the owner, you can leave a review.
            </p>
          </div>
        </div>
      )}

      {myReview && (
        <div className="mb-4 p-3 bg-success-50 dark:bg-success-900/20 border border-success-500 dark:border-success-600 rounded-lg text-sm flex items-start gap-2">
          <CheckCircle2
            size={16}
            className="text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="font-medium text-success-700 dark:text-success-300">
              Your review
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={12}
                  fill={n <= myReview.rating ? "#f59e0b" : "none"}
                  color="#f59e0b"
                />
              ))}
            </div>
            {myReview.comment && (
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                {myReview.comment}
              </p>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews
            .filter((r) => !myReview || r._id !== myReview._id)
            .map((r) => (
              <div
                key={r._id}
                className="border-b border-gray-100 dark:border-slate-700 pb-3 last:border-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {r.author?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-gray-900 dark:text-slate-100">
                      {r.author?.name || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={10}
                          fill={n <= r.rating ? "#f59e0b" : "none"}
                          color="#f59e0b"
                        />
                      ))}
                      <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
                        {r.createdAt
                          ? formatDistanceToNow(new Date(r.createdAt), {
                              addSuffix: true,
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700 dark:text-slate-300 mt-2 leading-relaxed">
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          {reviews.length === 0 && (
            <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-6">
              No reviews yet. Be the first!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
