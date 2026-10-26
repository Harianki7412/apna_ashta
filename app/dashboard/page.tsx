import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/require-auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import FeaturePropertyButton from "@/components/FeaturePropertyButton";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import { EmptyState } from "@/components/EmptyState";
import {
  Plus,
  Home,
  Clock,
  CheckCircle2,
  Eye,
  Edit3,
  LayoutDashboard,
  MessageCircle,
  Star,
  ArrowRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";

export default async function Dashboard() {
  const session = await requireAuth("/dashboard");
  const role = (session.user as any).role;

  if (!["owner", "admin"].includes(role)) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard size={36} className="text-brand-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tenant Account</h1>
        <p className="text-gray-500 mb-6">You're browsing as a tenant.</p>
        <div className="flex gap-2 justify-center">
          <Link href="/properties" className="btn btn-primary">
            Browse
          </Link>
          <Link href="/favorites" className="btn btn-secondary">
            My Favorites
          </Link>
        </div>
      </div>
    );
  }

  await connectDB();
  const props = await Property.find({ owner: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();

  const stats = {
    total: props.length,
    approved: props.filter((p: any) => p.status === "approved").length,
    pending: props.filter((p: any) => p.status === "pending").length,
    totalViews: props.reduce((s, p: any) => s + (p.views || 0), 0),
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {session.user?.name?.split(" ")[0]}!
          </p>
        </div>
        <Link href="/properties/new" className="btn btn-primary">
          <Plus size={16} /> List New Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <Home size={20} className="text-brand-600 mb-2" />
          <p className="text-2xl font-extrabold">{stats.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="card p-4">
          <CheckCircle2 size={20} className="text-success-500 mb-2" />
          <p className="text-2xl font-extrabold">{stats.approved}</p>
          <p className="text-xs text-gray-500">Live</p>
        </div>
        <div className="card p-4">
          <Clock size={20} className="text-warning-500 mb-2" />
          <p className="text-2xl font-extrabold">{stats.pending}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="card p-4">
          <Eye size={20} className="text-accent-500 mb-2" />
          <p className="text-2xl font-extrabold">{stats.totalViews}</p>
          <p className="text-xs text-gray-500">Views</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Link
          href="/chat"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-all group"
        >
          <MessageCircle size={20} className="text-brand-600" />
          <span className="text-sm font-semibold flex-1">Messages</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/dashboard/analytics"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-all group"
        >
          <BarChart3 size={20} className="text-brand-600" />
          <span className="text-sm font-semibold flex-1">Analytics</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/saved-searches"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-all group"
        >
          <TrendingUp size={20} className="text-brand-600" />
          <span className="text-sm font-semibold flex-1">Searches</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/profile"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 transition-all group"
        >
          <Star size={20} className="text-brand-600" />
          <span className="text-sm font-semibold flex-1">Profile</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
      </div>

      {/* Properties list */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold">My Properties</h2>
        </div>
        {props.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No properties yet"
            description="List your first property."
            actionLabel="Add Property"
            actionHref="/properties/new"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {props.map((p: any) => (
              <div
                key={p._id.toString()}
                className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {p.images?.[0] ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={p.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Home size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/properties/${p._id}`}
                        className="font-semibold hover:text-brand-600 truncate"
                      >
                        {p.title}
                      </Link>
                      <span
                        className={`badge ${p.status === "approved" ? "badge-success" : p.status === "rejected" ? "badge-danger" : "badge-warning"}`}
                      >
                        {p.status}
                      </span>
                      {p.featured && (
                        <span className="badge badge-featured">⭐</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      ₹{p.rent.toLocaleString("en-IN")}/mo · {p.area}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {p.status === "approved" && !p.featured && (
                    <FeaturePropertyButton propertyId={p._id.toString()} />
                  )}
                  <Link
                    href={`/properties/${p._id}/edit`}
                    className="btn btn-ghost btn-sm"
                  >
                    <Edit3 size={14} />
                    <span className="hidden md:inline">Edit</span>
                  </Link>
                  <Link
                    href={`/properties/${p._id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    <Eye size={14} />
                    <span className="hidden md:inline">View</span>
                  </Link>
                  <DeletePropertyButton
                    propertyId={p._id.toString()}
                    propertyTitle={p.title}
                    variant="icon"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
