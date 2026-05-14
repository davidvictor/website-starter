# 0008 — brand.ts typed numeric schema

**Status:** Accepted

## Decision

Numeric data in `src/lib/brand.ts` uses typed structures, not hand-written strings:

```ts
type Price = { value: number; currency: "USD"; cadence: "month" | "year" }
type Metric = { value: number; unit?: string; format: "compact" | "percent" | "plain"; precision?: number }
```

Format helpers in `src/lib/format.ts` (`formatCurrency`, `formatCompact`, `formatPercent`, `formatDate`) consume these shapes and produce display strings.

## Why

Strings like `"$29"` and `"9.2T"` can't be animated, can't be toggled (monthly/annual), can't be sorted, and can't be reformatted for other locales. Typed data unlocks `AnimatedNumber`, the pricing toggle, and any future feature that needs numeric reasoning.

## How to apply

- New marketing data: define a typed structure first; never inline a formatted string.
- Display: read the typed value, pass through the appropriate formatter, wrap in `<span className="tabular">`.
- Animation: feed the raw `value` to `<AnimatedNumber value={…} format={…} />`.
