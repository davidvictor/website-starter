import type { BlockKind, VariantRegistryFor } from "./types"

export * from "./cta"
export * from "./faq"
export * from "./features"
export * from "./footer"
export * from "./hero"
export * from "./logos"
export * from "./pricing"
export type { BlockPropsByKind } from "./props"
export { SiteHeader } from "./site-header"
export * from "./stats"
export * from "./testimonials"
export type {
  BlockKind,
  BlockVariant,
  VariantRegistry,
  VariantRegistryFor,
} from "./types"

import { ctaVariants } from "./cta"
import { faqVariants } from "./faq"
import { featuresVariants } from "./features"
import { footerVariants } from "./footer"
import { heroVariants } from "./hero"
import { logosVariants } from "./logos"
import { pricingVariants } from "./pricing"
import { statsVariants } from "./stats"
import { testimonialsVariants } from "./testimonials"

/**
 * Master registry, keyed by `BlockKind`. Each entry is typed against
 * its kind's props in `BlockPropsByKind`, so composed pages and
 * hand-authored routes share the same data contract.
 */
export const BLOCK_REGISTRY: {
  [K in BlockKind]: VariantRegistryFor<K>
} = {
  hero: heroVariants,
  logos: logosVariants,
  features: featuresVariants,
  stats: statsVariants,
  testimonials: testimonialsVariants,
  pricing: pricingVariants,
  faq: faqVariants,
  cta: ctaVariants,
  footer: footerVariants,
}

/** Block kinds in canonical render order — used by the composition layout. */
export const BLOCK_ORDER: readonly BlockKind[] = [
  "hero",
  "logos",
  "features",
  "stats",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "footer",
]
