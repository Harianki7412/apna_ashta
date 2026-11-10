"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function SplashScreen() {
  const t = useTranslations("home");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("flatova-splash-shown")) {
        setVisible(false);
        return;
      }
      window.sessionStorage.setItem("flatova-splash-shown", "true");
    } catch (error) {
      console.warn("[PWA] Could not read splash preference:", error);
    }

    const timer = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="app-splash"
      role="status"
      aria-label={t("splashMessage")}
    >
      <div className="app-splash__sky" aria-hidden="true" />
      <div className="app-splash__content">
        <div className="app-splash__mark">
          <Image
            src="/icons/icon.svg"
            alt=""
            width={88}
            height={88}
            priority
          />
        </div>
        <p className="app-splash__name">Flatova</p>
        <p className="app-splash__tagline">{t("splashTagline")}</p>
        <span className="app-splash__loader" aria-hidden="true" />
      </div>
      <svg
        className="app-splash__city"
        viewBox="0 0 768 210"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="splash-city" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#38bdf8" stopOpacity=".12" />
            <stop offset="1" stopColor="#2563eb" stopOpacity=".48" />
          </linearGradient>
        </defs>
        <path
          fill="url(#splash-city)"
          d="M0 148h32v-46h24v46h11V72h35v76h17V112h30v36h20V50h42v98h18v-62h32v62h26v-31h34v31h28v-57h40v57h22V78h32v70h20v-38h34v38h18V35h42v113h20V92h31v56h20v-75h38v75h27v62H0z"
        />
        <path
          fill="#38bdf8"
          fillOpacity=".15"
          d="M0 174c122-35 177-12 284 15s174 10 262-28 139-35 222-15v64H0z"
        />
        <path
          fill="#2563eb"
          fillOpacity=".18"
          d="M0 194c118-40 185-31 281-7s177 28 267-9 135-61 220-41v73H0z"
        />
      </svg>
    </div>
  );
}
