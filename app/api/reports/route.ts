import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { Report } from "@/models/Report";
import { rateLimit } from "@/lib/rate-limit";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Please login to report", 401);

    const me = (session.user as any).id;
    const rl = rateLimit(`report:${me}`, 5, 60 * 60 * 1000); // 5 reports per hour
    if (!rl.allowed) return fail("Too many reports. Try again later.", 429);

    const { propertyId, reason, description } = await req.json();
    if (!propertyId || !reason) return fail("Property and reason required");

    await connectDB();
    const property = await Property.findById(propertyId);
    if (!property) return fail("Property not found", 404);

    if (property.owner.toString() === me) {
      return fail("You cannot report your own property", 403);
    }

    // Check existing report
    const existing = await Report.findOne({
      property: propertyId,
      reporter: me,
    });
    if (existing) return fail("You already reported this property", 409);

    await Report.create({
      property: propertyId,
      reporter: me,
      reason,
      description: description?.slice(0, 500),
    });

    // Increment property report count
    property.reportCount = (property.reportCount || 0) + 1;
    if (property.reportCount >= 3) property.flagged = true;
    await property.save();

    return ok({ reported: true });
  } catch (e) {
    return handleError(e);
  }
}
