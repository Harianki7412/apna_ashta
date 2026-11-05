import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/chat",
          "/dashboard",
          "/profile",
          "/favorites",
          "/notifications",
          "/saved-searches",
          "/agreements",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/offline",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
    host: SITE_URL.host,
  };
}
