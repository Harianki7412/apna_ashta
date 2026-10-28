import { connectDB } from "./mongodb";
import { ActivityLog } from "@/models/ActivityLog";

export async function logActivity({
  actor,
  action,
  targetType,
  targetId,
  targetLabel,
  metadata,
  ip,
  userAgent,
}: {
  actor: string;
  action: string;
  targetType:
    | "property"
    | "user"
    | "agreement"
    | "payment"
    | "plan"
    | "setting";
  targetId?: string;
  targetLabel?: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}) {
  try {
    await connectDB();
    await ActivityLog.create({
      actor,
      action,
      targetType,
      targetId,
      targetLabel,
      metadata,
      ip,
      userAgent,
    });
  } catch (e) {
    console.error("[logActivity]", e);
  }
}
