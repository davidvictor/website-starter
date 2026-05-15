import type { AccentAnchor } from "@/lib/color"
import type { FontKey } from "@/lib/fonts"

import type { ColorTokens, ShadowTokens } from "./types"

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
 *
 * `contrast`, `accentUsage`, and `routeTransition` are id strings drawn
 * from registries in `derivation-axes.ts` — adding a level is one entry
 * there, not a type edit here.
 */
export type DerivationProfile = {
  /** Multiplier on derived chroma. <1 mutes, >1 boosts. Typical range 0.6–1.4. */
  chromaBoost: number
  /** Contrast level id — see `CONTRAST_LEVELS` in derivation-axes.ts. */
  contrast: string
  /** Multiplier on semantic chroma. 0.6 polite → 1.3 alarming. */
  semanticIntensity: number
  /** Accent-usage id — see `ACCENT_USAGE_LEVELS` in derivation-axes.ts. */
  accentUsage: string
  /** Root radius in rem ("0.125rem", "0.5rem", etc.). */
  radius: string
  /** Per-role font keys. */
  fonts: { sans: FontKey; mono: FontKey; heading: FontKey }
  /**
   * Route transition mode id — see `ROUTE_TRANSITION_MODES`. Reference
   * the marketing layout's `<RouteTransition>` consumer. ADR 0012.
   */
  routeTransition?: string
}

/**
 * Identifier for a built-in preset, or `"custom"` to mark a controller
 * theme whose inputs have drifted away from any built-in preset.
 * Picking a preset re-stamps the inputs + derivation back to a known
 * shape. The set of preset ids is whatever the registry exposes —
 * nothing here constrains it at compile time.
 */
export type PresetId = string

/**
 * Per-theme overrides to the polish surface treatments. Shadows ship as
 * mode-derived defaults (see `DEFAULT_SHADOWS_LIGHT/DARK`) — any keys a
 * theme sets here are layered on top per mode.
 */
export type SurfaceOverrides = {
  shadows?: {
    light?: Partial<ShadowTokens>
    dark?: Partial<ShadowTokens>
  }
}

/**
 * A controller-driven theme. The source of truth is the inputs +
 * derivation profile + (optional) per-token / per-surface overrides.
 * We derive the full ColorTokens at runtime via `deriveTokens()`.
 */
export type ControllerTheme = {
  id: string
  name: string
  description?: string
  presetId: PresetId
  inputs: ControllerInputs
  derivation: DerivationProfile
  /** Optional per-token color overrides applied on top of derived values. */
  overrides?: {
    light?: Partial<ColorTokens>
    dark?: Partial<ColorTokens>
  }
  /** Per-theme surface treatments (shadows, etc.). */
  surface?: SurfaceOverrides
}

export type ControllerRegistry = {
  defaultThemeId: string
  themes: ControllerTheme[]
}
