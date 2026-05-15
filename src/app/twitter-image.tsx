// Re-uses the OG image for Twitter cards (summary_large_image accepts
// the 1200×630 surface). Next.js wants these consts declared statically
// per file (re-exporting `runtime` isn't allowed), so we redeclare them.

import { siteConfig } from "@/config/site"

export { default } from "./opengraph-image"

export const runtime = "edge"
export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
