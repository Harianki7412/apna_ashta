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

interface OwnerAnalyticsChartsProps {
  monthlyTrend: { month: string; listings: number; inquiries: number }[];
  propertyBreakdown: { name: string; views: number }[];
}

export default function OwnerAnalyticsCharts({
  monthlyTrend,
  propertyBreakdown,
}: OwnerAnalyticsChartsProps) {
  return (
    <>
      <div className="card p-6 mb-4">
        <h2 className="text-lg font-bold mb-4">Last 6 Months</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="month" stroke="var(--chart-axis)" fontSize={12} />
            <YAxis stroke="var(--chart-axis)" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--chart-tooltip-border)",
                backgroundColor: "var(--chart-tooltip-bg)",
                color: "var(--chart-tooltip-text)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="listings"
              name="Listings"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="inquiries"
              name="Inquiries"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Top Properties by Views</h2>
        {propertyBreakdown.length === 0 ? (
          <p className="text-gray-500">No properties</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis type="number" stroke="var(--chart-axis)" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--chart-axis)"
                fontSize={12}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--chart-tooltip-border)",
                  backgroundColor: "var(--chart-tooltip-bg)",
                  color: "var(--chart-tooltip-text)",
                }}
              />
              <Bar dataKey="views" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
