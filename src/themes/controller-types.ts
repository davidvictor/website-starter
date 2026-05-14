import type { AccentAnchor } from "@/lib/color"
import type { FontKey } from "@/lib/fonts"

import type { ColorTokens } from "./types"

/**
 * High-level color controls. Three brand inputs + warmth.
 * Each color is expressed as (hue, vibrancy) where vibrancy maps to
 * (lightness, chroma) via the curve in src/lib/color.ts.
 */
export type ColorInput = {
  hue: number
  vibrancy: number
}

export type AccentInput = ColorInput & {
  /** "free" = hue is independent. Any anchor locks hue to (primary.hue + offset). */
  anchor: AccentAnchor
}

export type ControllerInputs = {
  primary: ColorInput
  accent: AccentInput
  /** [-1, +1] — cool → neutral → warm. Auto-bleeds toward primary hue at extremes. */
  warmth: number
}

/**
 * How aggressively the engine derives surfaces and semantics from the
 * three inputs. Presets ship distinct profiles so the same color triple
 * feels meaningfully different ("editorial mute" vs "bold vivid").
 */
export type DerivationProfile = {
  /** Multiplier on derived chroma. <1 mutes, >1 boosts. Typical range 0.6–1.4. */
  chromaBoost: number
  /** Lightness gap between bg and surfaces. */
  contrast: "low" | "medium" | "high"
  /** Multiplier on semantic chroma. 0.6 polite → 1.3 alarming. */
  semanticIntensity: number
  /** Distribution profile — see derive-accent-usage notes. */
  accentUsage: "rare" | "primary-only" | "broad" | "maximal"
  /** Root radius in rem ("0.125rem", "0.5rem", etc.). */
  radius: string
  /** Per-role font keys. */
  fonts: { sans: FontKey; mono: FontKey; heading: FontKey }
}

export type PresetId = "editorial" | "saas" | "bold" | "cyber" | "custom"

/**
 * A controller-driven theme. The source of truth is the inputs +
 * derivation profile + (optional) per-token overrides. We derive the
 * full ColorTokens at runtime via `deriveTokens()`.
 */
export type ControllerTheme = {
  id: string
  name: string
  description?: string
  presetId: PresetId
  inputs: ControllerInputs
  derivation: DerivationProfile
  /** Optional per-token overrides applied on top of derived values. */
  overrides?: {
    light?: Partial<ColorTokens>
    dark?: Partial<ColorTokens>
  }
}

export type ControllerRegistry = {
  defaultThemeId: string
  themes: ControllerTheme[]
}
