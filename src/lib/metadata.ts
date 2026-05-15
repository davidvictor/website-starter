import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

type Args = {
  title?: string
  description?: string
  /** Route path with leading slash, e.g. "/pricing". Default "" = home. */
  path?: string
  robots?: Metadata["robots"]
}

/**
 * Canonical page metadata builder. Use on every route's `export const
 * metadata` — do not hand-roll OG / Twitter / canonical per page.
 *
 * Examples:
 *   export const metadata = siteMetadata()
 *   export const metadata = siteMetadata({ title: "Pricing", path: "/pricing" })
 */
export function siteMetadata({
  title,
  description,
  path = "",
  robots,
}: Args = {}): Metadata {
  const url = `${siteConfig.url}${path}`
  const fullTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name
  const desc = description ?? siteConfig.description

  return {
    metadataBase: new URL(siteConfig.url),
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
    robots,
  }
}
