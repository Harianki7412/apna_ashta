import "./globals.css";
import type { Metadata, Viewport } from "next";
import {
  Inter,
  Noto_Sans_Devanagari,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import InstallPrompt from "@/components/InstallPrompt";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { Toaster } from "react-hot-toast";

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
  title: "Apna Ashta — Rentals in Ashta",
  description:
    "Find verified rooms, flats, and homes for rent in Ashta, Madhya Pradesh",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Apna Ashta",
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

  // ═══ Read theme from cookie server-side (prevents flash) ═══
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";
  const isDark = theme === "dark";

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoHindi.variable} ${jakarta.variable} ${isDark ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        {/* ═══ Inline script — prevents theme flash on reload ═══ */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = document.cookie.match(/(?:^|; )theme=([^;]+)/);
                  var saved = theme ? theme[1] : null;
                  var prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = saved === 'dark' || (!saved && prefers);
                  if (isDark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Navbar />
            <main className="container mx-auto p-4 flex-1 pb-24 md:pb-4">
              {children}
            </main>
            <Footer />
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
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
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
