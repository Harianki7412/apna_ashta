"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Home,
  MessageCircle,
  Eye,
  Star,
  BarChart3,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/analytics");
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (!["owner", "admin"].includes(role)) {
        toast.error("Owner access required");
        router.push("/");
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    api
      .get<any>("/api/analytics")
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    );
  }

  if (!data)
    return (
      <div className="text-center py-16 text-gray-500">
        Could not load analytics
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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
          <Star size={20} className="text-accent-500 mb-2" />
          <p className="text-2xl font-extrabold">
            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>

      <div className="card p-6 mb-4">
        <h2 className="text-lg font-bold mb-4">Last 6 Months</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6" }}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                width={120}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6" }}
              />
              <Bar dataKey="views" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
