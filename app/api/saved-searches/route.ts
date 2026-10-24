import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { SavedSearch } from '@/models/SavedSearch';
import { ok, fail, handleError } from '@/lib/api-helpers';

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { name, filters } = await req.json();
    await connectDB();
    const saved = await SavedSearch.create({
      user: (session.user as any).id,
      name: name || 'My search',
      filters: filters || {},
      notifyOnNew: true,
    });
    return ok(saved, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);

    const { id } = await req.json();
    await connectDB();
    await SavedSearch.deleteOne({ _id: id, user: (session.user as any).id });
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}