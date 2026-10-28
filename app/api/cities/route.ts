import { ok, handleError } from "@/lib/api-helpers";
import { getAllCities } from "@/lib/cities-server";

export const revalidate = 60; // Cache response for 60 seconds

export async function GET() {
  try {
    const cities = await getAllCities();
    return ok(cities);
  } catch (e) {
    return handleError(e);
  }
}
