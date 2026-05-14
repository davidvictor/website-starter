# 0005 — Hit area opt-in via `data-touch`

**Status:** Accepted

## Decision

Compact button variants (`xs`, `sm`, `icon-xs`, `icon-sm`) keep their visual footprint (24px–28px). For touch contexts, authors opt in with `data-touch` to extend the hit area to ≥40×40 via a `::before` pseudo-element.

## Why

Lookbook is desktop-first; data tables, toolbars, and inline filter chips need tight controls. Forcing 40×40 everywhere breaks these layouts. But touch users need the larger target — so the choice belongs at the call site, not at the primitive level.

## How to apply

```tsx
<Button size="sm" data-touch>Save</Button>
```

The visible button stays 28px; the `::before` pseudo expands the clickable region invisibly to 40×40. Don't use `data-touch` on tightly-packed toolbars where the extended hit areas would overlap — that creates ambiguous interactions.
