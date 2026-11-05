"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  parameters?: Record<string, string | number | boolean>,
) {
  if (!measurementId || typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
  window.gtag("event", name, parameters);
}

export function TrackEvent({
  name,
  parameters,
}: {
  name: string;
  parameters: Record<string, string | number | boolean>;
}) {
  const parametersKey = JSON.stringify(parameters);

  useEffect(() => {
    trackEvent(name, JSON.parse(parametersKey));
  }, [name, parametersKey]);

  return null;
}

export function GoogleAnalytics({ nonce }: { nonce?: string }) {
  const pathname = usePathname();
  const isPrivateRoute =
    /^\/(admin|api|chat|dashboard|profile|favorites|notifications|saved-searches|agreements|login|register|forgot-password|reset-password)(\/|$)/.test(
      pathname,
    );

  useEffect(() => {
    if (isPrivateRoute) return;
    trackEvent("page_view", {
      page_path: pathname,
    });
  }, [pathname, isPrivateRoute]);

  if (!measurementId || isPrivateRoute) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        nonce={nonce}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){ window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', ${JSON.stringify(measurementId)}, { send_page_view: false });
          `,
        }}
      />
    </>
  );
}
