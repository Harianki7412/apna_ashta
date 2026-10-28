import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/models/Property";
import { propertySchema } from "@/lib/validators";
import { getOwnerResponseScore } from "@/lib/response-score";
import { analyzePropertyForScams } from "@/lib/anti-scam";
import { ok, fail, handleError, paginate } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const { page, limit, skip } = paginate(sp);

    const city = sp.get("city");
    const area = sp.get("area");
    const type = sp.get("type");
    const bhk = sp.get("bhk");
    const min = sp.get("min");
    const max = sp.get("max");
    const q = sp.get("q");
    const sort = sp.get("sort") || "newest";
    const verified = sp.get("verified");

    const query: any = { status: "approved" };

    if (city) {
      if (city === "Ashta") {
        query.$and = [
          { $or: [{ city: "Ashta" }, { city: { $exists: false } }] },
        ];
      } else {
        query.city = city;
      }
    }

    if (area)
      query.area = new RegExp(area.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (type) query.propertyType = type;
    if (bhk) query.bhk = bhk;
    if (verified === "true") query.verified = true;
    if (min || max) query.rent = {};
    if (min) query.rent.$gte = Number(min);
    if (max) query.rent.$lte = Number(max);
    if (q) query.$text = { $search: q };

    const sortMap: any = {
      newest: { verified: -1, featured: -1, createdAt: -1 },
      price_asc: { verified: -1, featured: -1, rent: 1 },
      price_desc: { verified: -1, featured: -1, rent: -1 },
    };

    const [items, total] = await Promise.all([
      Property.find(query)
        .populate("owner", "name phone phoneVerified kycStatus createdAt")
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(query),
    ]);

    // ═══ Enrich with response scores + scam warnings ═══
    const ownerIds = [
      ...new Set(
        items.map((i: any) => i.owner?._id?.toString()).filter(Boolean),
      ),
    ];
    const scores: Record<string, string> = {};

    await Promise.all(
      ownerIds.map(async (id) => {
        const score = await getOwnerResponseScore(id);
        scores[id] = score.label;
      }),
    );

    const enriched = items.map((item: any) => {
      if (item.owner?._id) {
        item.owner.responseLabel = scores[item.owner._id.toString()];
      }
      const warnings = analyzePropertyForScams(item);
      item.scamWarnings = warnings.map((w) => w.code);
      item.hasWarnings = warnings.length > 0;
      return item;
    });

    return ok({
      items: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + items.length < total,
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail("Unauthorized", 401);
    if (!["owner", "admin"].includes((session.user as any).role))
      return fail("Only owners can create listings", 403);

    const data = propertySchema.parse(await req.json());
    await connectDB();

    const property = await Property.create({
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      bhk: data.bhk || undefined,
      furnishing: data.furnishing,
      bathrooms: data.bathrooms,
      parking: data.parking,
      preferredTenants: data.preferredTenants,
      amenities: data.amenities,
      availableFrom: data.availableFrom
        ? new Date(data.availableFrom)
        : new Date(),
      city: data.city,
      rent: data.rent,
      deposit: data.deposit,
      maintenanceCharge: data.maintenanceCharge,
      area: data.area,
      address: data.address,
      location: { type: "Point", coordinates: [data.lng, data.lat] },
      images: data.images,
      owner: (session.user as any).id,
      status: "pending",
    });

    return ok(property, 201);
  } catch (e) {
    return handleError(e);
  }
}
