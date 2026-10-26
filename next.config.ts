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
};

export default withPWA(withNextIntl(nextConfig));