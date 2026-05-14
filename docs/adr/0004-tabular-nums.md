# 0004 — Tabular numbers via `.tabular` utility

**Status:** Accepted

## Decision

Numeric data uses an explicit `.tabular` utility class (`font-variant-numeric: tabular-nums lining-nums`). No global baseline; authors opt in per usage site.

## Why

A global `tabular-nums` rule shifts heading typography that happens to contain digits (e.g. `9.2T`, `99.997%`) — sometimes desirable, sometimes not. Targeted application gives precise control. The class is shorter than the full property declaration and groups related polish rules together.

## How to apply

- Wrap dynamic or aligned numbers: `<span className="tabular">{formatted}</span>`.
- Use on: prices, stats, dates, counters, percentages, table cells displaying numbers.
- Skip on: prose that contains incidental digits (e.g. "10 years of experience"), headings where proportional digits read better.
- Pair with `formatCurrency`/`formatCompact`/`formatPercent`/`formatDate` from `@/lib/format`.
