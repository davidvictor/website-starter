/**
 * Color token registry — the single place that knows what colors exist,
 * how they map to CSS variables, and how each is derived from the
 * controller inputs + derivation profile.
 *
 * Adding a new token = one entry in `COLOR_TOKENS`. The derived
 * `ColorTokens` type, the css-var mapping, and the dev-panel display
 * picker all flow from this file.
 */

import {
  applyAccentAnchor,
  darkenForMode,
  type OKLCH,
  oklchToCss,
  vibrancyToLC,
  warmthToNeutral,
} from "@/lib/color"

import type { ControllerInputs, DerivationProfile } from "./controller-types"
import { resolveContrast } from "./derivation-axes"

export type Mode = "light" | "dark"

/* ------------------------------------------------------------------ */
/* Derive context — pre-computed once, shared across all token specs    */
/* ------------------------------------------------------------------ */

export type NeutralPalette = {
  bg: OKLCH
  fg: OKLCH
  card: OKLCH
  muted: OKLCH
  mutedFg: OKLCH
  border: OKLCH
  input: OKLCH
  /** shadcn `accent` — used as hover/highlighted surface, NOT the brand accent. */
  surfaceAccent: OKLCH
  ring: OKLCH
  secondary: OKLCH
}

export type DeriveCtx = {
  inputs: ControllerInputs
  derivation: DerivationProfile
  mode: Mode
  primary: OKLCH
  accent: OKLCH
  neutral: NeutralPalette
}

export function buildDeriveCtx(
  inputs: ControllerInputs,
  derivation: DerivationProfile,
  mode: Mode
): DeriveCtx {
  // Primary
  const pLC = vibrancyToLC(inputs.primary.vibrancy)
  const primary: OKLCH = {
    l: mode === "dark" ? darkenForMode(pLC.l, { kind: "brand" }) : pLC.l,
    c: pLC.c * derivation.chromaBoost,
    h: inputs.primary.hue,
  }

  // Accent (anchor applied)
  const aLC = vibrancyToLC(inputs.accent.vibrancy)
  const accent: OKLCH = {
    l: mode === "dark" ? darkenForMode(aLC.l, { kind: "brand" }) : aLC.l,
    c: aLC.c * derivation.chromaBoost,
    h: applyAccentAnchor(
      inputs.primary.hue,
      inputs.accent.hue,
      inputs.accent.anchor
    ),
  }

  // Neutral palette (driven by warmth + contrast)
  const { hue: warmHue, chroma: warmChroma } = warmthToNeutral(
    inputs.warmth,
    inputs.primary.hue
  )
  const anchors = resolveContrast(derivation.contrast).anchors[mode]
  const c = warmChroma
  const h = warmHue
  const neutral: NeutralPalette = {
    bg: { l: anchors.bg, c, h },
    fg: { l: anchors.fg, c: c * 1.5, h },
    card: { l: anchors.card, c, h },
    muted: { l: anchors.muted, c: c * 1.4, h },
    mutedFg: { l: mode === "dark" ? 0.7 : 0.5, c: c * 1.4, h },
    border: { l: anchors.border, c, h },
    input: { l: anchors.border, c, h },
    surfaceAccent: { l: anchors.muted, c: c * 1.8, h },
    ring: { l: mode === "dark" ? 0.7 : 0.55, c, h },
    secondary: { l: anchors.muted, c: c * 1.4, h },
  }

  return { inputs, derivation, mode, primary, accent, neutral }
}

/* ------------------------------------------------------------------ */
/* Helpers used by individual token derive functions                    */
/* ------------------------------------------------------------------ */

/** Pick a readable near-black/near-white foreground for the given bg. */
export function foregroundFor(bg: OKLCH): OKLCH {
  return bg.l > 0.6 ? { l: 0.13, c: 0, h: 0 } : { l: 0.97, c: 0, h: 0 }
}

/** Build a semantic OKLCH at the given hue, modulated by intensity. */
export function semantic(hue: number, ctx: DeriveCtx): OKLCH {
  const baseL = ctx.mode === "dark" ? 0.7 : 0.58
  const baseC = 0.16 * ctx.derivation.semanticIntensity
  return { l: baseL, c: baseC, h: hue }
}

/* ------------------------------------------------------------------ */
/* The registry                                                          */
/* ------------------------------------------------------------------ */

export type ColorTokenCategory =
  | "surface"
  | "brand"
  | "semantic"
  | "chart"
  | "sidebar"

export type ColorTokenSpec = {
  /** CSS custom property name, including the leading `--`. */
  cssVar: string
  category: ColorTokenCategory
  /** Production rule. Receives the pre-computed context. */
  derive: (ctx: DeriveCtx) => string
}

/**
 * Adding a token: append a key here. The `ColorTokens` type, the
 * cssVar→key map, and the dev-panel sandbox enumeration all update
 * automatically.
 */
