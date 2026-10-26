import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

export async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    const url = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/login';
    redirect(url);
  }
  return session;
}

export async function requireOwner(callbackUrl?: string) {
  const session = await requireAuth(callbackUrl);
  const role = (session.user as any)?.role;
  if (!['owner', 'admin'].includes(role)) {
    redirect('/');
  }
  return session;
}

export async function requireAdmin(callbackUrl?: string) {
  const session = await requireAuth(callbackUrl);
  const role = (session.user as any)?.role;
  if (role !== 'admin') {
    redirect('/');
  }
  return session;
}