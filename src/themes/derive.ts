import {
  applyAccentAnchor,
  darkenForMode,
  type OKLCH,
  oklchToCss,
  vibrancyToLC,
  warmthToNeutral,
} from "@/lib/color"

import type { ControllerInputs, DerivationProfile } from "./controller-types"
import {
  DEFAULT_SHADOWS_DARK,
  DEFAULT_SHADOWS_LIGHT,
  type ColorTokens,
  type ShadowTokens,
} from "./types"

type Mode = "light" | "dark"

/* ------------------------------------------------------------------ */
/* Internal: compute the three "anchor" colors                          */
/* ------------------------------------------------------------------ */

function resolvePrimary(
  inputs: ControllerInputs,
  derivation: DerivationProfile,
  mode: Mode
): OKLCH {
  const { l, c } = vibrancyToLC(inputs.primary.vibrancy)
  const chroma = c * derivation.chromaBoost
  const lightness = mode === "dark" ? darkenForMode(l, { kind: "brand" }) : l
  return { l: lightness, c: chroma, h: inputs.primary.hue }
}

function resolveAccent(
  inputs: ControllerInputs,
  derivation: DerivationProfile,
  mode: Mode
): OKLCH {
  const { l, c } = vibrancyToLC(inputs.accent.vibrancy)
  const chroma = c * derivation.chromaBoost
  const lightness = mode === "dark" ? darkenForMode(l, { kind: "brand" }) : l
  const hue = applyAccentAnchor(
    inputs.primary.hue,
    inputs.accent.hue,
    inputs.accent.anchor
  )
  return { l: lightness, c: chroma, h: hue }
}

/* ------------------------------------------------------------------ */
/* Neutral palette (surfaces, borders, text)                            */
/* ------------------------------------------------------------------ */

