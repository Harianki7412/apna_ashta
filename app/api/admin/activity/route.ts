import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const s = await getServerSession(authOptions);
    if ((s?.user as any)?.role !== "admin") return fail("Forbidden", 403);

    const sp = new URL(req.url).searchParams;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = 50;
    const action = sp.get("action");
    const targetType = sp.get("targetType");

    const query: any = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    await connectDB();
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate("actor", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return ok({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return handleError(e);
  }
}
