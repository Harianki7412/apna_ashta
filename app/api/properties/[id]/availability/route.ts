import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { ok, fail, handleError } from "@/lib/api-helpers";
import { hasAdminAccess, hasOwnerAccess } from "@/lib/role-access";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return fail("Invalid id", 400);

    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);
    if (!hasOwnerAccess(session.user.role))
      return fail("Owner access required", 403);

    await connectDB();
    const filter =
      hasAdminAccess(session.user.role)
        ? { _id: id, status: "approved" }
        : { _id: id, owner: session.user.id, status: "approved" };
    const property = await Property.findOneAndUpdate(
      filter,
      { $set: { lastAvailabilityConfirmedAt: new Date() } },
      { new: true },
    )
      .select("_id lastAvailabilityConfirmedAt")
      .lean();

    if (!property) return fail("Approved property not found", 404);
    return ok({
      confirmedAt: property.lastAvailabilityConfirmedAt,
    });
  } catch (error) {
    return handleError(error);
  }
}
