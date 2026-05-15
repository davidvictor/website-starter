/**
 * Two axes define every page in this project:
 *
 *   - THEME       — the palette + typography preset applied to <html>.
 *                   The full list lives in src/themes/registry — adding
 *                   a new theme is an entry, not a type edit.
 *
 *   - COMPOSITION — the block layout used to compose a page (the set of
 *                   Hero/Features/... block variants chosen for each
 *                   slot).
 *
 * The two axes are independent: any theme can render under any
 * composition. The dev panel exposes opinionated theme×composition pairs
 * via QUICK_COMBOS, but those are data, not a hard mapping.
 */

import type { BlockKind, BlockPropsByKind } from "@/components/blocks"

/** Identifier strings — the registry is authoritative, not the type. */
export type ThemeId = string
export type CompositionId = string

/**
 * A slot entry is either:
 *  - a string: the variant id (props default from `brand-resolver`)
 *  - an object: variant id + a partial props override applied on top
 */
export type SlotEntry<K extends BlockKind> =
  | string
  | { variantId: string; props?: Partial<BlockPropsByKind[K]> }

/**
 * A composition specifies which variant of each block kind to render.
 * Slots are keyed by `BlockKind`; missing keys mean "don't render this
 * block". Mixed compositions ("editorial hero + saas pricing") are
 * fine — every block looks up its own slot at render time.
 */
export type Composition = {
  id: CompositionId
  label: string
  /** Public route that renders this composition. */
  path: string
  /** Short tagline shown in dev panel chrome. */
  description: string
  /** Per-block variant ids (or `{variantId, props}` for per-slot overrides). */
  slots: { [K in BlockKind]?: SlotEntry<K> }
}

/** Block-layout compositions, in canonical display order. */
export const COMPOSITIONS: readonly Composition[] = [
  {
    id: "editorial",
    label: "Editorial",
    path: "/editorial",
    description: "Single-column print pacing.",
    slots: {
      hero: "editorial",
      logos: "editorial",
      features: "editorial",
      stats: "editorial",
      testimonials: "editorial",
      pricing: "editorial",
      faq: "editorial",
      cta: "editorial",
      footer: "editorial",
    },
  },
  {
    id: "saas",
    label: "SaaS",
    path: "/",
    description: "Balanced product pacing.",
    slots: {
      hero: "saas",
      logos: "saas",
      features: "saas",
      stats: "saas",
      testimonials: "saas",
      pricing: "saas",
      faq: "saas",
      cta: "saas",
      footer: "saas",
    },
  },
  {
    id: "bold",
    label: "Bold",
    path: "/bold",
    description: "Expressive, gradient-heavy.",
    slots: {
      hero: "bold",
      logos: "bold",
      features: "bold",
      stats: "bold",
      testimonials: "bold",
      pricing: "bold",
      faq: "bold",
      cta: "bold",
      footer: "bold",
    },
  },
]

/**
 * Opinionated theme × composition pairings shown in the dev panel's
 * "quick combos" section. Pure data — adding/removing a combo is an
 * entry edit, not a code change.
 */
export type QuickCombo = {
  themeId: ThemeId
  compositionId: CompositionId
  label?: string
}

export const QUICK_COMBOS: readonly QuickCombo[] = [
  { themeId: "editorial", compositionId: "editorial" },
  { themeId: "saas", compositionId: "saas" },
  { themeId: "bold", compositionId: "bold" },
  { themeId: "cyber", compositionId: "bold" },
]

export function findCompositionByPath(path: string): Composition | undefined {
  return COMPOSITIONS.find((c) => c.path === path)
}

export function findComposition(id: CompositionId): Composition | undefined {
  return COMPOSITIONS.find((x) => x.id === id)
}
