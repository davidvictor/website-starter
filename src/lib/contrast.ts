/**
 * WCAG 2.x contrast math. Pure: takes colors, returns ratios + grades.
 *
 * Uses sRGB relative luminance per WCAG 2.1 §1.4.3. We accept OKLCH
 * directly so we don't have to re-do the gamut conversion at call
 * sites — `src/lib/color.ts` already provides `oklchToRgb`.
 */

import { type OKLCH, oklchToRgb } from "@/lib/color"

export type RGB = { r: number; g: number; b: number }

/** WCAG 2.x relative luminance for an sRGB color in [0,1]^3. */
export function relativeLuminance({ r, g, b }: RGB): number {
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG 2.x contrast ratio between two sRGB colors. Range [1, 21]. */
export function wcagRatio(a: RGB, b: RGB): number {
  const La = relativeLuminance(a)
  const Lb = relativeLuminance(b)
  const hi = Math.max(La, Lb)
  const lo = Math.min(La, Lb)
  return (hi + 0.05) / (lo + 0.05)
}

/** Convenience: contrast directly from two OKLCH inputs. */
export function wcagRatioOklch(a: OKLCH, b: OKLCH): number {
  return wcagRatio(oklchToRgb(a), oklchToRgb(b))
}

/* ------------------------------------------------------------------ */
/* Grading                                                              */
/* ------------------------------------------------------------------ */

export type Category = "text" | "ui" | "decorative"

export type Grade = "AAA" | "AA" | "AA-Large" | "Fail" | "Exempt"

/** Floor that the "moderate baseline" must clear for a category. */
export const MODERATE_BASELINE: Record<Category, number> = {
  text: 4.5,
  ui: 3.0,
  decorative: 0,
}

/** Grade a ratio against a category. */
export function gradeRatio(ratio: number, category: Category): Grade {
  if (category === "decorative") return "Exempt"
  if (category === "ui") return ratio >= 3.0 ? "AA" : "Fail"
  // text
  if (ratio >= 7.0) return "AAA"
  if (ratio >= 4.5) return "AA"
  if (ratio >= 3.0) return "AA-Large"
  return "Fail"
}

/** True when a graded pair is below its moderate-baseline floor. */
export function isBelowModerateBaseline(
  ratio: number,
  category: Category
): boolean {
  return ratio < MODERATE_BASELINE[category]
}
