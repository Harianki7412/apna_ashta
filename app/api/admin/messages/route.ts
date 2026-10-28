import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ContactMessage } from "@/models/ContactMessage";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const sp = new URL(req.url).searchParams;
    const status = sp.get("status") || "";
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = 20;

    const query: any = {};
    if (status) query.status = status;

    await connectDB();
    const [messages, total] = await Promise.all([
      ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(query),
    ]);

    return ok({ messages, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const { id, status } = await req.json();
    if (!["new", "read", "replied", "closed"].includes(status))
      return fail("Invalid status");

    await connectDB();
    await ContactMessage.findByIdAndUpdate(id, { status });
    return ok({ updated: true });
  } catch (e) {
    return handleError(e);
  }
}
