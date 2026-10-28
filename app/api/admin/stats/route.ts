import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { ContactMessage } from "@/models/ContactMessage";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "admin") return fail("Forbidden", 403);

    await connectDB();
    const [pendingProps, pendingKyc, newMessages] = await Promise.all([
      Property.countDocuments({ status: "pending" }),
      User.countDocuments({ kycStatus: "pending" }),
      ContactMessage.countDocuments({ status: "new" }),
    ]);

    return ok({
      pendingProperties: pendingProps,
      pendingKyc,
      newMessages,
      total: pendingProps + pendingKyc + newMessages,
    });
  } catch (e) {
    return handleError(e);
  }
}
