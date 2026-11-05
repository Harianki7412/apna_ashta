import "./globals.css";
import type { Metadata, Viewport } from "next";
import {
  Inter,
  Noto_Sans_Devanagari,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import InstallPrompt from "@/components/InstallPrompt";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/site-url";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const notoHindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-hindi",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: "Verified Rooms, Flats & Homes for Rent in Ashta",
    template: "%s | Flatova",
  },
  description:
    "Find verified rooms, flats, and houses for rent in Ashta. Browse current listings, compare rents, and connect directly with property owners on Flatova.",
  applicationName: "Flatova",
  keywords: [
    "rent in Ashta",
    "flats for rent in Ashta",
    "rooms for rent in Ashta",
    "houses for rent in Ashta",
    "verified rental properties",
    "no broker rentals",
  ],
  authors: [{ name: "Flatova" }],
  creator: "Flatova",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    siteName: "Flatova",
    title: "Verified Rooms, Flats & Homes for Rent in Ashta",
    description:
      "Browse verified rentals in Ashta, compare properties, and connect directly with owners.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Flatova — verified rentals in Ashta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Rooms, Flats & Homes for Rent in Ashta",
    description:
      "Browse verified rentals in Ashta and connect directly with property owners.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flatova",
  },
  icons: { icon: "/icons/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const tCommon = await getTranslations("common");

  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const theme = cookieStore.get("theme")?.value || "light";
  const isDark = theme === "dark";
  const nonce = requestHeaders.get("x-nonce") ?? undefined;

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoHindi.variable} ${jakarta.variable} ${isDark ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  window.__nonce__ = ${JSON.stringify(nonce ?? "")};
                  var m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
                  var s = m ? m[1] : null;
                  var p = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = s === 'dark' || (!s && p);
                  if (isDark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-brand-700 focus:shadow-lg"
        >
          {tCommon("skipToContent")}
        </a>
        <GoogleAnalytics nonce={nonce} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Navbar />
            <main id="main-content" className="container mx-auto p-4 flex-1 pb-24 md:pb-4">
              {children}
            </main>
            <Footer year={new Date().getFullYear()} />
            <MobileNav />
            <InstallPrompt />
            <WhatsAppFAB />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "var(--toast-bg, #ffffff)",
                  color: "var(--toast-color, #111827)",
                  borderRadius: "12px",
                  border: "1px solid var(--toast-border, #f3f4f6)",
                },
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
