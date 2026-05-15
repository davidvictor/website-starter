/**
 * Project-wide source of truth: name, description, URL, links, nav.
 * Read from here; do not duplicate. Per-clone, this is the first file
 * to edit (after `package.json` rename).
 */

import { env } from "./env"

export const siteConfig = {
  name: "Lookbook",
  description:
    "A Next.js base for moving from design direction to clickable page in one sitting. Three style variants per block, a typed dev panel, and a controller-driven color system.",
  url: env.NEXT_PUBLIC_SITE_URL,
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
  links: {
    github: "https://github.com/davidvictor/lookbook",
  },
  navLinks: [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
} as const

export type SiteConfig = typeof siteConfig
