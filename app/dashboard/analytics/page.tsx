"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { hasOwnerAccess } from "@/lib/role-access";
import {
  ArrowLeft,
  Home,
  MessageCircle,
  Eye,
  Star,
  Heart,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const OwnerAnalyticsCharts = dynamic(
  () => import("@/components/OwnerAnalyticsCharts"),
  {
    loading: () => <div className="skeleton h-[630px] rounded-2xl" />,
  },
);

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/analytics");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (!hasOwnerAccess(role)) {
        toast.error("Owner access required");
        router.push("/");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError("");
    api
      .get<any>("/api/analytics")
      .then(setData)
      .catch((e) => {
        const message =
          e instanceof Error ? e.message : "Unable to load analytics.";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [status, retryKey]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    );
  }

  if (error)
    return (
      <div role="alert" className="card mx-auto max-w-xl p-8 text-center">
        <AlertTriangle size={32} className="text-danger-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold">Analytics could not be loaded</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">{error}</p>
        <button
          onClick={() => setRetryKey((key) => key + 1)}
          className="btn btn-secondary btn-sm mt-5"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );

  if (!data)
    return (
      <div className="card p-10 text-center text-gray-500 dark:text-slate-400">
        No analytics data is available yet.
      </div>
    );

  const { stats, monthlyTrend, propertyBreakdown } = data;

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 mb-4"
      >
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="card p-4">
          <Home size={20} className="text-brand-600 mb-2" />
          <p className="text-2xl font-extrabold">{stats.total}</p>
          <p className="text-xs text-gray-500">Listings</p>
        </div>
        <div className="card p-4">
          <Eye size={20} className="text-accent-500 mb-2" />
          <p className="text-2xl font-extrabold">{stats.totalViews}</p>
          <p className="text-xs text-gray-500">Views</p>
        </div>
        <div className="card p-4">
          <MessageCircle size={20} className="text-success-500 mb-2" />
          <p className="text-2xl font-extrabold">{stats.totalChats}</p>
          <p className="text-xs text-gray-500">Inquiries</p>
        </div>
        <div className="card p-4">
          <Heart size={20} className="text-danger-500 mb-2" />
          <p className="text-2xl font-extrabold">{stats.totalFavorites}</p>
          <p className="text-xs text-gray-500">Favorites</p>
        </div>
        <div className="card p-4">
          <Star size={20} className="text-accent-500 mb-2" />
          <p className="text-2xl font-extrabold">
            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>

      <OwnerAnalyticsCharts
        monthlyTrend={monthlyTrend}
        propertyBreakdown={propertyBreakdown}
      />
    </div>
  );
}
