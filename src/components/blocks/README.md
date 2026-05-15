# `src/components/blocks/` — block conventions

> The block library. Each block type keeps the required variants. Read this before adding or modifying.

## File layout

```
src/components/blocks/
  <type>/
    index.ts          # re-exports + variant registry
    editorial.tsx     # required
    saas.tsx          # required
    bold.tsx          # required
    <extra>.tsx       # optional (e.g., minimal, cyber)
```

Current types: `hero`, `features`, `logos`, `stats`, `testimonials`, `pricing`, `faq`, `cta`, `footer`.

## Invariants

1. **Required variants per block type.** Adding a new type means shipping editorial, saas, and bold. Skipping a required variant violates the variant contract in [AGENTS.md](../../../AGENTS.md).
2. **Variants share the same data prop shape.** All required variants of a block kind consume the same prop shape from `src/components/blocks/props.ts`; only their presentation differs.
3. **No copy inlined in JSX.** Blocks receive content through `getBlockProps(kind)` from `src/lib/brand-resolver.ts`. The block doesn't know about Nimbus or any specific copy.
4. **Server components by default.** Add `"use client"` only when a hook or motion API requires it (typically the interactive shader heroes).
5. **No imports from `src/components/ui/**` outside the documented primitive set** (Button, Badge, Card, Tabs, etc.). If you need something not there, compose existing primitives — don't go fishing through `ui/` for one-offs.
6. **No hex literals.** Theme tokens only (`bg-primary`, `text-accent`, `var(--*)`).

## Data contract

Every block variant consumes a typed prop shape from `src/components/blocks/props.ts`. `src/lib/brand-resolver.ts` is the canonical bridge from `src/lib/brand.ts` into those per-kind props. Pattern:

```tsx
// src/components/blocks/hero/saas.tsx
import type { HeroProps } from "../props"

export function HeroSaas({ headline, tagline }: HeroProps) {
  return (
    <section>
      <h1>{headline.before}</h1>
      <p>{tagline}</p>
      {/* ... */}
    </section>
  )
}
```

Pages can override per-route by spreading defaults and replacing the fields they need:

```tsx
<HeroSaas
  {...getBlockProps("hero")}
  tagline="A client-specific proof line."
/>
```

## How to add a new variant

Example: a `minimal` hero variant.

```bash
cp src/components/blocks/hero/editorial.tsx src/components/blocks/hero/minimal.tsx
```

Then:

1. Edit `minimal.tsx` for the new design. Keep the same block-kind prop type.
2. Re-export from `src/components/blocks/hero/index.ts`:
   ```ts
   import { HeroMinimal } from "./minimal"

   export const heroVariants = {
     // existing variants...
     minimal: { id: "minimal", label: "Minimal", Component: HeroMinimal },
   }

   export { HeroMinimal }
   ```
3. Update `src/lib/compositions.ts` if any composition should pair with the new variant.
4. Add the new variant to the gallery at `src/app/(internal)/variants/page.tsx`.

An additional variant is allowed and may stay project-specific. The required originals must still ship — don't replace them.

## How to add a new block type

Example: a `comparison` block (feature matrix vs competitors).

```bash
mkdir -p src/components/blocks/comparison
```

Then create the full required variant set:

```tsx
// src/components/blocks/comparison/editorial.tsx
import type { ComparisonProps } from "../props"

export function ComparisonEditorial({ rows }: ComparisonProps) {
  return <section>{/* editorial design using rows */}</section>
}
```

Same pattern for `saas.tsx` and `bold.tsx`.

Then:

1. Create `src/components/blocks/comparison/index.ts`:
   ```ts
   import type { VariantRegistryFor } from "../types"
   import { ComparisonBold } from "./bold"
   import { ComparisonEditorial } from "./editorial"
   import { ComparisonSaas } from "./saas"

   export const comparisonVariants: VariantRegistryFor<"comparison"> = {
     editorial: { id: "editorial", label: "Editorial", Component: ComparisonEditorial },
     saas: { id: "saas", label: "SaaS", Component: ComparisonSaas },
     bold: { id: "bold", label: "Bold", Component: ComparisonBold },
   }

   export { ComparisonBold, ComparisonEditorial, ComparisonSaas }
   ```
2. Define `ComparisonProps` in `src/components/blocks/props.ts`.
3. Add example data to `src/lib/brand.ts` and a `comparison` resolver in `src/lib/brand-resolver.ts`.
4. Add to `src/components/blocks/index.ts`, `src/components/blocks/types.ts`, and `src/lib/compositions.ts` so it appears in the registry/gallery defaults.
5. Add to `src/app/(internal)/variants/page.tsx` if the gallery needs a custom section layout for the new kind.
6. Use it on at least one page so it's visually exercised.

## How to update a variant's content

Don't. Update the data in `src/lib/brand.ts`. The variant is presentation; the data is content. See [`PAYLOAD_CMS_FUTURE.md`](../../../docs/PAYLOAD_CMS_FUTURE.md) for why this separation matters.

## How to update a variant's design

Edit the variant file directly. Theme tokens (`bg-primary`, `text-foreground`, `border-border`) only — no hex.

If the design change is "this variant should always look like X," edit the variant.

If the design change is "I want a fourth way this could look," add a new variant (above).

If the design change is "every hero should look like X," check whether what you're really changing is theme tokens (e.g., heading font, radius, accent usage) — those changes belong in `src/themes/registry.json`.

## Common pitfalls

- **Inlining copy in a variant for "just this one section."** That breaks the brand-data separation. Add a field to `brand.ts`, expose it through `brand-resolver.ts`, and type it in `props.ts`.
- **Forgetting to update the variants gallery** after adding/removing a variant. The gallery is the contract that every variant is side-by-side visible.
- **Adding a hex color** because the theme doesn't have what you need. Tune the theme instead — or add a new semantic token in `src/themes/`.
- **Importing motion APIs directly** instead of using the primitives from `src/components/motion/`. The primitives respect `prefers-reduced-motion`; ad-hoc motion doesn't.
- **Making one variant Client-only** when the others are Server. Reasonable in isolation, but check that the page composition still works (Server Components can't contain Client Components in certain configurations — usually fine because blocks are siblings, not nested).

## See also

- [`src/themes/README.md`](../../themes/README.md) — for the token contract block variants consume.
- [`src/components/ui/README.md`](../ui/README.md) — for the off-bounds primitives.
- [`AGENTS.md`](../../../AGENTS.md) — for the page/section/component playbook.
- The variants gallery at `/variants` (run `pnpm dev`) — the live reference.
