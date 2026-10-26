import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { SavedSearch } from '@/models/SavedSearch';
import { ok, fail, handleError } from '@/lib/api-helpers';

const ALLOWED_FILTER_KEYS = ['city', 'area', 'type', 'bhk', 'min', 'max', 'q', 'sort'];

function sanitizeFilters(raw: any): Record<string, string> {
  const clean: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return clean;
  for (const key of ALLOWED_FILTER_KEYS) {
    const val = raw[key];
    if (val !== undefined && val !== null && val !== '') {
      clean[key] = String(val).slice(0, 100);
    }
  }
  return clean;
}

/* ═══ GET ═══ */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    await connectDB();
    const list = await SavedSearch.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .lean();
    return ok(list);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ POST ═══ */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const body = await req.json();
    const { name, filters } = body;

    await connectDB();

    const cleanedFilters = sanitizeFilters(filters);

    // Prevent duplicate (same user + same core filters)
    const existing = await SavedSearch.findOne({
      user: (session.user as any).id,
      'filters.city': cleanedFilters.city || '',
      'filters.area': cleanedFilters.area || '',
      'filters.type': cleanedFilters.type || '',
      'filters.bhk': cleanedFilters.bhk || '',
    });

    if (existing) {
      return fail('A similar search is already saved', 409);
    }

    const saved = await SavedSearch.create({
      user: (session.user as any).id,
      name: (name || 'My search').toString().slice(0, 80),
      filters: cleanedFilters,
      notifyOnNew: true,
    });

    return ok(saved, 201);
  } catch (e) {
    return handleError(e);
  }
}

/* ═══ DELETE ═══ */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { id } = await req.json();
    if (!id) return fail('id required');

    await connectDB();
    await SavedSearch.deleteOne({
      _id: id,
      user: (session.user as any).id,
    });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}