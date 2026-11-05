"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapPin } from "lucide-react";

interface AdminAnalyticsChartsProps {
  revenueChart: {
    date: string;
    subscription: number;
    leadPack: number;
    agreement: number;
    total: number;
  }[];
  usersChart: { date: string; owners: number; tenants: number }[];
  listingsChart: {
    date: string;
    approved: number;
    pending: number;
    rejected: number;
  }[];
  cityChart: { city: string; count: number }[];
}

export default function AdminAnalyticsCharts({
  revenueChart,
  usersChart,
  listingsChart,
  cityChart,
}: AdminAnalyticsChartsProps) {
  return (
    <>
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Revenue Trend</h2>
        {revenueChart.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-slate-400">
            No revenue data
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="var(--chart-axis)"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--chart-tooltip-border)",
                  backgroundColor: "var(--chart-tooltip-bg)",
                  color: "var(--chart-tooltip-text)",
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
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">User Growth</h2>
          {usersChart.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-slate-400">
              No data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={usersChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="var(--chart-axis)"
                />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--chart-axis)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--chart-tooltip-border)",
                    backgroundColor: "var(--chart-tooltip-bg)",
                    color: "var(--chart-tooltip-text)",
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

        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Listings Activity</h2>
          {listingsChart.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-slate-400">
              No data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={listingsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="var(--chart-axis)"
                />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--chart-axis)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--chart-tooltip-border)",
                    backgroundColor: "var(--chart-tooltip-bg)",
                    color: "var(--chart-tooltip-text)",
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

      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-brand-600" /> City-wise Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cityChart} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              stroke="var(--chart-axis)"
            />
            <YAxis
              type="category"
              dataKey="city"
              width={100}
              tick={{ fontSize: 12 }}
              stroke="var(--chart-axis)"
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--chart-tooltip-border)",
                backgroundColor: "var(--chart-tooltip-bg)",
                color: "var(--chart-tooltip-text)",
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
    </>
  );
}
