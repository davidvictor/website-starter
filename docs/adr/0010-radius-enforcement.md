# 0010 — Concentric radius: doc + `useConcentric`

**Status:** Accepted

## Decision

Concentric border radius is enforced via documentation + a `useConcentric(outerRadius, padding)` helper. No lint rule (yet).

The rule: `innerRadius = outerRadius − padding`. Mismatched radii on nested rounded elements is the most common thing that makes interfaces feel off.

## Why

Most concentric violations live in static class lists where a lint rule could catch them — but the dynamic cases (a card with computed padding) need a runtime helper. Starting with docs + helper keeps the system flexible; we can add a Biome rule later if violations creep back.

## How to apply

- Static composition: outer `rounded-2xl` (16px) with `p-4` (16px padding) → inner `rounded-md` (8px).
- Dynamic composition:
  ```tsx
  const innerRadius = useConcentric("rounded-2xl", 16)
  return <div className={cn("rounded-2xl p-4", innerRadius)}>…</div>
  ```
- Common ratios in this codebase:
  - `rounded-xl` (12px) + `p-3` (12px) → `rounded-sm` (4px) inner
  - `rounded-2xl` (16px) + `p-4` (16px) → `rounded-md` (8px) inner
  - `rounded-3xl` (24px) + `p-6` (24px) → `rounded-lg` (12px) inner
