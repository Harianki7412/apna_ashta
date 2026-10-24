import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intl = createIntlMiddleware({
  locales: ['en', 'hi'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

const PROTECTED = [/\/dashboard/, /\/chat/, /\/admin/, /\/properties\/new/, /\/verify/, /\/favorites/];

export default function middleware(req: any) {
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED.some((re) => re.test(path));

  if (!isProtected) return intl(req);

  return withAuth(
    function authMw(req: any) {
      const role = req.nextauth.token?.role;
      if (path.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (path.startsWith('/properties/new') && !['owner', 'admin'].includes(role)) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return intl(req);
    },
    { callbacks: { authorized: ({ token }) => !!token } }
  )(req, {} as any);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};