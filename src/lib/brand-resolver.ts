/**
 * Resolve default block props from the canonical brand data. This is
 * the bridge between `@/lib/brand.ts` (one big constant) and the typed
 * per-kind props contracts (`BlockPropsByKind`).
 *
 * Variants read from these results instead of importing global brand
 * constants directly, which keeps per-page overrides and the future CMS
 * bridge on one data path.
 */

import type { BlockKind, BlockPropsByKind } from "@/components/blocks"
import {
  blockContent,
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
import { formatMetric } from "@/lib/format"

const resolvers: {
  [K in BlockKind]: () => BlockPropsByKind[K]
} = {
  hero: () => ({
    brand,
    eyebrow: blockContent.hero.eyebrow,
    headline: blockContent.hero.headline,
    tagline: taglines.secondary,
    proof: blockContent.hero.proof,
    stats: stats.map((stat) => ({
      label: stat.label,
      value: formatMetric(stat.metric),
    })),
    cta: blockContent.hero.cta,
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
      avatar: t.avatar,
    })),
  }),
  pricing: () => ({
    tiers: pricingTiers,
    headline: blockContent.pricing.headline,
    subhead: blockContent.pricing.subhead,
  }),
  faq: () => ({ items: faq }),
  cta: () => ({
    brand,
    eyebrow: blockContent.cta.eyebrow,
    headline: blockContent.cta.headline,
    body: blockContent.cta.body,
    cta: blockContent.cta.cta,
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
