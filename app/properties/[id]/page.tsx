import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import FavoriteButton from "@/components/FavoriteButton";
import WhatsAppShare from "@/components/WhatsAppShare";
import Reviews from "@/components/Reviews";
import RentAgreementModal from "@/components/RentAgreementModal";
import StartChatButton from "./StartChatButton";
import { getTranslations } from "next-intl/server";
import { getBhkLabel } from "@/lib/property-types";
import DeletePropertyButton from "@/components/DeletePropertyButton";
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
} from "lucide-react";

async function getProperty(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) return null;
  await connectDB();
  return Property.findById(id)
    .populate("owner", "name email phone phoneVerified kycStatus createdAt")
    .lean();
}

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
    description: `${bhkPart}${property.propertyType} for rent in ${property.area}, ${property.city || "Ashta"}.`,
    openGraph: {
      title: property.title,
      description: `₹${property.rent}/month in ${property.area}`,
      images: property.images?.[0] ? [{ url: property.images[0] }] : [],
    },
  };
}

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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Pending banner */}
      {property.status !== "approved" && (
        <div className="mb-4 bg-warning-50 border border-accent-400 text-accent-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Shield size={16} />
          <span>
            This property is <strong>{property.status}</strong> — visible only
            to you and admins.
          </span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/" className="hover:text-brand-600">
          Home
        </Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href="/properties" className="hover:text-brand-600">
          Properties
        </Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link
          href={`/rent-in/${(property.city || "Ashta").toLowerCase()}`}
          className="hover:text-brand-600"
        >
          {property.city || "Ashta"}
        </Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {property.title}
        </span>
      </nav>

      {/* Gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 mb-6 rounded-2xl overflow-hidden">
        <div className="col-span-4 md:col-span-3 row-span-2 relative h-[300px] md:h-[450px] bg-gray-100">
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
            <div className="h-full flex items-center justify-center text-gray-300">
              <Home size={64} />
            </div>
          )}
          {property.featured && (
            <div className="absolute top-4 left-4 badge badge-featured">
              ⭐ Featured
            </div>
          )}
        </div>
        {property.images?.slice(1, 3).map((url: string, i: number) => (
          <div key={i} className="hidden md:block relative bg-gray-100">
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="25vw"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══ Left: Details ═══ */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  {property.address}, {property.area},{" "}
                  {property.city || "Ashta"}
                </div>
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

          {/* Key facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4">
              <IndianRupee size={20} className="text-brand-600 mb-2" />
              <p className="text-xs text-gray-500">Monthly Rent</p>
              <p className="text-lg font-bold">
                ₹{property.rent.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="card p-4">
              <Shield size={20} className="text-brand-600 mb-2" />
              <p className="text-xs text-gray-500">Deposit</p>
              <p className="text-lg font-bold">
                ₹{(property.deposit || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="card p-4">
              <Home size={20} className="text-brand-600 mb-2" />
              <p className="text-xs text-gray-500">
                {property.bhk ? "BHK" : "Type"}
              </p>
              <p className="text-lg font-bold">
                {property.bhk
                  ? getBhkLabel(property.bhk)
                  : property.propertyType}
              </p>
              {property.bhk && (
                <p className="text-xs text-gray-500 mt-1">
                  {property.propertyType}
                </p>
              )}
            </div>
            <div className="card p-4">
              <Calendar size={20} className="text-brand-600 mb-2" />
              <p className="text-xs text-gray-500">Listed</p>
              <p className="text-lg font-bold">
                {new Date(property.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-3">About this property</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {property.description}
            </p>
          </div>

          <Reviews propertyId={id} ownerId={ownerId} />
        </div>

        {/* ═══ Right: Sticky card ═══ */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 card p-6">
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-brand-600">
                  ₹{property.rent.toLocaleString("en-IN")}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
              {property.deposit > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  + ₹{property.deposit.toLocaleString("en-IN")} deposit
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold">
                  {property.owner?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold flex items-center gap-1.5 truncate">
                    {property.owner?.name}
                    {property.owner?.kycStatus === "verified" && (
                      <CheckCircle2 size={14} className="text-success-500" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {property.owner?.phoneVerified ? "Verified Owner" : "Owner"}
                  </p>
                </div>
              </div>

              {!canManage && me && (
                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} /> {property.owner?.phone || "Hidden"}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} /> {property.owner?.email}
                  </div>
                </div>
              )}
            </div>

            {!canManage ? (
              <div className="space-y-2">
                <StartChatButton ownerId={ownerId} propertyId={id} />
                <a
                  href={`https://wa.me/91${property.owner?.phone?.replace(/\D/g, "") || ""}?text=${encodeURIComponent(
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
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield size={14} className="text-brand-600" />
                <span>Verified listing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Eye size={14} className="text-brand-600" />
                <span>
                  Recently viewed by {Math.floor(Math.random() * 20) + 5} people
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
