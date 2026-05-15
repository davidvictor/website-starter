/**
 * Typed shapes for brand data. See docs/adr/0008-brand-numeric-schema.md
 * and docs/adr/0015-brand-phasing.md.
 *
 * Numeric values are raw — format helpers in `@/lib/format` produce
 * display strings.
 */

export type Cadence = "month" | "year"

/**
 * A recurring price. `cadence` is **required** — for one-time or
 * talk-to-sales surfaces, use `Price | null` at the tier level and render
 * a placeholder string instead.
 *
 * For a currency-valued metric that isn't a recurring price (e.g.
 * "annual spend reduction"), use `Metric` with `format: "currency"`.
 */
export type Price = {
  value: number
  currency: "USD"
  cadence: Cadence
}

export type MetricFormat = "compact" | "percent" | "plain" | "currency"

export type Metric = {
  value: number
  unit?: string
  format: MetricFormat
  precision?: number
}

/** A labelled metric — used for stats blocks. */
export type StatPair = {
  metric: Metric
  label: string
}

export type PricingTier = {
  id: string
  name: string
  price: Price | null
  priceYearly: Price | null
  description: string
  features: readonly string[]
  cta: string
  featured: boolean
}
