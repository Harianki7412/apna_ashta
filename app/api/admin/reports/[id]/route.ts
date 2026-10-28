import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Report } from "@/models/Report";
import { Property } from "@/models/Property";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return fail("Forbidden", 403);
    }

    const { id } = await ctx.params;
    const { action, adminNote } = await req.json();
    // action: 'investigate' | 'resolve' | 'dismiss'

    if (!["investigate", "resolve", "dismiss"].includes(action)) {
      return fail("Invalid action");
    }

    await connectDB();
    const report = await Report.findById(id);
    if (!report) return fail("Report not found", 404);

    const statusMap: any = {
      investigate: "investigating",
      resolve: "resolved",
      dismiss: "dismissed",
    };

    report.status = statusMap[action];
    if (adminNote) report.adminNote = adminNote;

    if (action === "resolve" || action === "dismiss") {
      report.resolvedBy = (session.user as any).id;
      report.resolvedAt = new Date();
    }
    await report.save();

    // If dismissed, decrement property report count
    if (action === "dismiss") {
      await Property.updateOne(
        { _id: report.property },
        {
          $inc: { reportCount: -1 },
          $set: { flagged: false },
        },
      );
    }

    await logActivity({
      actor: (session.user as any).id,
      action: "approve",
      targetType: "property",
      targetId: report.property.toString(),
      targetLabel: `Report ${action}`,
      metadata: { reportId: id, action },
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "",
    });

    return ok({ updated: true, status: report.status });
  } catch (e) {
    return handleError(e);
  }
}
