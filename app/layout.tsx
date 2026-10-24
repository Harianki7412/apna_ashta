import "./globals.css";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import IOSInstallHint from "@/components/IOSInstallHint";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Apna Ashta — Rentals in Ashta",
  description:
    "Find verified rooms, flats, and homes for rent in Ashta, Madhya Pradesh",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Apna Ashta",
  },
  icons: { icon: "/icons/icon-192.png", apple: "/apple-touch-icon.png" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Navbar />
            <main className="container mx-auto p-4 flex-1">{children}</main>
            <Footer />
            <InstallPrompt />
            <IOSInstallHint />
            <WhatsAppFAB />
            <Toaster position="top-right" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
