import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL.toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL("/privacy", SITE_URL).toString(),
      lastModified: "2026-07-17",
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
