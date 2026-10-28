import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { User } from "@/models/User";
import { Subscription } from "@/models/Subscription";
import { LeadPack } from "@/models/LeadPack";
import { RentAgreementOrder } from "@/models/RentAgreementOrder";
import { ok, fail, handleError } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "admin") return fail("Forbidden", 403);

    const days = Math.min(
      90,
      Math.max(7, Number(new URL(req.url).searchParams.get("days") || 30)),
    );
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    await connectDB();

    const [properties, users, subs, packs, agreements] = await Promise.all([
      Property.find({ createdAt: { $gte: since } })
        .select("status createdAt city rent")
        .lean(),
      User.find({ createdAt: { $gte: since } })
        .select("role createdAt")
        .lean(),
      Subscription.find({ status: "active", createdAt: { $gte: since } })
        .select("amount createdAt")
        .lean(),
      LeadPack.find({ status: "active", createdAt: { $gte: since } })
        .select("amount createdAt")
        .lean(),
      RentAgreementOrder.find({ status: "paid", createdAt: { $gte: since } })
        .select("amount createdAt")
        .lean(),
    ]);

    // Revenue by day
    const revenueMap: Record<
      string,
      {
        subscription: number;
        leadPack: number;
        agreement: number;
        total: number;
      }
    > = {};
    const initDay = (d: string) => {
      if (!revenueMap[d])
        revenueMap[d] = {
          subscription: 0,
          leadPack: 0,
          agreement: 0,
          total: 0,
        };
      return revenueMap[d];
    };

    subs.forEach((s: any) => {
      const d = new Date(s.createdAt).toISOString().slice(0, 10);
      initDay(d).subscription += s.amount;
      initDay(d).total += s.amount;
    });
    packs.forEach((p: any) => {
      const d = new Date(p.createdAt).toISOString().slice(0, 10);
      initDay(d).leadPack += p.amount;
      initDay(d).total += p.amount;
    });
    agreements.forEach((a: any) => {
      const d = new Date(a.createdAt).toISOString().slice(0, 10);
      initDay(d).agreement += a.amount;
      initDay(d).total += a.amount;
    });

    const revenueChart = Object.entries(revenueMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    // Users by day
    const usersMap: Record<string, { owners: number; tenants: number }> = {};
    users.forEach((u: any) => {
      const d = new Date(u.createdAt).toISOString().slice(0, 10);
      if (!usersMap[d]) usersMap[d] = { owners: 0, tenants: 0 };
      if (u.role === "owner") usersMap[d].owners++;
      else if (u.role === "tenant") usersMap[d].tenants++;
    });
    const usersChart = Object.entries(usersMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    // Listings by day
    const listingsMap: Record<
      string,
      { pending: number; approved: number; rejected: number }
    > = {};
    properties.forEach((p: any) => {
      const d = new Date(p.createdAt).toISOString().slice(0, 10);
      if (!listingsMap[d])
        listingsMap[d] = { pending: 0, approved: 0, rejected: 0 };
      (listingsMap[d] as any)[p.status]++;
    });
    const listingsChart = Object.entries(listingsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    // City breakdown
    const cityMap: Record<
      string,
      { count: number; avgRent: number; totalRent: number }
    > = {};
    properties.forEach((p: any) => {
      const city = p.city || "Ashta";
      if (!cityMap[city])
        cityMap[city] = { count: 0, avgRent: 0, totalRent: 0 };
      cityMap[city].count++;
      cityMap[city].totalRent += p.rent || 0;
    });
    Object.values(cityMap).forEach((c) => {
      c.avgRent = c.count > 0 ? Math.round(c.totalRent / c.count) : 0;
    });
    const cityChart = Object.entries(cityMap).map(([city, v]) => ({
      city,
      ...v,
    }));

    // KPIs
    const totalRevenue = revenueChart.reduce((s, r) => s + r.total, 0);
    const totalNewUsers = usersChart.reduce(
      (s, r) => s + r.owners + r.tenants,
      0,
    );
    const totalNewListings = listingsChart.reduce(
      (s, r) => s + r.pending + r.approved + r.rejected,
      0,
    );

    return ok({
      days,
      kpis: {
        totalRevenue,
        totalNewUsers,
        totalNewListings,
        avgRevenuePerDay: Math.round(totalRevenue / days),
      },
      revenueChart,
      usersChart,
      listingsChart,
      cityChart,
    });
  } catch (e) {
    return handleError(e);
  }
}
