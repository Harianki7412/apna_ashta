# Launch notes

## Release status

The application is prepared for staging verification, not yet cleared for a public production launch. Production credentials and provider-backed/authenticated end-to-end flows are not available in this local check. Use [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md) as the release gate.

## Hardening included

- Wired the request nonce to Goober's runtime stylesheet injection so the toast styles can satisfy the strict production Content Security Policy.
- Added a keyboard skip link, explicit main/navigation landmarks, accessible language and menu labels, active-page semantics, and localized mobile navigation labels.
- Reviewed the shared visual system, responsive layout, route links, canonical metadata, sitemap/robots, PWA configuration, and deployment environment references.

## Local verification

- ESLint and the production build are the required code-quality checks; the build performs TypeScript validation and generates app routes.
- Literal internal links were checked against app page, route-handler, and metadata routes.
- The browser smoke check used a local HTTP origin. Production CSP intentionally upgrades insecure requests, so local HTTP link prefetches can report TLS errors; validate browser navigation and CSP on an HTTPS staging origin before release.
- Local environment validation checked only variable names, URL syntax, database URI scheme, secret length, and `.env.local` ignore status. No secret values were printed or included in this repository.

## Operator reminders

- Set `NEXT_PUBLIC_*` values before building the production artifact.
- Keep Razorpay credentials in the matching test/live mode, verify Resend sender identity and MSG91 templates, and configure the saved-search scheduler with bearer authentication.
- Update support details in Admin > Settings and confirm the contact, legal, refund, and safety pages before publishing.
- Complete the pending staging/device checks and establish monitoring and rollback ownership before announcing launch.
