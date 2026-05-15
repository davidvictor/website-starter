import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

/**
 * Production-aware robots rules. Production allows all crawling; every
 * other environment (preview, development) disallows everything so
 * leaked preview URLs don't get indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production"
  return {
    rules: isProd
      ? { userAgent: "*", allow: "/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
