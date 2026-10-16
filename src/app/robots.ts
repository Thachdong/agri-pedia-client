import type { MetadataRoute } from "next";
import { publicEnv } from "@/shared/config";
import { ROUTES } from "@/shared/constants";

/** Cho crawl trang public; chặn API, trang riêng tư (chẩn đoán, hồ sơ của tôi) và trang auth. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ROUTES.diagnosis.list, ROUTES.myProfile, "/auth/"],
    },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  };
}
