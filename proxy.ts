import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasAdminAccess, hasOwnerAccess } from "@/lib/role-access";

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
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }
}

function createCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
    isDev
      ? "style-src 'self' 'unsafe-inline'"
      : `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://unpkg.com https://*.tile.openstreetmap.org",
    "font-src 'self' data:",
    "connect-src 'self' https://api.cloudinary.com https://api.razorpay.com https://checkout.razorpay.com",
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
    "media-src 'self' data:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function secureResponse(
  response: NextResponse,
  request: NextRequest,
  csp: string,
) {
  response.headers.set("Content-Security-Policy", csp);
  setLocaleCookie(response, request);
  return response;
}

function matches(patterns: RegExp[], pathname: string): boolean {
  return patterns.some((re) => re.test(pathname));
}

/* ═══════════════════════════════════════════════════════════
   MAIN PROXY
   ═══════════════════════════════════════════════════════════ */

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const nonce = btoa(crypto.randomUUID());
  const csp = createCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  if (matches(AUTH_REQUIRED, pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      const res = NextResponse.redirect(loginUrl);
      return secureResponse(res, request, csp);
    }

    const role = ["owner", "tenant", "admin", "management_team"].includes(
      typeof token.role === "string" ? token.role : "",
    )
      ? token.role
      : "";

    // 🔒 Admin redirect: keep admin out of user-only pages
    if (hasAdminAccess(role) && matches(ADMIN_BLOCKED, pathname)) {
      const res = NextResponse.redirect(new URL("/admin", request.url));
      return secureResponse(res, request, csp);
    }

    // 🔒 Admin-only routes: non-admin users blocked
    if (matches(ADMIN_ONLY, pathname) && !hasAdminAccess(role)) {
      const res = NextResponse.redirect(new URL("/", request.url));
      return secureResponse(res, request, csp);
    }

    // 🔒 Owner/admin routes: tenants blocked
    if (matches(OWNER_ONLY, pathname) && !hasOwnerAccess(role)) {
      const res = NextResponse.redirect(new URL("/", request.url));
      return secureResponse(res, request, csp);
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return secureResponse(response, request, csp);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
