/**
 * Project-wide source of truth: name, description, URL, links, nav.
 * Read from here; do not duplicate. Per-clone, this is the first file
 * to edit (after `package.json` rename).
 */

import { env } from "./env"

export const siteConfig = {
  name: "Website Starter",
  description:
    "A reusable Next.js marketing website starter with block variants, seed content, a typed dev panel, and a controller-driven theme system.",
  url: env.NEXT_PUBLIC_SITE_URL,
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
  links: {
    github: "https://github.com/davidvictor/website-starter",
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
