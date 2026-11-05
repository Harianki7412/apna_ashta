# QA checklist

## Latest run

| Area | Check | Result |
|---|---|---|
| Static quality | `npm run lint` | Pass |
| Production build | `npm run build` (compile, TypeScript, and 125 static pages) | Pass |
| API validation | Invalid registration payload returns HTTP 400 | Pass |
| Property listing API | HTTP 200 with `items`, `total`, `page`, and `totalPages` response fields | Pass |
| Favorites authorization | Anonymous `GET /api/favorites` returns HTTP 401 | Pass |
| Admin authorization | Anonymous property verification returns HTTP 403 | Pass |
| Payment authorization | Anonymous payment verification returns HTTP 401 | Pass |
| Browser smoke | Login, register, property listing, favorites, admin, and pricing routes render; anonymous favorites/admin redirect to login | Pass |
| Registration UI | Tenant role selection opens the form; empty submission marks all three required fields invalid | Pass |
| Mobile viewport | 390 × 844; listing, registration, and pricing pages have no horizontal overflow | Pass |

## Critical-flow release checklist

These authenticated and provider-backed flows were not completed in this run. Use non-production accounts, seeded test records, and sandbox payment credentials.

- [ ] Login with valid and invalid credentials; verify callback routing, session persistence, and logout.
- [ ] Register tenant and owner accounts; test OTP delivery, valid/expired/invalid OTPs, duplicate identifiers, and successful login.
- [ ] Browse approved properties; verify search/filter/sort/pagination, detail navigation, and empty/error states.
- [ ] Save and remove a favorite; verify the list survives reload and is scoped to the signed-in user.
- [ ] As an admin, verify and unverify a seeded property; confirm the public listing state and audit/notification behavior.
- [ ] Complete subscription and featured-property payments in Razorpay sandbox; cover cancellation, invalid signature, duplicate callback, and successful activation.
- [ ] Exercise valid and invalid request boundaries for the remaining API schemas and verify expected status codes and error envelopes.
- [ ] Repeat UI smoke checks at desktop and mobile widths, including narrow-screen navigation, forms, property cards, and checkout modal.
- [ ] Repeat browser checks on supported desktop browsers and a real iOS/Android device.

## Environment notes

- Full authenticated flows require test credentials and database fixtures; email/OTP and Razorpay sandbox configuration are also required.
- The local HTTP browser run emitted CSP inline-style violations and `ERR_SSL_PROTOCOL_ERROR` requests to an HTTPS localhost callback. Re-run auth flows against the configured canonical origin and investigate the style-policy console errors before release.

## Exit criteria

Release only after every critical-flow item above passes in the staging environment and the environment notes are resolved or confirmed to be local-only.
