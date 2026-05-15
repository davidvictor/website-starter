import { describe, expect, it } from "vitest"

import type { OKLCH } from "../color"
import {
  gradeRatio,
  isBelowModerateBaseline,
  MODERATE_BASELINE,
  type RGB,
  relativeLuminance,
  wcagRatio,
  wcagRatioOklch,
} from "../contrast"

const WHITE: RGB = { r: 1, g: 1, b: 1 }
const BLACK: RGB = { r: 0, g: 0, b: 0 }
const MID_GRAY: RGB = { r: 0.5, g: 0.5, b: 0.5 }

const WHITE_OKLCH: OKLCH = { l: 1, c: 0, h: 0 }
const BLACK_OKLCH: OKLCH = { l: 0, c: 0, h: 0 }

describe("relativeLuminance", () => {
  it("returns ~1 for white", () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 5)
  })

  it("returns 0 for black", () => {
    expect(relativeLuminance(BLACK)).toBe(0)
  })

  it("returns a value strictly between 0 and 1 for mid gray", () => {
    const l = relativeLuminance(MID_GRAY)
    expect(l).toBeGreaterThan(0)
    expect(l).toBeLessThan(1)
  })
})

describe("wcagRatio — reference values", () => {
  it("identical white returns 1", () => {
    expect(wcagRatio(WHITE, WHITE)).toBe(1)
  })

  it("identical black returns 1", () => {
    expect(wcagRatio(BLACK, BLACK)).toBe(1)
  })

  it("black on white returns ~21", () => {
    expect(wcagRatio(BLACK, WHITE)).toBeCloseTo(21, 1)
  })

  it("is symmetric — order of arguments does not matter", () => {
    expect(wcagRatio(WHITE, BLACK)).toBe(wcagRatio(BLACK, WHITE))
  })

  it("mid gray vs white returns a ratio in (1, 21)", () => {
    const r = wcagRatio(MID_GRAY, WHITE)
    expect(r).toBeGreaterThan(1)
    expect(r).toBeLessThan(21)
  })
})

describe("wcagRatioOklch — reference values", () => {
  it("identical OKLCH returns a ratio of 1", () => {
    expect(wcagRatioOklch(WHITE_OKLCH, WHITE_OKLCH)).toBe(1)
  })

  it("white-OKLCH vs black-OKLCH returns ~21", () => {
    expect(wcagRatioOklch(WHITE_OKLCH, BLACK_OKLCH)).toBeCloseTo(21, 1)
  })
})

describe("gradeRatio — branch coverage", () => {
  it("decorative always returns Exempt regardless of ratio", () => {
    expect(gradeRatio(0, "decorative")).toBe("Exempt")
    expect(gradeRatio(1, "decorative")).toBe("Exempt")
    expect(gradeRatio(21, "decorative")).toBe("Exempt")
  })

  it("ui returns AA at exactly 3.0", () => {
    expect(gradeRatio(3.0, "ui")).toBe("AA")
  })

  it("ui returns Fail just below 3.0", () => {
    expect(gradeRatio(2.99, "ui")).toBe("Fail")
  })

  it("text returns AAA at exactly 7.0", () => {
    expect(gradeRatio(7.0, "text")).toBe("AAA")
  })

  it("text returns AA at exactly 4.5", () => {
    expect(gradeRatio(4.5, "text")).toBe("AA")
  })

  it("text returns AA-Large at exactly 3.0", () => {
    expect(gradeRatio(3.0, "text")).toBe("AA-Large")
  })

  it("text returns Fail just below 3.0", () => {
    expect(gradeRatio(2.99, "text")).toBe("Fail")
  })
})

describe("isBelowModerateBaseline", () => {
  it("decorative always returns false", () => {
    expect(isBelowModerateBaseline(0, "decorative")).toBe(false)
    expect(isBelowModerateBaseline(0.5, "decorative")).toBe(false)
    expect(isBelowModerateBaseline(21, "decorative")).toBe(false)
  })

  it("ui below 3.0 returns true", () => {
    expect(isBelowModerateBaseline(2.99, "ui")).toBe(true)
  })

  it("ui at or above 3.0 returns false", () => {
    expect(isBelowModerateBaseline(3.0, "ui")).toBe(false)
    expect(isBelowModerateBaseline(5, "ui")).toBe(false)
  })

  it("text below 4.5 returns true", () => {
    expect(isBelowModerateBaseline(4.49, "text")).toBe(true)
  })

  it("text at or above 4.5 returns false", () => {
    expect(isBelowModerateBaseline(4.5, "text")).toBe(false)
    expect(isBelowModerateBaseline(10, "text")).toBe(false)
  })
})

describe("MODERATE_BASELINE", () => {
  it("has the expected category floors", () => {
    expect(MODERATE_BASELINE.text).toBe(4.5)
    expect(MODERATE_BASELINE.ui).toBe(3.0)
    expect(MODERATE_BASELINE.decorative).toBe(0)
  })
})
