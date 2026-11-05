import Link from "next/link";
import Image from "next/image";
import { requireAuth } from "@/lib/require-auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { Favorite } from "@/models/Favorite";
import { Conversation } from "@/models/Conversation";
import FeaturePropertyButton from "@/components/FeaturePropertyButton";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import AvailabilityConfirmationButton from "@/components/AvailabilityConfirmationButton";
import { getListingFreshness } from "@/lib/property-freshness";
import { EmptyState } from "@/components/EmptyState";
import { hasOwnerAccess } from "@/lib/role-access";
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
  Search,
  ArrowRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";

type DashboardSearchParams = Promise<{
  q?: string | string[];
  status?: string | string[];
  sort?: string | string[];
}>;

export default async function Dashboard({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const session = await requireAuth("/dashboard");
  const role = (session.user as any).role;
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q.trim() : "";
  const selectedStatus =
    typeof params.status === "string" &&
    ["pending", "approved", "rejected", "rented"].includes(params.status)
      ? params.status
      : "all";
  const sort =
    typeof params.sort === "string" &&
    ["newest", "rent-low", "rent-high", "views"].includes(params.sort)
      ? params.sort
      : "newest";

  if (!hasOwnerAccess(role)) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard
            size={36}
            className="text-brand-400 dark:text-brand-500"
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tenant Account</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-6">
          You're browsing as a tenant. To list properties, you need an owner
          account.
        </p>
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
  const propertyIds = props.map((property) => property._id);
  const [totalFavorites, totalInquiries] = await Promise.all([
    Favorite.countDocuments({ property: { $in: propertyIds } }),
    Conversation.countDocuments({ property: { $in: propertyIds } }),
  ]);

  const stats = {
    total: props.length,
    approved: props.filter((p: any) => p.status === "approved").length,
    pending: props.filter((p: any) => p.status === "pending").length,
    totalViews: props.reduce((s, p: any) => s + (p.views || 0), 0),
    totalFavorites,
    totalInquiries,
  };
  const visibleProperties = props
    .filter((property: any) => {
      const matchesStatus =
        selectedStatus === "all" || property.status === selectedStatus;
      const searchText =
        `${property.title || ""} ${property.area || ""}`.toLowerCase();
      return (
        matchesStatus && (!search || searchText.includes(search.toLowerCase()))
      );
    })
    .sort((a: any, b: any) => {
      if (sort === "rent-low") return a.rent - b.rent;
      if (sort === "rent-high") return b.rent - a.rent;
      if (sort === "views") return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 rounded-2xl border border-brand-100 dark:border-brand-900/50 bg-gradient-to-br from-white via-brand-50/60 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/40 p-5 md:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300 mb-2">
            Owner workspace
          </p>
          <h1 className="text-2xl md:text-3xl font-bold">
            Good to see you, {session.user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Keep your listings up to date and see how they're performing.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="btn btn-primary self-start md:self-auto"
        >
          <Plus size={16} /> List New Property
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="card p-4 md:p-5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-3">
            <Home size={18} className="text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Total listings</p>
        </div>
        <div className="card p-4 md:p-5">
          <div className="w-9 h-9 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center mb-3">
            <CheckCircle2 size={18} className="text-success-600 dark:text-success-400" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums">{stats.approved}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Live</p>
        </div>
        <div className="card p-4 md:p-5">
          <div className="w-9 h-9 rounded-xl bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center mb-3">
            <Clock size={18} className="text-warning-600 dark:text-warning-400" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums">{stats.pending}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">In review</p>
        </div>
        <div className="card p-4 md:p-5">
          <div className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mb-3">
            <Eye size={18} className="text-accent-600 dark:text-accent-400" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums">
            {stats.totalViews.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Property views</p>
        </div>
        <div className="card p-4 md:p-5">
          <div className="w-9 h-9 rounded-xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mb-3">
            <Star size={18} className="text-accent-600 dark:text-accent-400" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums">
            {stats.totalFavorites.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Favorites</p>
        </div>
        <div className="card p-4 md:p-5">
          <div className="w-9 h-9 rounded-xl bg-success-50 dark:bg-success-900/20 flex items-center justify-center mb-3">
            <MessageCircle size={18} className="text-success-600 dark:text-success-400" />
          </div>
          <p className="text-2xl font-extrabold tabular-nums">
            {stats.totalInquiries.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Enquiries</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          href="/chat"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-600 transition-all group"
        >
          <MessageCircle
            size={20}
            className="text-brand-600 dark:text-brand-400"
          />
          <span className="text-sm font-semibold flex-1">Messages</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/dashboard/analytics"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-600 transition-all group"
        >
          <BarChart3 size={20} className="text-brand-600 dark:text-brand-400" />
          <span className="text-sm font-semibold flex-1">Analytics</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/saved-searches"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-600 transition-all group"
        >
          <TrendingUp
            size={20}
            className="text-brand-600 dark:text-brand-400"
          />
          <span className="text-sm font-semibold flex-1">Searches</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
        <Link
          href="/profile"
          className="card p-4 flex items-center gap-3 hover:border-brand-300 dark:hover:border-brand-600 transition-all group"
        >
          <Star size={20} className="text-brand-600 dark:text-brand-400" />
          <span className="text-sm font-semibold flex-1">Profile</span>
          <ArrowRight
            size={14}
            className="text-gray-400 group-hover:text-brand-600"
          />
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">My Properties</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Showing {visibleProperties.length} of {props.length} listings
              </p>
            </div>
            <form
              action="/dashboard"
              className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-4xl xl:grid-cols-[minmax(12rem,1fr)_9rem_10rem_auto]"
            >
              <label className="sr-only" htmlFor="dashboard-search">
                Search properties
              </label>
              <input
                id="dashboard-search"
                name="q"
                type="search"
                defaultValue={search}
                placeholder="Search title or area"
                className="input"
              />
              <label className="sr-only" htmlFor="dashboard-status">
                Filter by status
              </label>
              <select
                id="dashboard-status"
                name="status"
                defaultValue={selectedStatus}
                className="input"
              >
                <option value="all">All statuses</option>
                <option value="approved">Live</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="rented">Rented</option>
              </select>
              <label className="sr-only" htmlFor="dashboard-sort">
                Sort properties
              </label>
              <select
                id="dashboard-sort"
                name="sort"
                defaultValue={sort}
                className="input"
              >
                <option value="newest">Newest first</option>
                <option value="rent-low">Rent: low to high</option>
                <option value="rent-high">Rent: high to low</option>
                <option value="views">Most viewed</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">
                  Apply
                </button>
                {(search || selectedStatus !== "all" || sort !== "newest") && (
                  <Link href="/dashboard" className="btn btn-secondary">
                    Reset
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>
        {props.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No properties yet"
            description="List your first property to start receiving tenant inquiries."
            actionLabel="Add Property"
            actionHref="/properties/new"
          />
        ) : visibleProperties.length === 0 ? (
          <div className="p-10 text-center">
            <Search size={28} className="text-gray-400 mx-auto mb-3" />
            <p className="font-semibold">No listings match these filters</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Try a different search or reset your filters.
            </p>
            <Link href="/dashboard" className="btn btn-secondary btn-sm mt-4">
              Reset filters
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {visibleProperties.map((p: any) => (
              <div
                key={p._id.toString()}
                className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {p.images?.[0] ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
                      <Image
                        src={p.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                      <Home size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/properties/${p._id}`}
                        className="font-semibold hover:text-brand-600 dark:hover:text-brand-400 truncate"
                      >
                        {p.title}
                      </Link>
                      <span
                        className={`badge ${
                          p.status === "approved"
                            ? "badge-success"
                            : p.status === "rejected"
                              ? "badge-danger"
                              : "badge-warning"
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.featured && (
                        <span className="badge badge-featured">⭐</span>
                      )}
                      {p.status === "approved" &&
                        getListingFreshness(
                          p.createdAt,
                          p.lastAvailabilityConfirmedAt,
                        ).isStale && (
                          <span className="badge badge-warning">
                            Availability needs confirmation
                          </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                      ₹{p.rent.toLocaleString("en-IN")}/mo · {p.area}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {p.status === "approved" && (
                    <AvailabilityConfirmationButton
                      propertyId={p._id.toString()}
                      isStale={getListingFreshness(
                        p.createdAt,
                        p.lastAvailabilityConfirmedAt,
                      ).isStale}
                    />
                  )}
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
