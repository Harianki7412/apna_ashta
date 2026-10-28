import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllSettings,
  setSetting,
  DEFAULT_SETTINGS,
} from "@/lib/plan-helpers";
import { ok, fail, handleError } from "@/lib/api-helpers";

async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return (s?.user as any)?.role === "admin" ? s : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);
    const settings = await getAllSettings();
    return ok({ ...DEFAULT_SETTINGS, ...settings });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await requireAdmin())) return fail("Forbidden", 403);

    const body = await req.json();
    const updates: Record<string, any> = body;

    for (const [key, value] of Object.entries(updates)) {
      await setSetting(key, value);
    }

    const settings = await getAllSettings();
    return ok({ ...DEFAULT_SETTINGS, ...settings });
  } catch (e) {
    return handleError(e);
  }
}
