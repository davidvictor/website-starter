/**
 * Format helpers — Intl-based formatters for the typed numeric data in brand.ts.
 * See docs/adr/0008-brand-numeric-schema.md.
 */

export type Cadence = "month" | "year"

export type Price = {
  value: number
  currency: "USD"
  cadence?: Cadence
}

export type MetricFormat = "compact" | "percent" | "plain"

export type Metric = {
  value: number
  unit?: string
  format: MetricFormat
  precision?: number
}

const CADENCE_SUFFIX: Record<Cadence, string> = {
  month: "/mo",
  year: "/yr",
}

export function formatCurrency(price: Price): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: Number.isInteger(price.value) ? 0 : 2,
    maximumFractionDigits: 2,
  })
  const base = formatter.format(price.value)
  return price.cadence ? `${base}${CADENCE_SUFFIX[price.cadence]}` : base
}

export function formatPrice(price: Price): { amount: string; cadence: string } {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: Number.isInteger(price.value) ? 0 : 2,
    maximumFractionDigits: 2,
  })
  return {
    amount: formatter.format(price.value),
    cadence: price.cadence ? CADENCE_SUFFIX[price.cadence] : "",
  }
}

export function formatCompact(value: number, precision = 1): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: precision,
  }).format(value)
}

export function formatPercent(value: number, precision = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  }).format(value)
}

export function formatPlain(value: number, precision = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  }).format(value)
}

export function formatMetric(metric: Metric): string {
  const precision = metric.precision ?? (metric.format === "percent" ? 0 : 1)
  let core: string
  switch (metric.format) {
    case "compact":
      core = formatCompact(metric.value, precision)
      break
    case "percent":
      core = formatPercent(metric.value, precision)
      break
    case "plain":
      core = formatPlain(metric.value, precision)
      break
  }
  return metric.unit ? `${core}${metric.unit}` : core
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
})

export function formatDate(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate
  return DATE_FORMATTER.format(date)
}

/**
 * Render either a Metric or a Price. Useful for cases where a value might be
 * a percentage, a multiplier, or a currency amount (e.g. customer metrics).
 */
export function formatMetricOrPrice(value: Metric | Price): string {
  if ("currency" in value) {
    return formatCurrency(value)
  }
  return formatMetric(value)
}
