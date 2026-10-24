import { connectDB } from './mongodb';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { sendGenericEmail } from './email';

type NotifyPayload = {
  type: 'message' | 'property_approved' | 'property_rejected' | 'new_listing' | 'system' | 'kyc_verified' | 'kyc_rejected';
  title: string;
  body?: string;
  link?: string;
  email?: boolean;
};

export async function notifyUser(userId: string, payload: NotifyPayload) {
  try {
    await connectDB();
    await Notification.create({
      user: userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link,
    });

    if (payload.email) {
      const u = await User.findById(userId).select('email').lean();
      if (u?.email) {
        const base = process.env.NEXT_PUBLIC_SITE_URL || '';
        const html = `<p>${payload.body || ''}</p>${
          payload.link ? `<a href="${base}${payload.link}">Open Apna Ashta</a>` : ''
        }`;
        await sendGenericEmail(u.email, payload.title, html).catch(console.error);
      }
    }
  } catch (e) {
    console.error('[notifyUser]', e);
  }
}