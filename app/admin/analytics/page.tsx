"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  MapPin,
  Loader2,
} from "lucide-react";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    api
      .get<any>(`/api/admin/analytics?days=${days}`)
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading || !data) {
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

      {/* Revenue Chart */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Revenue Trend</h2>
        {revenueChart.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-slate-400">
            No revenue data
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="subscription"
                name="Subscription"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="leadPack"
                name="Lead Pack"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="agreement"
                name="Agreement"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#8b5cf6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">User Growth</h2>
          {usersChart.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-slate-400">
              No data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={usersChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Bar dataKey="owners" name="Owners" fill="#2563eb" />
                <Bar dataKey="tenants" name="Tenants" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Listings Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Listings Activity</h2>
          {listingsChart.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-slate-400">
              No data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={listingsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Bar dataKey="approved" name="Approved" fill="#10b981" />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                <Bar dataKey="rejected" name="Rejected" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* City Breakdown */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-brand-600" /> City-wise Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cityChart} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis
              type="category"
              dataKey="city"
              width={100}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="count"
              name="Listings"
              fill="#2563eb"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