type NeutralPalette = {
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

/** Lightness anchors per contrast level. */
const CONTRAST_ANCHORS = {
  low: {
    light: { bg: 0.98, fg: 0.22, card: 0.97, muted: 0.94, border: 0.9 },
    dark: { bg: 0.16, fg: 0.94, card: 0.2, muted: 0.24, border: 0.28 },
  },
  medium: {
    light: { bg: 1.0, fg: 0.15, card: 0.985, muted: 0.96, border: 0.92 },
    dark: { bg: 0.13, fg: 0.97, card: 0.18, muted: 0.22, border: 0.26 },
  },
  high: {
    light: { bg: 1.0, fg: 0.08, card: 0.99, muted: 0.95, border: 0.88 },
    dark: { bg: 0.08, fg: 0.985, card: 0.14, muted: 0.2, border: 0.26 },
  },
} as const

function resolveNeutral(
  inputs: ControllerInputs,
  derivation: DerivationProfile,
  mode: Mode
): NeutralPalette {
  const { hue: warmHue, chroma: warmChroma } = warmthToNeutral(
    inputs.warmth,
    inputs.primary.hue
  )
  const anchors = CONTRAST_ANCHORS[derivation.contrast][mode]
  const c = warmChroma
  const h = warmHue

  return {
    bg: { l: anchors.bg, c, h },
    fg: { l: anchors.fg, c: c * 1.5, h },
    card: { l: anchors.card, c, h },
    muted: { l: anchors.muted, c: c * 1.4, h },
    mutedFg: {
      l: mode === "dark" ? 0.7 : 0.5,
      c: c * 1.4,
      h,
    },
    border: { l: anchors.border, c, h },
    input: { l: anchors.border, c, h },
    surfaceAccent: { l: anchors.muted, c: c * 1.8, h },
    ring: { l: mode === "dark" ? 0.7 : 0.55, c, h },
    secondary: { l: anchors.muted, c: c * 1.4, h },
  }
}

/* ------------------------------------------------------------------ */
/* Semantic colors                                                      */
/* ------------------------------------------------------------------ */

/** Fixed perceptual hues; chroma/lightness modulated by preset. */
const SEMANTIC_HUES = {
  success: 145,
  warning: 70,
  destructive: 25,
  info: 215,
} as const

function resolveSemantic(
  hue: number,
  derivation: DerivationProfile,
  mode: Mode
): OKLCH {
  const baseL = mode === "dark" ? 0.7 : 0.58
  const baseC = 0.16 * derivation.semanticIntensity
  return { l: baseL, c: baseC, h: hue }
}

/* ------------------------------------------------------------------ */
/* Foreground-on-color helpers                                          */
/* ------------------------------------------------------------------ */

/**
 * Pick a readable foreground (near-white or near-black) for the given
 * background OKLCH. Uses the lightness channel as a proxy for relative
 * luminance — accurate enough for our token surfaces.
 */
function foregroundFor(bg: OKLCH): OKLCH {
  return bg.l > 0.6 ? { l: 0.13, c: 0, h: 0 } : { l: 0.97, c: 0, h: 0 }
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export function deriveTokens(
  inputs: ControllerInputs,
  derivation: DerivationProfile,
  mode: Mode
): ColorTokens {
  const primary = resolvePrimary(inputs, derivation, mode)
  const accent = resolveAccent(inputs, derivation, mode)
  const neutral = resolveNeutral(inputs, derivation, mode)
  const destructive = resolveSemantic(
    SEMANTIC_HUES.destructive,
    derivation,
    mode
  )
  const success = resolveSemantic(SEMANTIC_HUES.success, derivation, mode)
  const warning = resolveSemantic(SEMANTIC_HUES.warning, derivation, mode)
  const info = resolveSemantic(SEMANTIC_HUES.info, derivation, mode)

  const primaryFg = foregroundFor(primary)
  const accentFg = foregroundFor(accent)

  return {
    background: oklchToCss(neutral.bg),
    foreground: oklchToCss(neutral.fg),
    card: oklchToCss(neutral.card),
    cardForeground: oklchToCss(neutral.fg),
    popover: oklchToCss(neutral.card),
    popoverForeground: oklchToCss(neutral.fg),
    primary: oklchToCss(primary),
    primaryForeground: oklchToCss(primaryFg),
    secondary: oklchToCss(neutral.secondary),
    secondaryForeground: oklchToCss(neutral.fg),
    muted: oklchToCss(neutral.muted),
    mutedForeground: oklchToCss(neutral.mutedFg),
    accent: oklchToCss(neutral.surfaceAccent),
    accentForeground: oklchToCss(neutral.fg),
    destructive: oklchToCss(destructive),
    border: oklchToCss(neutral.border, mode === "dark" ? 0.6 : 1),
    input: oklchToCss(neutral.input, mode === "dark" ? 0.6 : 1),
    ring: oklchToCss({ ...primary, l: neutral.ring.l }),
    chart1: oklchToCss(primary),
    chart2: oklchToCss(accent),
    chart3: oklchToCss(info),
    chart4: oklchToCss(success),
    chart5: oklchToCss(warning),
    sidebar: oklchToCss(neutral.card),
    sidebarForeground: oklchToCss(neutral.fg),
    sidebarPrimary: oklchToCss(primary),
    sidebarPrimaryForeground: oklchToCss(primaryFg),
    sidebarAccent: oklchToCss(neutral.surfaceAccent),
    sidebarAccentForeground: oklchToCss(neutral.fg),
    sidebarBorder: oklchToCss(neutral.border, mode === "dark" ? 0.6 : 1),
    sidebarRing: oklchToCss({ ...primary, l: neutral.ring.l }),
    brandAccent: oklchToCss(accent),
    brandAccentForeground: oklchToCss(accentFg),
    success: oklchToCss(success),
    warning: oklchToCss(warning),
    info: oklchToCss(info),
  }
}

/**
 * Polish shadow tokens. Defaults baked from the polish system (see
 * ADR 0003). Themes can override these via per-theme shadow overrides.
 */
export function deriveShadows(mode: Mode): ShadowTokens {
  return mode === "dark" ? DEFAULT_SHADOWS_DARK : DEFAULT_SHADOWS_LIGHT
}
