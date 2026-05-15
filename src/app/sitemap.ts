import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

/**
 * Marketing routes that should appear in the sitemap. Add to this list
 * when a new public route ships. Dev-only routes (`/sandbox`, `/examples/*`,
 * `/login`, `/signup`, `/dashboard`) are intentionally excluded.
 */
const MARKETING_ROUTES = [
  "",
  "/editorial",
  "/bold",
  "/variants",
  "/pricing",
  "/about",
  "/customers",
  "/changelog",
  "/blog",
  "/careers",
  "/contact",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return MARKETING_ROUTES.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }))
}
