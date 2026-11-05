import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Property } from '@/models/Property';
import { Conversation } from '@/models/Conversation';
import { Review } from '@/models/Review';
import { Favorite } from '@/models/Favorite';
import { ok, fail, handleError } from '@/lib/api-helpers';
import { hasOwnerAccess } from '@/lib/role-access';

type PropertyStatus = 'approved' | 'pending' | 'rejected' | 'rented';

interface AnalyticsProperty {
  _id: { toString(): string };
  title: string;
  status: PropertyStatus;
  featured?: boolean;
  views?: number;
  rent: number;
  createdAt: Date;
}

interface AnalyticsConversation {
  createdAt?: Date | string;
}

interface AnalyticsReview {
  rating: number;
}

interface MonthlyTrendItem {
  month: string;
  listings: number;
  inquiries: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return fail('Unauthorized', 401);
    if (!hasOwnerAccess(session.user.role)) return fail('Forbidden', 403);
    await connectDB();
    const me = session.user.id;
    const props = await Property.find({ owner: me }).lean<AnalyticsProperty[]>();
    const stats = {
      total: props.length,
      approved: props.filter((p) => p.status === 'approved').length,
      pending: props.filter((p) => p.status === 'pending').length,
      rejected: props.filter((p) => p.status === 'rejected').length,
      rented: props.filter((p) => p.status === 'rented').length,
      featured: props.filter((p) => p.featured).length,
      totalViews: props.reduce((sum, p) => sum + (p.views || 0), 0),
    };
    const approved = props.filter((p) => p.status === 'approved');
    const avgRent = approved.length
      ? approved.reduce((sum, p) => sum + p.rent, 0) / approved.length
      : 0;
    const propIds = props.map((p) => p._id);
    const [chats, reviews, totalFavorites] = await Promise.all([
      Conversation.find({ property: { $in: propIds } }).lean<AnalyticsConversation[]>(),
      Review.find({ property: { $in: propIds } }).lean<AnalyticsReview[]>(),
      Favorite.countDocuments({ property: { $in: propIds } }),
    ]);
    const avgRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    const now = new Date();
    const monthlyTrend: MonthlyTrendItem[] = [];
    for (let i = 5; i >= 0; i--) {
      const ms = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const me2 = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const lc = props.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= ms && d <= me2;
      }).length;
      const cc = chats.filter((c) => {
        const d = new Date(c.createdAt || Date.now());
        return d >= ms && d <= me2;
      }).length;
      monthlyTrend.push({ month: ms.toLocaleDateString('en-IN', { month: 'short' }), listings: lc, inquiries: cc });
    }

    const propertyBreakdown = props.slice(0, 5).map((p) => ({
      name: p.title.length > 20 ? p.title.slice(0, 20) + '...' : p.title,
      views: p.views || 0,
      rent: p.rent,
      status: p.status,
    }));

    return ok({ stats: { ...stats, avgRent, totalChats: chats.length, totalFavorites, avgRating }, monthlyTrend, propertyBreakdown });
  } catch (e) {
    return handleError(e);
  }
}