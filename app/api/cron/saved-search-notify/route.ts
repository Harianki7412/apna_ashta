import { connectDB } from "@/lib/mongodb";
import { SavedSearch } from "@/models/SavedSearch";
import { Property } from "@/models/Property";
import { notifyUser } from "@/lib/notify";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const query = new URL(req.url).searchParams.get("secret");
    if (
      auth !== `Bearer ${process.env.CRON_SECRET}` &&
      query !== process.env.CRON_SECRET
    )
      return fail("Unauthorized", 401);

    await connectDB();
    const searches = await SavedSearch.find({ notifyOnNew: true }).lean();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let notified = 0;
    for (const s of searches as any[]) {
      const q: any = { status: "approved", createdAt: { $gte: since } };
      if (s.filters?.area) q.area = new RegExp(s.filters.area, "i");
      if (s.filters?.type) q.propertyType = s.filters.type;
      if (s.filters?.min || s.filters?.max) {
        q.rent = {};
        if (s.filters.min) q.rent.$gte = s.filters.min;
        if (s.filters.max) q.rent.$lte = s.filters.max;
      }
      const count = await Property.countDocuments(q);
      if (count > 0) {
        await notifyUser(s.user.toString(), {
          type: "new_listing",
          title: `${count} new propert${count === 1 ? "y" : "ies"} match your search`,
          body: s.name || "View saved search",
          link: `/properties?area=${encodeURIComponent(s.filters?.area || "")}`,
          email: true,
          emailData: {
            count,
            searchName: s.name || "Your saved search",
            searchUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/properties?area=${encodeURIComponent(s.filters?.area || "")}`,
          },
        });
        await SavedSearch.updateOne(
          { _id: s._id },
          { lastNotifiedAt: new Date() },
        );
        notified++;
      }
    }
    return ok({ notified });
  } catch (e) {
    return handleError(e);
  }
}
