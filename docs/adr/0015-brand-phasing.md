# 0015 — brand.ts migration lands in Phase 4a, before block sweep

**Status:** Accepted

## Decision

Migrating `src/lib/brand.ts` to typed numeric structures (Phase 4a) lands as its **own step** before the block variant sweep (Phase 4b). Types live in `src/lib/brand-types.ts`. Block files consume the typed data and the format helpers in `src/lib/format.ts`.

## Why

Block files and pages are the consumers of brand.ts. Type-checking the data layer first surfaces every consumer at once via TypeScript errors — that's a feature, not a bug. It forces Phase 4b's block sweep to touch exactly the files affected, no more, no less.

Doing 4a and 4b together would bundle the data migration with the visual sweep in a single PR, making review harder and visual diffs noisier. Separating them keeps each change reviewable on its own terms.

## How to apply

- New numeric data goes into `brand.ts` as typed `Price` / `Metric` / `StatPair` structures, not pre-formatted strings.
- Type-cascade failures after a `brand.ts` change are the to-do list for the next phase.
- Formatters live in `src/lib/format.ts`, types in `src/lib/brand-types.ts`.
