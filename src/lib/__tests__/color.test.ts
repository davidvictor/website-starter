import { describe, expect, it } from "vitest"

import {
  ACCENT_ANCHORS,
  applyAccentAnchor,
  darkenForMode,
  hexToOklch,
  lcToVibrancy,
  type OKLCH,
  oklchToCss,
  oklchToHex,
  tuneBrandForMode,
  vibrancyToLC,
  warmthToNeutral,
} from "../color"
import { wcagRatioOklch } from "../contrast"

describe("hexToOklch / oklchToHex round-trip", () => {
  it("round-trips common brand-ish hexes within 1 unit per channel", () => {
    const hexes = [
      "#ff5e3a",
      "#5b9bd5",
      "#21c389",
      "#7f6efb",
      "#0d0d0d",
      "#fafafa",
    ]
    for (const hex of hexes) {
      const oklch = hexToOklch(hex)
      const back = oklchToHex(oklch)
      // Compare per-byte difference; within 1 unit (rounding noise + clamp).
      const aBytes = [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ]
      const bBytes = [
        parseInt(back.slice(1, 3), 16),
        parseInt(back.slice(3, 5), 16),
        parseInt(back.slice(5, 7), 16),
      ]
      for (let i = 0; i < 3; i++) {
        expect(Math.abs(aBytes[i] - bBytes[i])).toBeLessThanOrEqual(1)
      }
    }
  })

  it("normalizes 3-char shorthand hex", () => {
    expect(hexToOklch("#fff")).toEqual(hexToOklch("#ffffff"))
    expect(hexToOklch("#000")).toEqual(hexToOklch("#000000"))
  })

  it("returns zero-OKLCH for invalid input", () => {
    expect(hexToOklch("not-a-hex")).toEqual({ l: 0, c: 0, h: 0 })
    expect(hexToOklch("#zz0011")).toEqual({ l: 0, c: 0, h: 0 })
  })
})

describe("vibrancyToLC / lcToVibrancy", () => {
  it("round-trips approximately across the range", () => {
    for (const v of [0, 12, 50, 78, 100]) {
      const { l, c } = vibrancyToLC(v)
      const back = lcToVibrancy(l, c)
      expect(Math.abs(back - v)).toBeLessThanOrEqual(1)
    }
  })

  it("higher vibrancy produces higher chroma", () => {
    const low = vibrancyToLC(20)
    const high = vibrancyToLC(90)
    expect(high.c).toBeGreaterThan(low.c)
    expect(high.l).toBeGreaterThan(low.l)
  })

  it("clamps out-of-range input", () => {
    expect(vibrancyToLC(-10)).toEqual(vibrancyToLC(0))
    expect(vibrancyToLC(200)).toEqual(vibrancyToLC(100))
  })
})

describe("warmthToNeutral", () => {
  it("warmth=0 produces near-zero chroma", () => {
    expect(warmthToNeutral(0).chroma).toBe(0)
  })

  it("positive warmth picks a warm hue (around 70°)", () => {
    const { hue } = warmthToNeutral(0.5)
    // Without a primary hint, the hue is exactly 70 at all positive warmths.
    expect(hue).toBe(70)
  })

  it("negative warmth picks a cool hue (around 230°)", () => {
    const { hue } = warmthToNeutral(-0.5)
    expect(hue).toBe(230)
  })

  it("warmth magnitude scales chroma", () => {
    expect(warmthToNeutral(1).chroma).toBeGreaterThan(
      warmthToNeutral(0.3).chroma
    )
  })

  it("biases hue toward primary at extremes", () => {
    const neutral = warmthToNeutral(0, 250)
    const biased = warmthToNeutral(1, 250)
    // Bias kicks in at extremes; should pull hue away from 70°.
    expect(biased.hue).not.toBe(70)
    // Mid neutral stays at base since chroma is zero anyway.
    expect(neutral.chroma).toBe(0)
  })
})

describe("applyAccentAnchor", () => {
  it("'free' leaves accent hue unchanged", () => {
    expect(applyAccentAnchor(250, 310, "free")).toBe(310)
  })

  it("'complementary' = primary + 180°", () => {
    expect(applyAccentAnchor(40, 0, "complementary")).toBe((40 + 180) % 360)
  })

  it("'analogous' = primary + 30°", () => {
    expect(applyAccentAnchor(100, 0, "analogous")).toBe(130)
  })

  it("'triadic' = primary + 120°", () => {
    expect(applyAccentAnchor(0, 0, "triadic")).toBe(120)
  })

  it("'split' = primary - 60° (mod 360)", () => {
    expect(applyAccentAnchor(30, 0, "split")).toBe((30 - 60 + 360) % 360)
  })

  it("wraps hues around 360°", () => {
    expect(applyAccentAnchor(200, 0, "complementary")).toBe((200 + 180) % 360)
  })
})

describe("ACCENT_ANCHORS shape", () => {
  it("exposes the expected keys", () => {
    expect(Object.keys(ACCENT_ANCHORS).sort()).toEqual(
      ["analogous", "complementary", "free", "split", "triadic"].sort()
    )
  })
})

describe("darkenForMode", () => {
  it("brand kind bumps lightness slightly", () => {
    const out = darkenForMode(0.5, { kind: "brand" })
    expect(out).toBeGreaterThanOrEqual(0.55)
    expect(out).toBeLessThanOrEqual(0.85)
  })

  it("surface kind inverts lightness", () => {
    expect(darkenForMode(0.2, { kind: "surface" })).toBeCloseTo(0.8, 5)
    expect(darkenForMode(0.9, { kind: "surface" })).toBeCloseTo(0.1, 5)
  })

  it("border kind clamps inverted lightness into low range", () => {
    const out = darkenForMode(0.95, { kind: "border" })
    expect(out).toBeGreaterThanOrEqual(0.18)
    expect(out).toBeLessThanOrEqual(0.32)
  })

  it("defaults to brand semantics", () => {
    expect(darkenForMode(0.4)).toBe(darkenForMode(0.4, { kind: "brand" }))
  })
})

