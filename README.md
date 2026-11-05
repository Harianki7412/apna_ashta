This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contact and social links

Set the real support email and phone in **Admin > Settings** before publishing them on the contact page. Set `SUPPORT_EMAIL` in the deployment environment if contact-form submissions should also be forwarded by email.

The homepage WhatsApp button and footer social icons are hidden unless these public environment variables are configured with the correct account URLs:

- `NEXT_PUBLIC_WHATSAPP_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`

## Production SEO and analytics

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin (for example, `https://your-domain.example`) in every production deployment. It is used for canonical metadata, sitemap URLs, and absolute social-sharing links. On Vercel, `VERCEL_URL` is used as a fallback; local development falls back to `http://localhost:3000`.

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to a Google Analytics 4 measurement ID to enable analytics. Analytics is disabled when the variable is unset. Tracked events include page views, property views, searches, favorites, property shares, chat starts, and PWA install interactions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
