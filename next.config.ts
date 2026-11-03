import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: { document: '/offline' },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cloudinary-images',
          expiration: { maxEntries: 200, maxAgeSeconds: 2592000 },
        },
      },
      {
        urlPattern: /\/api\/properties/,
        handler: 'NetworkFirst',
        options: { cacheName: 'api-properties', networkTimeoutSeconds: 5 },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; media-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests",
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default withPWA(withNextIntl(nextConfig));