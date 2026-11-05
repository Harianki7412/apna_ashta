import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { notifyUser } from "@/lib/notify";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { hasAdminAccess } from "@/lib/role-access";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return hasAdminAccess(s?.user?.role) ? s : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);
    await connectDB();
    const users = await User.find({ kycStatus: "pending" })
      .select("name email phone kycDocument kycDocumentFront kycDocumentBack createdAt")
      .lean();
    return ok(users);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);
    const { userId, status } = await req.json();
    if (!["verified", "rejected"].includes(status))
      return fail("Invalid status");
    await connectDB();
    await User.findByIdAndUpdate(userId, { kycStatus: status });
    await notifyUser(userId, {
      type: status === "verified" ? "kyc_verified" : "kyc_rejected",
      title: status === "verified" ? "KYC verified ✅" : "KYC rejected",
      email: true,
    });
    return ok({ updated: true });
  } catch (e) {
    return handleError(e);
  }
}
