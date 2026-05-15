/**
 * Typed props per block kind — the data contract a variant accepts
 * when it opts in to per-instance data.
 *
 * Today most variants are zero-arg and read from `@/lib/brand`
 * directly. The contract is forward-facing: when a variant migrates
 * to accept props, it implements `BlockPropsByKind[kind]`. Until
 * then, props are passed but ignored.
 */

import type { PricingTier } from "@/lib/brand"
import type { Metric, StatPair } from "@/lib/brand-types"

/* ------------------------------------------------------------------ */
/* Shared shapes                                                        */
/* ------------------------------------------------------------------ */

export type Cta = {
  label: string
  href: string
}

export type BrandCore = {
  name: string
  wordmark?: string
  domain?: string
  founded?: number | string
  description?: string
  currentYear?: number
}

/* ------------------------------------------------------------------ */
/* Per-kind props                                                       */
/* ------------------------------------------------------------------ */

export type HeroProps = {
  brand: BrandCore
  tagline: string
  bullets?: readonly string[]
  cta?: { primary: Cta; secondary?: Cta }
  stats?: readonly { label: string; value: string }[]
}

export type LogosProps = {
  logos: readonly { name: string; logo?: string }[]
}

export type FeaturesProps = {
  features: readonly { title: string; body: string; icon?: string }[]
}

export type StatsProps = {
  stats: readonly StatPair[] | readonly { label: string; value: string }[]
  /** Optional eyebrow / kicker copy. */
  eyebrow?: string
}

export type TestimonialsProps = {
  testimonials: readonly {
    quote: string
    author: string
    title?: string
    company?: string
  }[]
}

export type PricingProps = {
  tiers: readonly PricingTier[]
  /** Optional headline / subhead pair. */
  headline?: string
  subhead?: string
}

export type FaqProps = {
  items: readonly { question: string; answer: string }[]
  headline?: string
}

export type CtaProps = {
  brand: BrandCore
  tagline: string
  cta?: Cta
}

export type FooterProps = {
  brand: BrandCore
  navLinks?: readonly { href: string; label: string }[]
  products?: readonly { name: string; tagline?: string }[]
}

/* ------------------------------------------------------------------ */
/* Per-kind map                                                         */
/* ------------------------------------------------------------------ */

export type BlockPropsByKind = {
  hero: HeroProps
  logos: LogosProps
  features: FeaturesProps
  stats: StatsProps
  testimonials: TestimonialsProps
  pricing: PricingProps
  faq: FaqProps
  cta: CtaProps
  footer: FooterProps
}

// Side-effect-free re-export to satisfy type-only consumers.
export type { Metric }
