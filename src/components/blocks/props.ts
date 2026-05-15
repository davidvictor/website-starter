/**
 * Typed props per block kind — the data contract a variant accepts
 * when it opts in to per-instance data.
 *
 * Variants receive their data through this contract so pages,
 * compositions, and the future CMS bridge all exercise the same path.
 */

import type { Metric, PricingTier, StatPair } from "@/lib/brand-types"

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
  socials?: {
    x?: string
    github?: string
    linkedin?: string
  }
}

/* ------------------------------------------------------------------ */
/* Per-kind props                                                       */
/* ------------------------------------------------------------------ */

export type HeroProps = {
  brand: BrandCore
  eyebrow?: string
  headline: {
    before: string
    emphasis: string
    after?: string
  }
  tagline: string
  bullets?: readonly string[]
  cta?: { primary: Cta; secondary?: Cta }
  stats?: readonly { label: string; value: string }[]
  proof?: string
}

export type LogosProps = {
  logos: readonly { name: string; logo?: string; initials?: string }[]
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
    avatar?: string
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
  eyebrow?: string
  headline: {
    before: string
    emphasis?: string
    after?: string
  }
  body: string
  cta?: { primary: Cta; secondary?: Cta }
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
