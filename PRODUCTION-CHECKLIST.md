# Production checklist

## Go/no-go

**Current status: staging candidate; production release is still gated.** Static checks and local configuration shape can be verified here, but production secrets, real provider callbacks, authenticated workflows, and device/browser coverage must be verified in staging before launch.

## Before deployment

- [ ] Confirm the release commit and review the complete diff; deploy only the intended changes.
- [ ] Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin. Set all `NEXT_PUBLIC_*` values in the build environment because Next.js embeds them at build time.
- [ ] Set `MONGODB_URI` and `NEXTAUTH_SECRET` in the hosting platform's secret store. Use a strong random secret; do not copy `.env.local` into the repository or deployment artifact.
- [ ] Restrict database network access to the hosting environment, verify production indexes/permissions, and confirm a recent backup and restore procedure.
- [ ] Set the feature credentials required by the release:
  - Images/uploads: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
  - Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID` from the same Razorpay mode/account. Use test keys in staging and live keys only in production.
  - Email: `RESEND_API_KEY`, a verified sender in `EMAIL_FROM`, and the intended `SUPPORT_EMAIL`.
  - OTP/SMS: `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID`; verify the approved template and delivery configuration.
  - Saved-search notifications: `CRON_SECRET`; configure the hosting scheduler to call `GET /api/cron/saved-search-notify` with bearer authorization at least daily. Do not put the secret in a query string.
- [ ] Set optional `NEXT_PUBLIC_GA_MEASUREMENT_ID` and, when needed, `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, and `NEXT_PUBLIC_INSTAGRAM_URL` only to verified production IDs and destinations.
- [ ] Confirm support contact details in Admin > Settings, plus legal, refund, and safety content for the operating region.
- [ ] Confirm DNS, TLS renewal, canonical redirects, and the production host's support for the Next.js Node.js server, Proxy, server actions, image optimization, and streaming.
- [ ] Confirm the deployment platform's health checks, logs, error alerts, database monitoring, backup schedule, and rollback procedure.

## Pre-release verification

- [x] `npm run lint`.
- [x] `npm run build` with TypeScript checking and route generation.
- [x] Validate local `.env.local` key presence/URL formats without printing values; confirm `.env.local` is git-ignored.
- [x] Match literal internal links against application page, handler, and metadata routes.
- [ ] Deploy the candidate to HTTPS staging and verify redirects, cookies, CSP, and browser console/network errors there.
- [ ] Run valid/invalid registration, OTP, login/logout, password reset, and session/callback flows using non-production accounts.
- [ ] Verify property browse/search/filter/detail and owner create/edit/availability flows with seeded data.
- [ ] Verify favorites, saved searches, notifications, chat, agreements, and admin moderation with role-specific accounts.
- [ ] Complete Razorpay sandbox checkout, cancellation, invalid-signature, duplicate-callback, refund, and successful activation cases.
- [ ] Verify contact/email delivery, Cloudinary uploads, MSG91 OTP delivery, cron authorization, and scheduled notifications.
- [ ] Check the sitemap, robots, canonical/social metadata, manifest, offline fallback, and service-worker update behavior at the staging origin.
- [ ] Check 320px, 390px, tablet, and desktop layouts; keyboard navigation, focus visibility, labels, accessible names, contrast, zoom, and screen-reader landmarks.
- [ ] Smoke-test supported desktop browsers and real iOS/Android devices.

## Launch and rollback

- [ ] Announce the maintenance/release window and support owner.
- [ ] Deploy the reviewed build; run smoke checks immediately against the production HTTPS origin.
- [ ] Monitor authentication, API/server errors, database connectivity, payment/email/SMS providers, and Core Web Vitals.
- [ ] Roll back to the last known-good deployment if critical flows fail; preserve logs and avoid destructive database changes during rollback.
- [ ] After launch, verify a successful backup and confirm the scheduled saved-search job ran.
