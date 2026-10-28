import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { RentAgreement } from "@/models/RentAgreement";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const s = await getServerSession(authOptions);
    if ((s?.user as any)?.role !== "admin") return fail("Forbidden", 403);

    const q = new URL(req.url).searchParams.get("q")?.trim();
    if (!q || q.length < 2) return ok({ results: [] });

    await connectDB();
    const regex = new RegExp(q, "i");

    const [users, properties, agreements] = await Promise.all([
      User.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }],
      })
        .limit(5)
        .select("name email role")
        .lean(),
      Property.find({
        $or: [{ title: regex }, { area: regex }, { city: regex }],
      })
        .limit(5)
        .select("title area city status")
        .lean(),
      RentAgreement.find({
        $or: [{ "details.tenantName": regex }, { "details.ownerName": regex }],
      })
        .limit(3)
        .select("status details.tenantName details.ownerName")
        .lean(),
    ]);

    const results = [
      ...users.map((u: any) => ({
        type: "user",
        id: u._id.toString(),
        title: u.name,
        subtitle: `${u.email || ""} · ${u.role}`,
        href: `/admin/users/${u._id}`,
      })),
      ...properties.map((p: any) => ({
        type: "property",
        id: p._id.toString(),
        title: p.title,
        subtitle: `${p.area}, ${p.city} · ${p.status}`,
        href: `/properties/${p._id}`,
      })),
      ...agreements.map((a: any) => ({
        type: "agreement",
        id: a._id.toString(),
        title: `Agreement — ${a.details?.tenantName || "Unknown"}`,
        subtitle: a.status,
        href: `/agreements/${a._id}`,
      })),
    ];

    return ok({ results });
  } catch (e) {
    return handleError(e);
  }
}
