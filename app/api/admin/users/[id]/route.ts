import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { RentAgreement } from "@/models/RentAgreement";
import { Subscription } from "@/models/Subscription";
import { LeadPack } from "@/models/LeadPack";
import { AdminNote } from "@/models/AdminNote";
import { notifyUser } from "@/lib/notify";
import { logActivity } from "@/lib/activity-logger";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);
    const { id } = await ctx.params;

    await connectDB();
    const user = await User.findById(id)
      .select("-password -resetToken -resetTokenExpiry")
      .lean();
    if (!user) return fail("Not found", 404);

    const [properties, agreements, subscriptions, leadPacks, notes] =
      await Promise.all([
        Property.find({ owner: id }).sort({ createdAt: -1 }).limit(20).lean(),
        RentAgreement.find({
          $or: [{ owner: id }, { tenant: id }],
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Subscription.find({ user: id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        LeadPack.find({ user: id }).sort({ createdAt: -1 }).limit(10).lean(),
        AdminNote.find({ targetType: "user", targetId: id })
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    return ok({
      user,
      properties,
      agreements,
      subscriptions,
      leadPacks,
      notes,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const s = await requireAdmin();
    if (!s) return fail("Forbidden", 403);
    const { id } = await ctx.params;
    const { action, role, reason, password } = await req.json();

    await connectDB();
    const target = await User.findById(id);
    if (!target) return fail("Not found", 404);
    if (id === (s.user as any).id) return fail("Cannot modify yourself");

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const ua = req.headers.get("user-agent") || "";

    if (action === "block") {
      target.blocked = true;
      target.blockedReason = reason || "Violation of terms";
      await target.save();
      await logActivity({
        actor: (s.user as any).id,
        action: "block",
        targetType: "user",
        targetId: id,
        targetLabel: target.name,
        ip,
        userAgent: ua,
      });
      return ok({ blocked: true });
    }

    if (action === "unblock") {
      target.blocked = false;
      target.blockedReason = undefined;
      await target.save();
      await logActivity({
        actor: (s.user as any).id,
        action: "unblock",
        targetType: "user",
        targetId: id,
        targetLabel: target.name,
        ip,
        userAgent: ua,
      });
      return ok({ unblocked: true });
    }

    if (
      action === "change-role" &&
      ["owner", "tenant", "admin"].includes(role)
    ) {
      const oldRole = target.role;
      target.role = role;
      await target.save();
      await logActivity({
        actor: (s.user as any).id,
        action: "role_change",
        targetType: "user",
        targetId: id,
        targetLabel: target.name,
        metadata: { from: oldRole, to: role },
        ip,
        userAgent: ua,
      });
      return ok({ role });
    }

    if (action === "reset-password") {
      const newPassword = password || crypto.randomBytes(8).toString("hex");
      target.password = await bcrypt.hash(newPassword, 10);
      await target.save();

      await logActivity({
        actor: (s.user as any).id,
        action: "reset_password",
        targetType: "user",
        targetId: id,
        targetLabel: target.name,
        ip,
        userAgent: ua,
      });

      return ok({ newPassword });
    }

    if (action === "verify-kyc") {
      target.kycStatus = "verified";
      await target.save();
      await notifyUser(id, {
        type: "kyc_verified",
        title: "KYC verified ✅",
        body: "Your identity is now verified.",
        link: "/profile",
        email: true,
      });
      return ok({ kycStatus: "verified" });
    }

    if (action === "reject-kyc") {
      target.kycStatus = "rejected";
      await target.save();
      await notifyUser(id, {
        type: "kyc_rejected",
        title: "KYC rejected",
        body: "Please re-upload a clear document.",
        link: "/verify",
        email: true,
      });
      return ok({ kycStatus: "rejected" });
    }

    if (action === "delete") {
      await logActivity({
        actor: (s.user as any).id,
        action: "delete",
        targetType: "user",
        targetId: id,
        targetLabel: target.name,
        ip,
        userAgent: ua,
      });
      await Promise.all([
        Property.deleteMany({ owner: id }),
        RentAgreement.deleteMany({ $or: [{ owner: id }, { tenant: id }] }),
        User.findByIdAndDelete(id),
      ]);
      return ok({ deleted: true });
    }

    return fail("Invalid action");
  } catch (e) {
    return handleError(e);
  }
}
