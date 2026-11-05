"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const AdminAnalyticsCharts = dynamic(
  () => import("@/components/AdminAnalyticsCharts"),
  {
    loading: () => <div className="skeleton h-[1000px] rounded-2xl" />,
  },
);

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get<any>(`/api/admin/analytics?days=${days}`)
      .then(setData)
      .catch((e) => {
        const message =
          e instanceof Error ? e.message : "Unable to load analytics.";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [days, retryKey]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (error) {
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
  }

  if (!data) {
    return (
      <div className="card p-10 text-center text-sm text-gray-500 dark:text-slate-400">
        No analytics data is available yet.
      </div>
    );
  }

  const { kpis, revenueChart, usersChart, listingsChart, cityChart } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Track your platform performance
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="input w-32"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="w-10 h-10 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 flex items-center justify-center mb-2">
            <DollarSign size={20} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
            ₹{kpis.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Total Revenue
          </p>
        </div>

        <div className="card p-4">
          <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-2">
            <Users size={20} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
            {kpis.totalNewUsers}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">New Users</p>
        </div>

        <div className="card p-4">
          <div className="w-10 h-10 rounded-lg bg-accent-400/20 text-accent-600 dark:text-accent-400 flex items-center justify-center mb-2">
            <Building2 size={20} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
            {kpis.totalNewListings}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            New Listings
          </p>
        </div>

        <div className="card p-4">
          <div className="w-10 h-10 rounded-lg bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400 flex items-center justify-center mb-2">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">
            ₹{kpis.avgRevenuePerDay.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Avg Revenue/Day
          </p>
        </div>
      </div>

      <AdminAnalyticsCharts
        revenueChart={revenueChart}
        usersChart={usersChart}
        listingsChart={listingsChart}
        cityChart={cityChart}
      />
    </div>
  );
}
