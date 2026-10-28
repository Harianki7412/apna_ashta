import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const LOCALES = ["en", "hi"];
const DEFAULT_LOCALE = "en";

/* ═══════════════════════════════════════════════════════════
   ROUTE PROTECTION LISTS
   ═══════════════════════════════════════════════════════════ */

const AUTH_REQUIRED = [
  /^\/dashboard(?:\/.*)?$/,
  /^\/profile(?:\/.*)?$/,
  /^\/favorites(?:\/.*)?$/,
  /^\/chat(?:\/.*)?$/,
  /^\/notifications(?:\/.*)?$/,
  /^\/agreements(?:\/.*)?$/,
  /^\/saved-searches(?:\/.*)?$/,
  /^\/verify(?:\/.*)?$/,
  /^\/properties\/new(?:\/.*)?$/,
  /^\/properties\/[a-f\d]{24}\/edit$/,
  /^\/admin(?:\/.*)?$/,
];

const OWNER_ONLY = [
  /^\/properties\/new/,
  /^\/properties\/[a-f\d]{24}\/edit$/,
  /^\/dashboard\/analytics/,
];

const ADMIN_ONLY = [/^\/admin(?:\/.*)?$/];

// User-only pages that admin should NOT access
const ADMIN_BLOCKED = [
  /^\/dashboard(?:\/.*)?$/,
  /^\/favorites(?:\/.*)?$/,
  /^\/chat(?:\/.*)?$/,
  /^\/agreements(?:\/.*)?$/,
  /^\/saved-searches(?:\/.*)?$/,
  /^\/properties\/new(?:\/.*)?$/,
  /^\/properties\/[a-f\d]{24}\/edit$/,
  /^\/verify(?:\/.*)?$/,
];

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("locale")?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;
  const accept = request.headers.get("accept-language") || "";
  return accept.toLowerCase().includes("hi") ? "hi" : DEFAULT_LOCALE;
}

function setLocaleCookie(response: NextResponse, request: NextRequest) {
  const locale = detectLocale(request);
  if (request.cookies.get("locale")?.value !== locale) {
    response.cookies.set("locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
}

function matches(patterns: RegExp[], pathname: string): boolean {
  return patterns.some((re) => re.test(pathname));
}

/* ═══════════════════════════════════════════════════════════
   MAIN PROXY
   ═══════════════════════════════════════════════════════════ */

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (matches(AUTH_REQUIRED, pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const res = NextResponse.redirect(loginUrl);
      setLocaleCookie(res, request);
      return res;
    }

    const role = (token as any).role as string;

    // 🔒 Admin redirect: keep admin out of user-only pages
    if (role === "admin" && matches(ADMIN_BLOCKED, pathname)) {
      const res = NextResponse.redirect(new URL("/admin", request.url));
      setLocaleCookie(res, request);
      return res;
    }

    // 🔒 Admin-only routes: non-admin users blocked
    if (matches(ADMIN_ONLY, pathname) && role !== "admin") {
      const res = NextResponse.redirect(new URL("/", request.url));
      setLocaleCookie(res, request);
      return res;
    }

    // 🔒 Owner/admin routes: tenants blocked
    if (matches(OWNER_ONLY, pathname) && !["owner", "admin"].includes(role)) {
      const res = NextResponse.redirect(new URL("/", request.url));
      setLocaleCookie(res, request);
      return res;
    }
  }

  const response = NextResponse.next();
  setLocaleCookie(response, request);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
