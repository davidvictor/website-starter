import { describe, expect, it } from "vitest"

import type {
  ControllerInputs,
  ControllerTheme,
  DerivationProfile,
} from "../controller-types"
import { deriveTokens } from "../derive"
// Read registry.json directly to avoid pulling in next/font/google through
// registry.ts → @/lib/fonts at test-import time.
import registryJson from "../registry.json"

const baseThemes = registryJson.themes as unknown as readonly ControllerTheme[]

const PROFILE_BASE: DerivationProfile = {
  chromaBoost: 1.0,
  contrast: "medium",
  semanticIntensity: 1.0,
  accentUsage: "primary-only",
  radius: "0.5rem",
  fonts: {
    sans: "geist-sans",
    mono: "geist-mono",
    heading: "geist-sans",
  },
  routeTransition: "none",
}

const INPUTS_BASE: ControllerInputs = {
  primary: { hue: 250, vibrancy: 62 },
  accent: { hue: 310, vibrancy: 72, anchor: "free" },
  warmth: 0,
}

describe("deriveTokens", () => {
  it("is deterministic — same inputs produce identical output", () => {
    const a = deriveTokens(INPUTS_BASE, PROFILE_BASE, "light")
    const b = deriveTokens(INPUTS_BASE, PROFILE_BASE, "light")
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it("each built-in preset produces a distinct primary token", () => {
    const primaries = baseThemes.map((theme) => {
      const tokens = deriveTokens(theme.inputs, theme.derivation, "light")
      // The primary is a CSS string like "oklch(L C H)" — compare verbatim.
      return tokens.primary
    })
    const unique = new Set(primaries)
    expect(unique.size).toBe(primaries.length)
  })

  it("light and dark mode produce different background tokens", () => {
    const light = deriveTokens(INPUTS_BASE, PROFILE_BASE, "light")
    const dark = deriveTokens(INPUTS_BASE, PROFILE_BASE, "dark")
    expect(light.background).not.toBe(dark.background)
    expect(light.foreground).not.toBe(dark.foreground)
  })

  it("warmth swing changes the neutral background", () => {
    const warm = deriveTokens(
      { ...INPUTS_BASE, warmth: 0.8 },
      PROFILE_BASE,
      "light"
    )
    const cool = deriveTokens(
      { ...INPUTS_BASE, warmth: -0.8 },
      PROFILE_BASE,
      "light"
    )
    expect(warm.background).not.toBe(cool.background)
    expect(warm.muted).not.toBe(cool.muted)
  })

  it("chromaBoost > 1 increases derived chroma vs <1", () => {
    const boosted = deriveTokens(
      INPUTS_BASE,
      { ...PROFILE_BASE, chromaBoost: 1.4 },
      "light"
    )
    const muted = deriveTokens(
      INPUTS_BASE,
      { ...PROFILE_BASE, chromaBoost: 0.6 },
      "light"
    )
    // Both are oklch(...) strings; the boosted should have a larger C value.
    const boostedC = parseFloat(
      boosted.primary.match(/oklch\(\S+ (\S+) /)?.[1] ?? "0"
    )
    const mutedC = parseFloat(
      muted.primary.match(/oklch\(\S+ (\S+) /)?.[1] ?? "0"
    )
    expect(boostedC).toBeGreaterThan(mutedC)
  })

  it("produces all four built-in presets without throwing", () => {
    for (const theme of baseThemes) {
      expect(() =>
        deriveTokens(theme.inputs, theme.derivation, "light")
      ).not.toThrow()
      expect(() =>
        deriveTokens(theme.inputs, theme.derivation, "dark")
      ).not.toThrow()
    }
    // Sanity: the four built-ins are present.
    const ids = baseThemes.map((t) => t.id)
    expect(ids).toEqual(
      expect.arrayContaining(["editorial", "saas", "bold", "cyber"])
    )
  })
})
