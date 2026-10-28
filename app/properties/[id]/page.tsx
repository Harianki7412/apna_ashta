import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { Conversation } from "@/models/Conversation";
import FavoriteButton from "@/components/FavoriteButton";
import WhatsAppShare from "@/components/WhatsAppShare";
import Reviews from "@/components/Reviews";
import RentAgreementModal from "@/components/RentAgreementModal";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import ReportButton from "@/components/ReportButton";
import StartChatButton from "./StartChatButton";
import { getTranslations } from "next-intl/server";
import { getBhkLabel } from "@/lib/property-types";
import { analyzePropertyForScams } from "@/lib/anti-scam";
import {
  MapPin,
  Home,
  IndianRupee,
  Shield,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Phone,
  Mail,
  Eye,
  AlertTriangle,
  Bed,
  Building2,
  Sofa,
  Car,
  Bath,
  Wifi,
  Clock,
  Users,
  IndianRupee as RupeeIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   DATA FETCHER
   ═══════════════════════════════════════════════════════════ */
async function getProperty(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  await connectDB();
  return Property.findById(id)
    .populate("owner", "name email phone phoneVerified kycStatus createdAt")
    .lean();
}

/* ═══════════════════════════════════════════════════════════
   SEO METADATA
   ═══════════════════════════════════════════════════════════ */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property: any = await getProperty(id);
  if (!property) return { title: "Not found — Flatova" };

  const bhkPart = property.bhk ? `${property.bhk} ` : "";
  return {
    title: `${bhkPart}${property.title} — ₹${property.rent}/month | Flatova`,
    description: `${bhkPart}${property.propertyType} for rent in ${property.area}, ${
      property.city || "Ashta"
    }.`,
    openGraph: {
      title: property.title,
      description: `₹${property.rent}/month in ${property.area}`,
      images: property.images?.[0] ? [{ url: property.images[0] }] : [],
    },
  };
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default async function PropertyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("property");
  const property: any = await getProperty(id);
  if (!property) notFound();

  const session = await getServerSession(authOptions);
  const me = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const ownerId = property.owner?._id?.toString();
  const canManage = me === ownerId || role === "admin";

  if (property.status !== "approved" && !canManage) notFound();

  // Increment view count (fire and forget)
  try {
    await connectDB();
    await Property.updateOne({ _id: id }, { $inc: { views: 1 } });
  } catch {}

  // ═══ Anti-scam analysis ═══
  const scamWarnings = analyzePropertyForScams(property);

  // ═══ Check if user has already chatted with owner ═══
  let hasChatted = false;
  if (me && !canManage) {
    const convo = await Conversation.exists({
      participants: me,
      property: id,
    });
    hasChatted = !!convo;
  }

  // ═══ Category-wise amenities for nice display ═══
  const furnitureAmenities = ["Furnished", "Semi-furnished"].includes(
    property.furnishing,
  )
    ? ["Sofa", "Bed", "Wardrobe", "Table"]
    : [];
  const basicAmenities = property.amenities || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* ═══ Pending status banner (owner/admin only) ═══ */}
      {property.status !== "approved" && (
        <div className="mb-4 bg-warning-50 dark:bg-warning-900/20 border border-accent-400 text-accent-700 dark:text-warning-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Shield size={16} />
          <span>
            This property is <strong>{property.status}</strong> — visible only
            to you and admins.
          </span>
        </div>
      )}

      {/* ═══ Breadcrumbs ═══ */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 mb-4 flex-wrap">
        <Link
          href="/"
          className="hover:text-brand-600 dark:hover:text-brand-400"
        >
          Home
        </Link>
        <ChevronRight size={14} className="text-gray-300 dark:text-slate-600" />
        <Link
          href="/properties"
          className="hover:text-brand-600 dark:hover:text-brand-400"
        >
          Properties
        </Link>
        <ChevronRight size={14} className="text-gray-300 dark:text-slate-600" />
        <Link
          href={`/rent-in/${(property.city || "Ashta").toLowerCase()}`}
          className="hover:text-brand-600 dark:hover:text-brand-400"
        >
          {property.city || "Ashta"}
        </Link>
        <ChevronRight size={14} className="text-gray-300 dark:text-slate-600" />
        <span className="text-gray-900 dark:text-slate-200 font-medium truncate max-w-[200px]">
          {property.title}
        </span>
      </nav>

      {/* ═══ SCAM WARNINGS ═══ */}
      {scamWarnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {scamWarnings.map((w, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border-l-4 flex items-start gap-3 ${
                w.level === "high"
                  ? "bg-danger-50 dark:bg-danger-900/20 border-danger-500"
                  : w.level === "medium"
                    ? "bg-warning-50 dark:bg-warning-900/20 border-warning-500"
                    : "bg-brand-50 dark:bg-brand-900/20 border-brand-500"
              }`}
            >
              <AlertTriangle
                size={20}
                className={`flex-shrink-0 mt-0.5 ${
                  w.level === "high"
                    ? "text-danger-600 dark:text-danger-400"
                    : w.level === "medium"
                      ? "text-warning-600 dark:text-warning-400"
                      : "text-brand-600 dark:text-brand-400"
                }`}
              />
              <div className="flex-1">
                <p
                  className={`font-semibold text-sm ${
                    w.level === "high"
                      ? "text-danger-700 dark:text-danger-300"
                      : w.level === "medium"
                        ? "text-warning-700 dark:text-warning-300"
                        : "text-brand-700 dark:text-brand-300"
                  }`}
                >
                  {w.level === "high"
                    ? "⚠️ High Risk Warning"
                    : w.level === "medium"
                      ? "Caution"
                      : "Note"}
                </p>
                <p
                  className={`text-sm mt-0.5 ${
                    w.level === "high"
                      ? "text-danger-600 dark:text-danger-400"
                      : w.level === "medium"
                        ? "text-warning-600 dark:text-warning-400"
                        : "text-brand-600 dark:text-brand-400"
                  }`}
                >
                  {w.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ GALLERY ═══ */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 mb-6 rounded-2xl overflow-hidden">
        <div className="col-span-4 md:col-span-3 row-span-2 relative h-[300px] md:h-[450px] bg-gray-100 dark:bg-slate-700">
          {property.images?.[0] ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300 dark:text-slate-500">
              <Home size={64} />
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {property.verified && (
              <div className="bg-success-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Shield size={12} /> Physically Verified
              </div>
            )}
            {property.featured && (
              <div className="badge badge-featured">⭐ Featured</div>
            )}
          </div>

          {/* Photo count */}
          {property.images?.length > 1 && (
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white text-sm font-medium px-3 py-1.5 rounded-full">
              📷 {property.images.length} photos
            </div>
          )}
        </div>

        {property.images?.slice(1, 3).map((url: string, i: number) => (
          <div
            key={i}
            className="hidden md:block relative bg-gray-100 dark:bg-slate-700"
          >
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="25vw"
            />
            {i === 1 && property.images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                +{property.images.length - 3} more
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════════════════════════════════════════════════
            LEFT COLUMN — Details
            ═══════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + Actions */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {property.verified && (
                    <span className="badge badge-success flex items-center gap-1">
                      <Shield size={12} /> Verified
                    </span>
                  )}
                  <span className="badge badge-brand">
                    {property.propertyType}
                  </span>
                  {property.bhk && (
                    <span className="badge badge-brand">
                      {getBhkLabel(property.bhk)}
                    </span>
                  )}
                  {property.status === "rented" && (
                    <span className="badge badge-danger">Rented</span>
                  )}
                  {property.reportCount >= 3 && (
                    <span className="badge badge-danger flex items-center gap-1">
                      <AlertTriangle size={10} /> Reported
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-slate-100">
                  {property.title}
                </h1>

                <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                  <MapPin size={16} />
                  {property.address}, {property.area},{" "}
                  {property.city || "Ashta"}
                </div>

                {property.views > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 mt-2">
                    <Eye size={12} />
                    {property.views} view{property.views !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <FavoriteButton propertyId={id} />
                <WhatsAppShare
                  title={property.title}
                  rent={property.rent}
                  area={property.area}
                  propertyId={id}
                />
              </div>
            </div>
          </div>

          {/* ═══ Key Facts ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4">
              <IndianRupee
                size={20}
                className="text-brand-600 dark:text-brand-400 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Monthly Rent
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                ₹{property.rent.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="card p-4">
              <Shield
                size={20}
                className="text-brand-600 dark:text-brand-400 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Deposit
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                ₹{(property.deposit || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="card p-4">
              <Bed
                size={20}
                className="text-brand-600 dark:text-brand-400 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {property.bhk ? "BHK" : "Type"}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                {property.bhk
                  ? getBhkLabel(property.bhk)
                  : property.propertyType}
              </p>
            </div>
            <div className="card p-4">
              <Calendar
                size={20}
                className="text-brand-600 dark:text-brand-400 mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Listed
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                {new Date(property.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {/* ═══ Description ═══ */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-slate-100">
              About this property
            </h2>
            <p className="text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* ═══ Property Details Grid ═══ */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">
              Property Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <Sofa
                  size={18}
                  className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Furnishing
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {property.furnishing || "Unfurnished"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bath
                  size={18}
                  className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Bathrooms
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {property.bathrooms || 1}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Car
                  size={18}
                  className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Parking
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {property.parking || "None"}
                  </p>
                </div>
              </div>
              {property.maintenanceCharge > 0 && (
                <div className="flex items-start gap-2">
                  <RupeeIcon
                    size={18}
                    className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Maintenance
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      ₹{property.maintenanceCharge.toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                </div>
              )}
              {property.availableFrom && (
                <div className="flex items-start gap-2">
                  <Clock
                    size={18}
                    className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Available
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {new Date(property.availableFrom).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
              )}
              {property.preferredTenants?.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users
                    size={18}
                    className="text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Preferred Tenants
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {property.preferredTenants.join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Amenities ═══ */}
          {basicAmenities.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {basicAmenities.map((amenity: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-success-500 flex-shrink-0"
                    />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Reviews ═══ */}
          <Reviews propertyId={id} ownerId={ownerId} />
        </div>

        {/* ═══════════════════════════════════════════════════
            RIGHT COLUMN — Sticky Sidebar
            ═══════════════════════════════════════════════════ */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 card p-6">
            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                  ₹{property.rent.toLocaleString("en-IN")}
                </span>
                <span className="text-gray-500 dark:text-slate-400">
                  /month
                </span>
              </div>
              {property.deposit > 0 && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  + ₹{property.deposit.toLocaleString("en-IN")} deposit
                </p>
              )}
            </div>

            {/* Owner info */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-lg">
                  {property.owner?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold flex items-center gap-1.5 truncate text-gray-900 dark:text-slate-100">
                    {property.owner?.name}
                    {property.owner?.kycStatus === "verified" && (
                      <CheckCircle2
                        size={14}
                        className="text-success-500 flex-shrink-0"
                      />
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {property.owner?.phoneVerified
                      ? "✓ Verified Owner"
                      : "Owner"}
                  </p>
                </div>
              </div>

              {/* Contact info (only for logged-in non-owner) */}
              {!canManage && me && (
                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <Phone size={14} />
                    {property.owner?.phone || "Hidden"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <Mail size={14} />
                    <span className="truncate">{property.owner?.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {!canManage ? (
              <div className="space-y-2">
                <StartChatButton
                  ownerId={ownerId || ""}
                  propertyId={id}
                  hasChatted={hasChatted}
                />
                <a
                  href={`https://wa.me/91${
                    property.owner?.phone?.replace(/\D/g, "") || ""
                  }?text=${encodeURIComponent(
                    `Hi! Interested in "${property.title}"`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp w-full"
                >
                  <Phone size={16} /> Contact on WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <RentAgreementModal
                  propertyId={id}
                  rent={property.rent}
                  deposit={property.deposit}
                />
                <Link
                  href={`/properties/${id}/edit`}
                  className="btn btn-secondary w-full"
                >
                  Edit Property
                </Link>
                <DeletePropertyButton
                  propertyId={id}
                  propertyTitle={property.title}
                  variant="danger"
                  redirectTo="/dashboard"
                />
              </div>
            )}

            {/* Trust signals */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-2">
              {property.verified ? (
                <div className="flex items-center gap-2 text-xs text-success-600 dark:text-success-400">
                  <Shield size={14} />
                  <span className="font-semibold">
                    Physically Verified by Team
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                  <Shield
                    size={14}
                    className="text-brand-600 dark:text-brand-400"
                  />
                  <span>Admin Approved Listing</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400">
                <Eye size={14} className="text-brand-600 dark:text-brand-400" />
                <span>
                  {property.views || 0} people have viewed this property
                </span>
              </div>
            </div>
          </div>

          {/* ═══ Report Button ═══ */}
          <div className="mt-4 text-center">
            <ReportButton propertyId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
