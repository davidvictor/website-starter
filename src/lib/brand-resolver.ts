/**
 * Resolve default block props from the canonical brand data. This is
 * the bridge between `@/lib/brand.ts` (one big constant) and the typed
 * per-kind props contracts (`BlockPropsByKind`).
 *
 * Variants that have migrated to accept props read from these results;
 * legacy zero-arg variants still reach into `@/lib/brand` directly and
 * the props are simply ignored.
 *
 * Splitting `brand.ts` into per-kind modules is a future refactor —
 * `getBlockProps(kind)` is the seam that lets it happen one kind at a
 * time.
 */

import type { BlockKind, BlockPropsByKind } from "@/components/blocks"
import {
  brand,
  customerLogos,
  faq,
  features,
  navLinks,
  pricingTiers,
  products,
  stats,
  taglines,
  testimonials,
} from "@/lib/brand"

const resolvers: {
  [K in BlockKind]: () => BlockPropsByKind[K]
} = {
  hero: () => ({
    brand,
    tagline: taglines.secondary,
    cta: {
      primary: { label: "Read the docs", href: "/pricing" },
      secondary: { label: `Why we built ${brand.name}`, href: "/about" },
    },
  }),
  logos: () => ({
    logos: customerLogos.map((l) => (typeof l === "string" ? { name: l } : l)),
  }),
  features: () => ({
    features: features.map((f) => ({
      title: f.title,
      body: f.body,
      icon: f.icon,
    })),
  }),
  stats: () => ({ stats }),
  testimonials: () => ({
    testimonials: testimonials.map((t) => ({
      quote: t.quote,
      author: t.name,
      title: t.title,
      company: t.company,
    })),
  }),
  pricing: () => ({ tiers: pricingTiers }),
  faq: () => ({ items: faq }),
  cta: () => ({
    brand,
    tagline: taglines.short,
    cta: { label: "Start a trial", href: "/pricing" },
  }),
  footer: () => ({
    brand,
    navLinks,
    products: products.map((p) => ({ name: p.name, tagline: p.tagline })),
  }),
}

/** Resolve default props for the given block kind from brand data. */
export function getBlockProps<K extends BlockKind>(
  kind: K
): BlockPropsByKind[K] {
  return resolvers[kind]() as BlockPropsByKind[K]
}
