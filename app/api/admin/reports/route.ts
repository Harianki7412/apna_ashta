import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return fail("Forbidden", 403);
    }

    const sp = new URL(req.url).searchParams;
    const status = sp.get("status") || "pending";
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = 20;

    const query: any = {};
    if (status) query.status = status;

    await connectDB();
    const [items, total] = await Promise.all([
      Report.find(query)
        .populate("property", "title images area city rent status")
        .populate("reporter", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    return ok({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return handleError(e);
  }
}
