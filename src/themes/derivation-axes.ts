/**
 * Derivation axes — data tables that the OKLCH engine consults when
 * resolving tokens. Adding a new contrast level or accent-usage mode is
 * one entry here; the engine reads, the dev panel enumerates, no other
 * code touches required.
 */

/* ------------------------------------------------------------------ */
/* Contrast                                                             */
/* ------------------------------------------------------------------ */

type ContrastAnchorsForMode = {
  bg: number
  fg: number
  card: number
  muted: number
  border: number
}

export type ContrastLevel = {
  id: string
  label: string
  anchors: {
    light: ContrastAnchorsForMode
    dark: ContrastAnchorsForMode
  }
}

export const CONTRAST_LEVELS: readonly ContrastLevel[] = [
  {
    id: "low",
    label: "Low",
    anchors: {
      light: { bg: 0.98, fg: 0.22, card: 0.97, muted: 0.94, border: 0.9 },
      dark: { bg: 0.16, fg: 0.94, card: 0.2, muted: 0.24, border: 0.28 },
    },
  },
  {
    id: "medium",
    label: "Medium",
    anchors: {
      light: { bg: 1.0, fg: 0.15, card: 0.985, muted: 0.96, border: 0.92 },
      dark: { bg: 0.13, fg: 0.97, card: 0.18, muted: 0.22, border: 0.26 },
    },
  },
  {
    id: "high",
    label: "High",
    anchors: {
      light: { bg: 1.0, fg: 0.08, card: 0.99, muted: 0.95, border: 0.88 },
      dark: { bg: 0.08, fg: 0.985, card: 0.14, muted: 0.2, border: 0.26 },
    },
  },
]

const CONTRAST_LEVELS_BY_ID: Readonly<Record<string, ContrastLevel>> =
  Object.fromEntries(CONTRAST_LEVELS.map((c) => [c.id, c]))

/** Resolve a contrast level by id; falls back to `medium` if unknown. */
export function resolveContrast(id: string): ContrastLevel {
  return (
    CONTRAST_LEVELS_BY_ID[id] ??
    CONTRAST_LEVELS_BY_ID.medium ??
    CONTRAST_LEVELS[0]
  )
}

/* ------------------------------------------------------------------ */
/* Accent usage                                                         */
/* ------------------------------------------------------------------ */

/**
 * Accent-usage modes describe how aggressively the accent surfaces in
 * the UI. The engine emits the mode as a `data-accent-usage` attribute
 * on `<html>` — block components and theme-aware utilities can read it
 * to choose between "rare" and "maximal" treatments.
 */
export type AccentUsageLevel = {
  id: string
  label: string
  description?: string
}

export const ACCENT_USAGE_LEVELS: readonly AccentUsageLevel[] = [
  { id: "rare", label: "Rare", description: "Single-use; mostly neutral UI." },
  {
    id: "primary-only",
    label: "Primary only",
    description: "Accent appears alongside primary highlights.",
  },
  {
    id: "broad",
    label: "Broad",
    description: "Accent surfaces across many UI affordances.",
  },
  {
    id: "maximal",
    label: "Maximal",
    description: "Accent everywhere; gradient hits, large fills.",
  },
]

/* ------------------------------------------------------------------ */
/* Route transitions                                                    */
/* ------------------------------------------------------------------ */

export type RouteTransitionDef = {
  id: string
  label: string
}

export const ROUTE_TRANSITION_MODES: readonly RouteTransitionDef[] = [
  { id: "none", label: "None" },
  { id: "vertical-translate", label: "Vertical translate" },
  { id: "blur-scale-fade", label: "Blur + scale + fade" },
]
