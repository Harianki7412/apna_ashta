import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";

function escapeCSV(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  try {
    const s = await getServerSession(authOptions);
    if ((s?.user as any)?.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }

    const type = new URL(req.url).searchParams.get("type");
    await connectDB();

    let csv = "";
    let filename = "export.csv";

    if (type === "users") {
      const users = await User.find({})
        .select("name email phone role kycStatus blocked createdAt")
        .lean();
      csv =
        "Name,Email,Phone,Role,KYC,Blocked,Joined\n" +
        users
          .map((u: any) =>
            [
              escapeCSV(u.name),
              escapeCSV(u.email),
              escapeCSV(u.phone),
              escapeCSV(u.role),
              escapeCSV(u.kycStatus),
              u.blocked ? "Yes" : "No",
              escapeCSV(u.createdAt?.toISOString?.()),
            ].join(","),
          )
          .join("\n");
      filename = "users.csv";
    } else if (type === "properties") {
      const props = await Property.find({})
        .populate("owner", "name email")
        .lean();
      csv =
        "Title,Type,BHK,City,Area,Rent,Deposit,Status,Owner,Owner Email,Created\n" +
        props
          .map((p: any) =>
            [
              escapeCSV(p.title),
              escapeCSV(p.propertyType),
              escapeCSV(p.bhk),
              escapeCSV(p.city),
              escapeCSV(p.area),
              p.rent,
              p.deposit,
              escapeCSV(p.status),
              escapeCSV(p.owner?.name),
              escapeCSV(p.owner?.email),
              escapeCSV(p.createdAt?.toISOString?.()),
            ].join(","),
          )
          .join("\n");
      filename = "properties.csv";
    } else {
      return new Response("Invalid type", { status: 400 });
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
}