export const COLOR_TOKENS = {
  background: {
    cssVar: "--background",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.bg),
  },
  foreground: {
    cssVar: "--foreground",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.fg),
  },
  card: {
    cssVar: "--card",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.card),
  },
  cardForeground: {
    cssVar: "--card-foreground",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.fg),
  },
  popover: {
    cssVar: "--popover",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.card),
  },
  popoverForeground: {
    cssVar: "--popover-foreground",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.fg),
  },
  primary: {
    cssVar: "--primary",
    category: "brand",
    derive: (ctx) => oklchToCss(ctx.primary),
  },
  primaryForeground: {
    cssVar: "--primary-foreground",
    category: "brand",
    derive: (ctx) => oklchToCss(foregroundFor(ctx.primary)),
  },
  secondary: {
    cssVar: "--secondary",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.secondary),
  },
  secondaryForeground: {
    cssVar: "--secondary-foreground",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.fg),
  },
  muted: {
    cssVar: "--muted",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.muted),
  },
  mutedForeground: {
    cssVar: "--muted-foreground",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.mutedFg),
  },
  accent: {
    cssVar: "--accent",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.surfaceAccent),
  },
  accentForeground: {
    cssVar: "--accent-foreground",
    category: "surface",
    derive: (ctx) => oklchToCss(ctx.neutral.fg),
  },
  destructive: {
    cssVar: "--destructive",
    category: "semantic",
    derive: (ctx) => oklchToCss(semantic(25, ctx)),
  },
  border: {
    cssVar: "--border",
    category: "surface",
    derive: (ctx) =>
      oklchToCss(ctx.neutral.border, ctx.mode === "dark" ? 0.6 : 1),
  },
  input: {
    cssVar: "--input",
    category: "surface",
    derive: (ctx) =>
      oklchToCss(ctx.neutral.input, ctx.mode === "dark" ? 0.6 : 1),
  },
  ring: {
    cssVar: "--ring",
    category: "surface",
    derive: (ctx) => oklchToCss({ ...ctx.primary, l: ctx.neutral.ring.l }),
  },
  chart1: {
    cssVar: "--chart-1",
    category: "chart",
    derive: (ctx) => oklchToCss(ctx.primary),
  },
  chart2: {
    cssVar: "--chart-2",
    category: "chart",
    derive: (ctx) => oklchToCss(ctx.accent),
  },
  chart3: {
    cssVar: "--chart-3",
    category: "chart",
    derive: (ctx) => oklchToCss(semantic(215, ctx)),
  },
  chart4: {
    cssVar: "--chart-4",
    category: "chart",
    derive: (ctx) => oklchToCss(semantic(145, ctx)),
  },
  chart5: {
    cssVar: "--chart-5",
    category: "chart",
    derive: (ctx) => oklchToCss(semantic(70, ctx)),
  },
  sidebar: {
    cssVar: "--sidebar",
    category: "sidebar",
    derive: (ctx) => oklchToCss(ctx.neutral.card),
  },
  sidebarForeground: {
    cssVar: "--sidebar-foreground",
    category: "sidebar",
    derive: (ctx) => oklchToCss(ctx.neutral.fg),
  },
  sidebarPrimary: {
    cssVar: "--sidebar-primary",
    category: "sidebar",
    derive: (ctx) => oklchToCss(ctx.primary),
  },
  sidebarPrimaryForeground: {
    cssVar: "--sidebar-primary-foreground",
    category: "sidebar",
    derive: (ctx) => oklchToCss(foregroundFor(ctx.primary)),
  },
  sidebarAccent: {
    cssVar: "--sidebar-accent",
    category: "sidebar",
    derive: (ctx) => oklchToCss(ctx.neutral.surfaceAccent),
  },
  sidebarAccentForeground: {
    cssVar: "--sidebar-accent-foreground",
    category: "sidebar",
    derive: (ctx) => oklchToCss(ctx.neutral.fg),
  },
  sidebarBorder: {
    cssVar: "--sidebar-border",
    category: "sidebar",
    derive: (ctx) =>
      oklchToCss(ctx.neutral.border, ctx.mode === "dark" ? 0.6 : 1),
  },
  sidebarRing: {
    cssVar: "--sidebar-ring",
    category: "sidebar",
    derive: (ctx) => oklchToCss({ ...ctx.primary, l: ctx.neutral.ring.l }),
  },
  brandAccent: {
    cssVar: "--brand-accent",
    category: "brand",
    derive: (ctx) => oklchToCss(ctx.accent),
  },
  brandAccentForeground: {
    cssVar: "--brand-accent-foreground",
    category: "brand",
    derive: (ctx) => oklchToCss(foregroundFor(ctx.accent)),
  },
  success: {
    cssVar: "--success",
    category: "semantic",
    derive: (ctx) => oklchToCss(semantic(145, ctx)),
  },
  warning: {
    cssVar: "--warning",
    category: "semantic",
    derive: (ctx) => oklchToCss(semantic(70, ctx)),
  },
  info: {
    cssVar: "--info",
    category: "semantic",
    derive: (ctx) => oklchToCss(semantic(215, ctx)),
  },
} as const satisfies Record<string, ColorTokenSpec>

export type ColorTokenKey = keyof typeof COLOR_TOKENS
export type ColorTokens = Record<ColorTokenKey, string>

/** Ordered list of all token keys — useful for dev-panel enumeration. */
export const COLOR_TOKEN_KEYS = Object.keys(
  COLOR_TOKENS
) as readonly ColorTokenKey[]

/** Map of token key → CSS variable name. Mirrors the registry for legacy access. */
export const COLOR_TOKEN_TO_CSS_VAR = Object.fromEntries(
  COLOR_TOKEN_KEYS.map((k) => [k, COLOR_TOKENS[k].cssVar])
) as Readonly<Record<ColorTokenKey, string>>

/* ------------------------------------------------------------------ */
/* Engine entry point                                                    */
/* ------------------------------------------------------------------ */

export function deriveColorTokens(
  inputs: ControllerInputs,
  derivation: DerivationProfile,
  mode: Mode
): ColorTokens {
  const ctx = buildDeriveCtx(inputs, derivation, mode)
  const out = {} as ColorTokens
  for (const key of COLOR_TOKEN_KEYS) {
    out[key] = COLOR_TOKENS[key].derive(ctx)
  }
  return out
}
