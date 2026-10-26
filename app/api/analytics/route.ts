import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { Conversation } from '@/models/Conversation';
import { Review } from '@/models/Review';
import { ok, fail, handleError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    if (!['owner', 'admin'].includes((session.user as any).role)) return fail('Forbidden', 403);
    await connectDB();
    const me = (session.user as any).id;
    const props = await Property.find({ owner: me }).lean();
    const stats = {
      total: props.length,
      approved: props.filter((p: any) => p.status === 'approved').length,
      pending: props.filter((p: any) => p.status === 'pending').length,
      rejected: props.filter((p: any) => p.status === 'rejected').length,
      rented: props.filter((p: any) => p.status === 'rented').length,
      featured: props.filter((p: any) => p.featured).length,
      totalViews: props.reduce((s, p: any) => s + (p.views || 0), 0),
    };
    const approved = props.filter((p: any) => p.status === 'approved');
    const avgRent = approved.length ? approved.reduce((s, p: any) => s + p.rent, 0) / approved.length : 0;
    const propIds = props.map((p: any) => p._id);
    const chats = await Conversation.find({ property: { $in: propIds } }).lean();
    const reviews = await Review.find({ property: { $in: propIds } }).lean();
    const avgRating = reviews.length ? reviews.reduce((s, r: any) => s + r.rating, 0) / reviews.length : 0;

    const now = new Date();
    const monthlyTrend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const ms = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const me2 = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const lc = props.filter((p: any) => { const d = new Date(p.createdAt); return d >= ms && d <= me2; }).length;
      const cc = chats.filter((c: any) => { const d = new Date(c.createdAt || Date.now()); return d >= ms && d <= me2; }).length;
      monthlyTrend.push({ month: ms.toLocaleDateString('en-IN', { month: 'short' }), listings: lc, inquiries: cc });
    }

    const propertyBreakdown = props.slice(0, 5).map((p: any) => ({
      name: p.title.length > 20 ? p.title.slice(0, 20) + '...' : p.title,
      views: p.views || 0,
      rent: p.rent,
      status: p.status,
    }));

    return ok({ stats: { ...stats, avgRent, totalChats: chats.length, avgRating }, monthlyTrend, propertyBreakdown });
  } catch (e) {
    return handleError(e);
  }
}