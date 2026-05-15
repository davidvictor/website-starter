# `src/components/blocks/` — block conventions

> The 27-block library. Three variants per type. Read this before adding or modifying.

## File layout

```
src/components/blocks/
  <type>/
    index.ts          # re-exports + default
    editorial.tsx     # required
    saas.tsx          # required
    bold.tsx          # required
    <extra>.tsx       # optional (e.g., minimal, cyber)
```

Current types: `hero`, `features`, `logos`, `stats`, `testimonials`, `pricing`, `faq`, `cta`, `footer`.

## Invariants

1. **Three (or more) variants per block type.** Adding a new type means shipping editorial, saas, and bold. Skipping is a contract violation per [AGENTS.md](../../../AGENTS.md) §5 invariant #6.
2. **Variants share the same data prop shape.** All three variants of `hero` consume the same data shape from `src/lib/brand.ts`; only their presentation differs.
3. **No copy inlined in JSX.** Blocks read from `src/lib/brand.ts` via typed shapes in `src/lib/brand-types.ts`. The block doesn't know about Nimbus or any specific copy.
4. **Server components by default.** Add `"use client"` only when a hook or motion API requires it (typically the interactive shader heroes).
5. **No imports from `src/components/ui/**` outside the documented primitive set** (Button, Badge, Card, Tabs, etc.). If you need something not there, compose existing primitives — don't go fishing through `ui/` for one-offs.
6. **No hex literals.** Theme tokens only (`bg-primary`, `text-accent`, `var(--*)`).

## Data contract

Every block variant consumes a typed data shape from `src/lib/brand-types.ts`. Pattern:

```tsx
// src/components/blocks/hero/saas.tsx
import { brand } from "@/lib/brand"
import type { HeroData } from "@/lib/brand-types"

type Props = { data?: HeroData }

export default function SaasHero({ data = brand.hero }: Props) {
  return (
    <section>
      <h1>{data.headline}</h1>
      <p>{data.subhead}</p>
      {/* ... */}
    </section>
  )
}
```

The `data` prop is optional — the default reads from `brand.ts`. Pages can override per-route by passing a different `data` shape.

## How to add a new variant

Example: a fourth `minimal` hero variant.

```bash
cp src/components/blocks/hero/editorial.tsx src/components/blocks/hero/minimal.tsx
```

Then:

1. Edit `minimal.tsx` for the new design. Keep the same `data` prop type.
2. Re-export from `src/components/blocks/hero/index.ts`:
   ```ts
   export { default as EditorialHero } from "./editorial"
   export { default as SaasHero } from "./saas"
   export { default as BoldHero } from "./bold"
   export { default as MinimalHero } from "./minimal"   // ← new
   ```
3. Update `src/lib/compositions.ts` if any composition should pair with the new variant.
4. Add the new variant to the gallery at `src/app/(marketing)/variants/page.tsx`.

A fourth variant is allowed and may stay project-specific. The three originals must still ship — don't replace them.

## How to add a new block type

Example: a `comparison` block (feature matrix vs competitors).

```bash
mkdir -p src/components/blocks/comparison
```

Then create all three variants:

```tsx
// src/components/blocks/comparison/editorial.tsx
import { brand } from "@/lib/brand"
import type { ComparisonData } from "@/lib/brand-types"

type Props = { data?: ComparisonData }

export default function EditorialComparison({ data = brand.comparison }: Props) {
  return <section>{/* editorial design */}</section>
}
```

Same pattern for `saas.tsx` and `bold.tsx`.

Then:

1. Create `src/components/blocks/comparison/index.ts`:
   ```ts
   export { default as EditorialComparison } from "./editorial"
   export { default as SaasComparison } from "./saas"
   export { default as BoldComparison } from "./bold"
   ```
2. Define `ComparisonData` in `src/lib/brand-types.ts`.
3. Add example data to `src/lib/brand.ts` under `comparison:`.
4. Add to `src/lib/compositions.ts` so it appears in the gallery defaults.
5. Add to `src/app/(marketing)/variants/page.tsx` so all three variants render side-by-side.
6. Use it on at least one page so it's visually exercised.

## How to update a variant's content

Don't. Update the data in `src/lib/brand.ts`. The variant is presentation; the data is content. See [`PAYLOAD_CMS_FUTURE.md`](../../../docs/PAYLOAD_CMS_FUTURE.md) for why this separation matters.

## How to update a variant's design

Edit the variant file directly. Theme tokens (`bg-primary`, `text-foreground`, `border-border`) only — no hex.

If the design change is "this variant should always look like X," edit the variant.

If the design change is "I want a fourth way this could look," add a new variant (above).

If the design change is "every hero should look like X," check whether what you're really changing is theme tokens (e.g., heading font, radius, accent usage) — those changes belong in `src/themes/registry.json`.

## Common pitfalls

- **Inlining copy in a variant for "just this one section."** That breaks the brand-data separation. Add a field to `brand.ts` and `brand-types.ts`.
- **Forgetting to update the variants gallery** after adding/removing a variant. The gallery is the contract that every variant is side-by-side visible.
- **Adding a hex color** because the theme doesn't have what you need. Tune the theme instead — or add a new semantic token in `src/themes/`.
- **Importing motion APIs directly** instead of using the primitives from `src/components/motion/`. The primitives respect `prefers-reduced-motion`; ad-hoc motion doesn't.
- **Making one variant Client-only** when the others are Server. Reasonable in isolation, but check that the page composition still works (Server Components can't contain Client Components in certain configurations — usually fine because blocks are siblings, not nested).

## See also

- [`src/themes/README.md`](../../themes/README.md) — for the token contract block variants consume.
- [`src/components/ui/README.md`](../ui/README.md) — for the off-bounds primitives.
- [`AGENTS.md`](../../../AGENTS.md) §7 — for the page/section/component playbook.
- The variants gallery at `/variants` (run `pnpm dev`) — the live reference.
