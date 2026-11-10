import { ok, handleError } from "@/lib/api-helpers";
import { getAllStates } from "@/lib/cities-server";

export const revalidate = 60;

export async function GET() {
  try {
    const states = await getAllStates(true);
    return ok(states);
  } catch (e) {
    return handleError(e);
  }
}
