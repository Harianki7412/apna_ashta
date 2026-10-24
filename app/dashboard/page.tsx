import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import Link from "next/link";
import FeaturePropertyButton from "@/components/FeaturePropertyButton";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  if (!["owner", "admin"].includes(role)) {
    return (
      <p className="text-center mt-12">
        Tenants can browse{" "}
        <Link href="/properties" className="text-blue-600 underline">
          properties
        </Link>{" "}
        or view{" "}
        <Link href="/favorites" className="text-blue-600 underline">
          favorites
        </Link>
        .
      </p>
    );
  }
  await connectDB();
  const props = await Property.find({ owner: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <Link
          href="/properties/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add New
        </Link>
      </div>
      <div className="space-y-3">
        {props.map((p: any) => (
          <div
            key={p._id.toString()}
            className="bg-white p-4 rounded shadow flex justify-between items-center flex-wrap gap-2"
          >
            <div className="flex-1">
              <Link
                href={`/properties/${p._id}`}
                className="font-semibold hover:underline"
              >
                {p.title}
              </Link>
              <p className="text-sm text-gray-500">
                ₹{p.rent} · {p.area} · {p.propertyType}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {p.featured && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                  ⭐ Featured
                </span>
              )}
              {p.status === "approved" && !p.featured && (
                <FeaturePropertyButton propertyId={p._id.toString()} />
              )}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  p.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : p.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.status}
              </span>
            </div>
          </div>
        ))}
        {!props.length && (
          <p className="text-gray-500">
            No properties yet. Start by clicking "Add New".
          </p>
        )}
      </div>
    </div>
  );
}
