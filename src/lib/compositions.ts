/**
 * Two axes define every page in this project:
 *
 *   - THEME       — the palette + typography preset applied to <html>
 *                   (see src/themes/registry.json, controlled in dev panel).
 *                   Values: editorial | saas | bold | cyber.
 *
 *   - COMPOSITION — the block layout used to compose a page (the set of
 *                   Hero/Features/... block variants under
 *                   src/components/blocks).
 *                   Values: editorial | saas | bold.
 *
 * The two axes share a vocabulary on purpose — saying "cyber theme on the
 * editorial composition" is unambiguous because the words refer to
 * separate concerns. Pages combine the active THEME with their hard-coded
 * COMPOSITION to produce the rendered output.
 *
 * Cyber has no dedicated composition yet — when the user navigates to the
 * cyber tile in the dev panel, we apply the cyber theme and reuse the
 * bold composition (Bold's layout reads well under high-contrast neon).
 */

export type ThemeId = "editorial" | "saas" | "bold" | "cyber"
export type CompositionId = "editorial" | "saas" | "bold"

export type Composition = {
  id: CompositionId
  label: string
  /** Public route that renders this composition. */
  path: string
  /** Short tagline shown in dev panel chrome. */
  description: string
}

/** Block-layout compositions, in canonical display order. */
export const COMPOSITIONS: readonly Composition[] = [
  {
    id: "editorial",
    label: "Editorial",
    path: "/editorial",
    description: "Single-column print pacing.",
  },
  {
    id: "saas",
    label: "SaaS",
    path: "/",
    description: "Balanced product pacing.",
  },
  {
    id: "bold",
    label: "Bold",
    path: "/bold",
    description: "Expressive, gradient-heavy.",
  },
]

/** Map a theme → which composition route to land on when the user picks
 *  the theme from the dev panel's "homepage" grid. */
export const THEME_DEFAULT_COMPOSITION: Record<ThemeId, CompositionId> = {
  editorial: "editorial",
  saas: "saas",
  bold: "bold",
  // Cyber rides on the bold composition until it has its own block set.
  cyber: "bold",
}

export function findCompositionByPath(path: string): Composition | undefined {
  return COMPOSITIONS.find((c) => c.path === path)
}

export function findComposition(id: CompositionId): Composition {
  const c = COMPOSITIONS.find((x) => x.id === id)
  if (!c) throw new Error(`Unknown composition: ${id}`)
  return c
}
