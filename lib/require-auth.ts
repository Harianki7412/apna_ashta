import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { hasFullAdminAccess, hasOwnerAccess } from './role-access';

export async function requireAuth(callbackUrl?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const url = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : '/login';
    redirect(url);
  }
  return session;
}

export async function requireOwner(callbackUrl?: string) {
  const session = await requireAuth(callbackUrl);
  const role = session.user?.role;
  if (!hasOwnerAccess(role)) {
    redirect('/');
  }
  return session;
}

export async function requireAdmin(callbackUrl?: string) {
  const session = await requireAuth(callbackUrl);
  const role = session.user?.role;
  if (!hasFullAdminAccess(role)) {
    redirect('/');
  }
  return session;
}