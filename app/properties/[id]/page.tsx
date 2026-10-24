import { notFound } from "next/navigation";
import Image from "next/image";
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

async function getProperty(id: string) {
  await connectDB();
  return Property.findById(id)
    .populate("owner", "name email phone phoneVerified kycStatus")
    .lean();
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const property: any = await getProperty(params.id);
  if (!property) return {};
  return {
    title: `${property.title} — ₹${property.rent}/month | Apna Ashta`,
    description: `${property.propertyType} for rent in ${property.area}, Ashta.`,
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
  params: { id: string };
}) {
  const t = await getTranslations("property");
  const property: any = await getProperty(params.id);
  if (!property) notFound();

  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.id === property.owner._id.toString();
  const isAdmin = (session?.user as any)?.role === "admin";
  const canManage = isOwner || isAdmin;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {property.images.map((url: string, i: number) => (
          <div
            key={i}
            className={`relative ${i === 0 ? "col-span-2 h-80" : "h-40"}`}
          >
            <Image src={url} alt="" fill className="object-cover rounded" />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="text-gray-600">
            {property.address}, {property.area}
          </p>
          <p className="text-2xl text-blue-600 font-bold mt-2">
            ₹{property.rent.toLocaleString("en-IN")}
            {t("perMonth")}
          </p>
        </div>
        <div className="flex gap-2">
          <WhatsAppShare
            title={property.title}
            rent={property.rent}
            area={property.area}
            propertyId={property._id.toString()}
          />
          <FavoriteButton propertyId={property._id.toString()} />
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {property.description}
        </p>
        {property.deposit > 0 && (
          <p className="mt-2 text-sm">
            <strong>{t("deposit")}:</strong> ₹{property.deposit}
          </p>
        )}
      </div>

      <div className="mt-6 p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-2">Owner</h2>
        <p>
          {property.owner.name}{" "}
          {property.owner.kycStatus === "verified" && (
            <span className="text-green-600 text-sm">✓ Verified</span>
          )}
        </p>
        <p className="text-sm text-gray-500">{property.owner.email}</p>
        {!canManage && (
          <StartChatButton
            ownerId={property.owner._id.toString()}
            propertyId={property._id.toString()}
          />
        )}
        {canManage && (
          <div className="mt-3">
            <RentAgreementModal
              propertyId={property._id.toString()}
              rent={property.rent}
              deposit={property.deposit}
            />
          </div>
        )}
      </div>

      <Reviews propertyId={property._id.toString()} />
    </div>
  );
}
