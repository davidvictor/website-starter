// Stub next/font/google before any module that pulls in @/lib/fonts is
// resolved — the audit module chain (a11y → registry → fonts) would
// otherwise try to call Geist() etc. at import time. Each font factory
// returns the minimal shape the rest of the codebase consumes.
import { vi } from "vitest"

vi.mock("next/font/google", () => {
  const stub = () => ({
    className: "",
    style: { fontFamily: "stub" },
    variable: "--font-stub",
  })
  return {
    Geist: stub,
    Geist_Mono: stub,
    IBM_Plex_Mono: stub,
    IBM_Plex_Sans: stub,
    Instrument_Serif: stub,
    JetBrains_Mono: stub,
  }
})

import { describe, expect, it } from "vitest"
import { auditTheme, parseOklch } from "../a11y"
import type { ControllerTheme } from "../controller-types"
import { deriveTokens } from "../derive"
import registryJson from "../registry.json"

const baseThemes = registryJson.themes as unknown as readonly ControllerTheme[]

describe("auditTheme — built-in presets", () => {
  for (const theme of baseThemes) {
    for (const mode of ["light", "dark"] as const) {
      it(`${theme.id} · ${mode} clears the moderate baseline on every pair`, () => {
        const result = auditTheme(theme, mode)
        // Surface the offending pairs in the failure message so a regression
        // is immediately diagnosable from CI output.
        if (result.failures.length > 0) {
          const detail = result.pairs
            .filter((p) => p.fails)
            .map((p) => `${p.pair.id} = ${p.ratio.toFixed(2)}:1`)
            .join(", ")
          throw new Error(
            `${theme.id} · ${mode} has ${result.failures.length} failing pair(s): ${detail}`
          )
        }
        expect(result.failures).toEqual([])
      })
    }
  }

  it("worstRatio is a finite number for the default registry", () => {
    for (const theme of baseThemes) {
      for (const mode of ["light", "dark"] as const) {
        const result = auditTheme(theme, mode)
        expect(Number.isFinite(result.worstRatio)).toBe(true)
        expect(result.worstRatio).toBeGreaterThan(0)
      }
    }
  })
})

describe("deriveTokens — sanity for the audit fixtures", () => {
  // The audit reads tokens that resolveTokens (in registry.ts) produces.
  // We can't import registry.ts here (next/font), but we can sanity-check
  // that deriveTokens (which resolveTokens wraps) returns the keys auditTheme
  // expects — protecting against a future TOKEN_KEYS drift that would
  // silently make audit pairs grade undefined values.
  it("produces strings for every token referenced by the a11y catalog", () => {
    const sample = baseThemes[0]
    const tokens = deriveTokens(sample.inputs, sample.derivation, "light")
    expect(typeof tokens.foreground).toBe("string")
    expect(typeof tokens.background).toBe("string")
    expect(typeof tokens.primary).toBe("string")
    expect(typeof tokens.primaryForeground).toBe("string")
    expect(typeof tokens.accent).toBe("string")
    expect(typeof tokens.accentForeground).toBe("string")
    expect(typeof tokens.brandAccent).toBe("string")
    expect(typeof tokens.brandAccentForeground).toBe("string")
    expect(typeof tokens.input).toBe("string")
    expect(typeof tokens.ring).toBe("string")
    expect(typeof tokens.destructive).toBe("string")
    expect(typeof tokens.success).toBe("string")
    expect(typeof tokens.warning).toBe("string")
    expect(typeof tokens.info).toBe("string")
  })
})

describe("parseOklch", () => {
  it("round-trips an oklch() string with no alpha", () => {
    expect(parseOklch("oklch(0.5 0.1 290)")).toEqual({
      l: 0.5,
      c: 0.1,
      h: 290,
    })
  })

  it("round-trips an oklch() string with alpha (alpha is dropped)", () => {
    expect(parseOklch("oklch(0.5 0.1 290 / 0.6)")).toEqual({
      l: 0.5,
      c: 0.1,
      h: 290,
    })
  })

  it("tolerates extra whitespace inside the oklch() function call", () => {
    expect(parseOklch("oklch(  0.5   0.1   290  )")).toEqual({
      l: 0.5,
      c: 0.1,
      h: 290,
    })
  })

  it("hex fallback — `#ff0000` parses as a non-zero OKLCH near red's hue", () => {
    const r = parseOklch("#ff0000")
    expect(r.l).toBeGreaterThan(0)
    expect(r.c).toBeGreaterThan(0)
    // Red's hue in OKLCH lives near 29.
    expect(r.h).toBeGreaterThan(15)
    expect(r.h).toBeLessThan(45)
  })

  it("hex fallback — six-digit hex without `#` parses to a non-zero result", () => {
    const r = parseOklch("abc123")
    expect(r.l).toBeGreaterThan(0)
  })

  it("throws on an unrecognized color function", () => {
    expect(() => parseOklch("color(display-p3 1 0 0)")).toThrow(
      /unrecognized|expected/i
    )
  })

  it("throws on garbage input", () => {
    expect(() => parseOklch("not a color")).toThrow(/unrecognized|expected/i)
  })

  it("throws on an empty string", () => {
    expect(() => parseOklch("")).toThrow(/unrecognized|expected/i)
  })
})
