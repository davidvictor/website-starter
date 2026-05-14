/**
 * OKLCH ↔ sRGB math + helpers for the controller-driven color system.
 *
 * Algorithms from Björn Ottosson's reference implementation:
 *   https://bottosson.github.io/posts/oklab/
 *
 * Notes:
 * - All math in linear sRGB, then gamma-corrected at the boundary.
 * - We clamp out-of-gamut colors by snapping channels to [0, 1] rather
 *   than doing a full chroma reduction. Good enough for theme tokens;
 *   the perceptual cost is small at the chroma ranges we care about.
 */

export type OKLCH = { l: number; c: number; h: number }

const TAU = Math.PI * 2

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(c: number) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
}

/* ------------------------------------------------------------------ */
/* OKLab/OKLCH ↔ sRGB                                                  */
/* ------------------------------------------------------------------ */

function linearSrgbToOklab(r: number, g: number, b: number) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  }
}

function oklabToLinearSrgb(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  }
}

export function oklchToRgb({ l, c, h }: OKLCH) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lin = oklabToLinearSrgb(l, a, b)
  return {
    r: clamp01(linearToSrgb(lin.r)),
    g: clamp01(linearToSrgb(lin.g)),
    b: clamp01(linearToSrgb(lin.b)),
  }
}

export function rgbToOklch(r: number, g: number, b: number): OKLCH {
  const lin = {
    r: srgbToLinear(r),
    g: srgbToLinear(g),
    b: srgbToLinear(b),
  }
  const lab = linearSrgbToOklab(lin.r, lin.g, lin.b)
  const c = Math.hypot(lab.a, lab.b)
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: lab.L, c, h }
}

/* ------------------------------------------------------------------ */
/* Hex ↔ OKLCH                                                         */
/* ------------------------------------------------------------------ */

export function hexToOklch(hex: string): OKLCH {
  let h = hex.trim().replace(/^#/, "")
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  if (h.length !== 6 || !/^[0-9a-f]{6}$/i.test(h)) {
    return { l: 0, c: 0, h: 0 }
  }
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return rgbToOklch(r, g, b)
}

export function oklchToHex(oklch: OKLCH): string {
  const { r, g, b } = oklchToRgb(oklch)
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function oklchToCss({ l, c, h }: OKLCH, alpha?: number): string {
  const L = +l.toFixed(4)
  const C = +c.toFixed(4)
  const H = ((h % 360) + 360) % 360
  if (alpha != null && alpha < 1) {
    return `oklch(${L} ${C} ${H.toFixed(2)} / ${alpha})`
  }
  return `oklch(${L} ${C} ${H.toFixed(2)})`
}

/* ------------------------------------------------------------------ */
/* Vibrancy curve                                                       */
/* ------------------------------------------------------------------ */

/**
 * Map a 0–100 vibrancy scalar to (L, C). Tuned so that:
 *   v=0   → near-gray, low L (deep muted)
 *   v=50  → medium chroma, medium L
 *   v=100 → vivid brand chroma, slightly higher L
 *
 * The curve is intentionally smooth and slightly concave on C so the
 * upper half of the slider reads as "more vivid" rather than "lighter".
 */
export function vibrancyToLC(vibrancy: number): { l: number; c: number } {
  const t = Math.max(0, Math.min(100, vibrancy)) / 100
  const l = 0.42 + t * 0.23
  const c = 0.015 + Math.pow(t, 0.85) * 0.21
  return { l, c }
}

export function lcToVibrancy(l: number, c: number): number {
  const t = Math.max(0, Math.min(1, (c - 0.015) / 0.21))
  return Math.round(Math.pow(t, 1 / 0.85) * 100)
}

/* ------------------------------------------------------------------ */
/* Hue/warmth helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Map a warmth scalar in [-1, +1] to a neutral hue + chroma.
 * - At 0: pure gray (c≈0)
 * - At +1: warm amber tint (h≈70, c≈0.018)
 * - At -1: cool blue tint (h≈230, c≈0.018)
 * Optionally biases the hue toward `primaryHue` at the extremes so the
 * neutral feels cohesive with the rest of the palette.
 */
export function warmthToNeutral(
  warmth: number,
  primaryHue?: number
): { hue: number; chroma: number } {
  const w = Math.max(-1, Math.min(1, warmth))
  const baseHue = w >= 0 ? 70 : 230
  const chroma = Math.abs(w) * 0.018
  let hue = baseHue
  if (primaryHue != null) {
    // Bleed up to 25% toward primary hue at the extremes.
    const bias = Math.min(0.25, Math.abs(w) * 0.25)
    hue = baseHue * (1 - bias) + primaryHue * bias
  }
  return { hue: ((hue % 360) + 360) % 360, chroma }
}

/* ------------------------------------------------------------------ */
/* Accent anchor offsets                                                */
/* ------------------------------------------------------------------ */

export const ACCENT_ANCHORS = {
  free: null as number | null,
  analogous: 30,
  triadic: 120,
  complementary: 180,
  split: -60,
} as const

export type AccentAnchor = keyof typeof ACCENT_ANCHORS

export function applyAccentAnchor(
  primaryHue: number,
  accentHue: number,
  anchor: AccentAnchor
): number {
  const offset = ACCENT_ANCHORS[anchor]
  if (offset == null) return accentHue
  return ((primaryHue + offset) % 360 + 360) % 360
}

/* ------------------------------------------------------------------ */
/* Mode lightness transform                                             */
/* ------------------------------------------------------------------ */

/**
 * Mirror a light-mode lightness for use in dark mode. Not a pure
 * inversion — we keep brand colors more legible by clamping the dark
 * variant a bit lighter than a naive 1-L would suggest.
 */
export function darkenForMode(
  l: number,
  options: { kind: "brand" | "surface" | "border" } = { kind: "brand" }
) {
  if (options.kind === "brand") {
    // Brand colors stay vivid; bump lightness slightly to read on dark bg.
    return Math.max(0.55, Math.min(0.85, l + 0.08))
  }
  if (options.kind === "surface") {
    // Surfaces invert.
    return 1 - l
  }
  // border-like — invert and reduce contrast.
  return Math.max(0.18, Math.min(0.32, 1 - l))
}
