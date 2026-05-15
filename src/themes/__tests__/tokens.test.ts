// Stub next/font/google before any module that pulls in @/lib/fonts is
// resolved. `tokens.ts` itself only imports `controller-types` as types
// (erased at compile), but we mock defensively so future value imports
// don't silently break this test file.
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

import type { OKLCH } from "@/lib/color"
import { wcagRatioOklch } from "@/lib/contrast"
import { foregroundFor } from "../tokens"

const NEAR_BLACK: OKLCH = { l: 0.13, c: 0, h: 0 }
const NEAR_WHITE: OKLCH = { l: 0.97, c: 0, h: 0 }

describe("foregroundFor", () => {
  it("picks near-black for a light surface", () => {
    const bg: OKLCH = { l: 0.9, c: 0, h: 0 }
    expect(foregroundFor(bg)).toEqual(NEAR_BLACK)
  })

  it("picks near-white for a dark surface", () => {
    const bg: OKLCH = { l: 0.1, c: 0, h: 0 }
    expect(foregroundFor(bg)).toEqual(NEAR_WHITE)
  })

  it("returns whichever option produces higher measured contrast for a vivid mid-L hue", () => {
    // Vivid purple at L≈0.6 — chroma can pull the perceived darkness
    // across the legacy L=0.6 cutoff. The measured pick must beat the
    // alternative.
    const bg: OKLCH = { l: 0.6, c: 0.25, h: 290 }
    const picked = foregroundFor(bg)
    // Identify the picked anchor by structural equality so we can test the
    // alternative. The picked option must produce contrast >= the other.
    const pickedIsBlack =
      picked.l === NEAR_BLACK.l &&
      picked.c === NEAR_BLACK.c &&
      picked.h === NEAR_BLACK.h
    const other = pickedIsBlack ? NEAR_WHITE : NEAR_BLACK
    expect(wcagRatioOklch(picked, bg)).toBeGreaterThanOrEqual(
      wcagRatioOklch(other, bg)
    )
  })

  it("returns one of the two near-anchors (never something else)", () => {
    const bg: OKLCH = { l: 0.5, c: 0.18, h: 250 }
    const result = foregroundFor(bg)
    // Match by value, not reference — the implementation owns its own
    // anchor constants.
    const isBlack =
      result.l === NEAR_BLACK.l &&
      result.c === NEAR_BLACK.c &&
      result.h === NEAR_BLACK.h
    const isWhite =
      result.l === NEAR_WHITE.l &&
      result.c === NEAR_WHITE.c &&
      result.h === NEAR_WHITE.h
    expect(isBlack || isWhite).toBe(true)
  })
})