describe("oklchToCss formatting", () => {
  it("emits oklch(L C H) with bounded precision", () => {
    const out = oklchToCss({ l: 0.5, c: 0.123456789, h: 240.7891 })
    // Loose check — exact decimal count depends on toFixed behaviour.
    expect(out).toMatch(/^oklch\(0\.5 0\.\d+ \d+\.\d{2}\)$/)
  })

  it("appends alpha when < 1", () => {
    const out = oklchToCss({ l: 0.5, c: 0.1, h: 200 }, 0.5)
    expect(out).toMatch(/\/ 0\.5\)$/)
  })

  it("does not append alpha when undefined or 1", () => {
    expect(oklchToCss({ l: 0.5, c: 0.1, h: 200 })).not.toContain("/")
    expect(oklchToCss({ l: 0.5, c: 0.1, h: 200 }, 1)).not.toContain("/")
  })
})

describe("tuneBrandForMode", () => {
  // Near-black / near-white anchors that the implementation uses internally
  // for the "best-fg" constraint.
  const NEAR_BLACK_FG: OKLCH = { l: 0.13, c: 0, h: 0 }
  const NEAR_WHITE_FG: OKLCH = { l: 0.97, c: 0, h: 0 }

  const bestFgContrast = (brand: OKLCH) =>
    Math.max(
      wcagRatioOklch(NEAR_WHITE_FG, brand),
      wcagRatioOklch(NEAR_BLACK_FG, brand)
    )

  it("returns a valid OKLCH triple with finite values for any input", () => {
    // Even on the (theoretical) exhaustion path the function should
    // return a finite OKLCH — it falls back to the last attempted L.
    const raw: OKLCH = { l: 0.5, c: 0.3, h: 290 }
    const bg: OKLCH = { l: 0.13, c: 0, h: 0 }
    const tuned = tuneBrandForMode(raw, "dark", bg)
    expect(Number.isFinite(tuned.l)).toBe(true)
    expect(Number.isFinite(tuned.c)).toBe(true)
    expect(Number.isFinite(tuned.h)).toBe(true)
    // L always stays in [0, 1] due to the internal clamp.
    expect(tuned.l).toBeGreaterThanOrEqual(0)
    expect(tuned.l).toBeLessThanOrEqual(1)
  })

  it("pulls a too-light brand DOWN in light mode to clear both constraints", () => {
    // Raw cyan at L=0.65 fails 4.5:1 vs white (~2.7:1).
    const raw: OKLCH = { l: 0.65, c: 0.18, h: 190 }
    const bg: OKLCH = { l: 1.0, c: 0, h: 0 }
    const tuned = tuneBrandForMode(raw, "light", bg)
    // Should be pulled darker than the starting point.
    expect(tuned.l).toBeLessThan(0.55)
    // Both constraints clear the 4.5 floor.
    expect(wcagRatioOklch(tuned, bg)).toBeGreaterThanOrEqual(4.5)
    expect(bestFgContrast(tuned)).toBeGreaterThanOrEqual(4.5)
  })

  it("pushes a too-dark brand UP in dark mode to clear both constraints", () => {
    // Raw purple at L=0.3 against a near-black dark bg fails.
    const raw: OKLCH = { l: 0.3, c: 0.2, h: 290 }
    const bg: OKLCH = { l: 0.13, c: 0, h: 0 }
    const tuned = tuneBrandForMode(raw, "dark", bg)
    // The mode-baseline lift alone bumps L to >=0.55; tuning may push higher.
    expect(tuned.l).toBeGreaterThanOrEqual(0.55)
    // Both constraints clear the 4.5 floor.
    expect(wcagRatioOklch(tuned, bg)).toBeGreaterThanOrEqual(4.5)
    expect(bestFgContrast(tuned)).toBeGreaterThanOrEqual(4.5)
  })

  it("preserves chroma and hue (only lightness is tuned)", () => {
    const raw: OKLCH = { l: 0.5, c: 0.18, h: 250 }
    const bg: OKLCH = { l: 0.13, c: 0, h: 0 }
    const tuned = tuneBrandForMode(raw, "dark", bg)
    expect(tuned.c).toBe(raw.c)
    expect(tuned.h).toBe(raw.h)
  })

  it("is deterministic — same inputs produce the same output", () => {
    const raw: OKLCH = { l: 0.5, c: 0.18, h: 250 }
    const bg: OKLCH = { l: 0.13, c: 0, h: 0 }
    const a = tuneBrandForMode(raw, "dark", bg)
    const b = tuneBrandForMode(raw, "dark", bg)
    expect(a).toEqual(b)
  })

  it("honors a custom floor", () => {
    // A very low floor (1.5) should accept the brand at (or near) its
    // baseline lifted L without further tuning.
    const raw: OKLCH = { l: 0.5, c: 0.05, h: 250 }
    const bg: OKLCH = { l: 0.13, c: 0, h: 0 }
    const lowFloor = tuneBrandForMode(raw, "dark", bg, 1.5)
    // The mode-baseline lift puts the L at clamp(raw.l + 0.08, 0.55, 0.85).
    const l0 = Math.max(0.55, Math.min(0.85, raw.l + 0.08))
    expect(lowFloor.l).toBe(l0)
  })
})
