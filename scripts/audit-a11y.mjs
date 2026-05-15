#!/usr/bin/env node
/**
 * Standalone WCAG audit for built-in presets. No test framework
 * required — runs in CI as `node scripts/audit-a11y.mjs`. Exit
 * code is non-zero when any preset has a pair below the moderate
 * baseline.
 *
 * Mirrors the runtime derivation in src/themes/tokens.ts. When the
 * Vitest infra lands (see starter-kit hardening spec Phase 2), the
 * meat of this script lifts directly into src/themes/__tests__/.
 */

// Inline color + derivation math — this is a deliberate copy of the
// runtime logic so the script has zero runtime imports and runs from
// a bare `node`. Update in lockstep with src/lib/color.ts and
// src/themes/tokens.ts. The runtime module unit tests (when added)
// will be the source of truth; this script is the floor.

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const registry = JSON.parse(
  readFileSync(join(__dirname, "../src/themes/registry.json"), "utf8")
)

// --- color math (mirrors src/lib/color.ts) ---
const clamp01 = (n) => Math.max(0, Math.min(1, n))
const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const linearToSrgb = (c) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
function oklabToLinearSrgb(L, a, b) {
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
function oklchToRgb({ l, c, h }) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lin = oklabToLinearSrgb(l, a, b)
  return {
    r: clamp01(linearToSrgb(lin.r)),
    g: clamp01(linearToSrgb(lin.g)),
    b: clamp01(linearToSrgb(lin.b)),
  }
}
function relLum({ r, g, b }) {
  const lin = (c) => srgbToLinear(c)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function ratio(a, b) {
  const L1 = relLum(oklchToRgb(a))
  const L2 = relLum(oklchToRgb(b))
  const hi = Math.max(L1, L2)
  const lo = Math.min(L1, L2)
  return (hi + 0.05) / (lo + 0.05)
}

// --- derivation helpers (mirrors src/lib/color.ts + src/themes/tokens.ts) ---
function vibrancyToLC(v) {
  const t = Math.max(0, Math.min(100, v)) / 100
  return { l: 0.42 + t * 0.23, c: 0.015 + t ** 0.85 * 0.21 }
}
function warmthToNeutral(warmth, primaryHue) {
  const w = Math.max(-1, Math.min(1, warmth))
  const baseHue = w >= 0 ? 70 : 230
  const chroma = Math.abs(w) * 0.018
  let hue = baseHue
  if (primaryHue != null) {
    const bias = Math.min(0.25, Math.abs(w) * 0.25)
    hue = baseHue * (1 - bias) + primaryHue * bias
  }
  return { hue: ((hue % 360) + 360) % 360, chroma }
}
const ACCENT_ANCHORS = {
  free: null,
  analogous: 30,
  triadic: 120,
  complementary: 180,
  split: -60,
}
function applyAccentAnchor(primaryHue, accentHue, anchor) {
  const offset = ACCENT_ANCHORS[anchor]
  if (offset == null) return accentHue
  return (((primaryHue + offset) % 360) + 360) % 360
}
// Measured foreground picker (mirrors src/themes/tokens.ts foregroundFor from Task 3).
const NEAR_BLACK = { l: 0.13, c: 0, h: 0 }
const NEAR_WHITE = { l: 0.97, c: 0, h: 0 }
function fgFor(bg) {
  return ratio(NEAR_BLACK, bg) >= ratio(NEAR_WHITE, bg)
    ? NEAR_BLACK
    : NEAR_WHITE
}
// Brand-tone-for-mode (mirrors src/lib/color.ts tuneBrandForMode from Task 4).
// Walks L until BOTH (brand vs bg) AND (best fg vs brand) clear the floor.
function tuneBrand(raw, mode, bg, floor = 4.5) {
  const l0 =
    mode === "dark" ? Math.max(0.55, Math.min(0.85, raw.l + 0.08)) : raw.l
  const dir = bg.l > 0.5 ? -1 : 1
  let attempt = { ...raw, l: clamp01(l0) }
  for (let step = 0; step <= 40; step++) {
    const test = { ...raw, l: clamp01(l0 + dir * step * 0.02) }
    const rBg = ratio(test, bg)
    const rBestFg = Math.max(ratio(NEAR_WHITE, test), ratio(NEAR_BLACK, test))
    attempt = test
    if (rBg >= floor && rBestFg >= floor) return test
  }
  return attempt
}
// Input border L that clears 3:1 on the mode's bg (Task 4b).
function inputBorderL(mode) {
  // Light mode: bg L=1.0, need relLum(input) ≤ 0.3 → OKLCH L ≈ 0.585.
  // Dark  mode: bg L≈0.13, need relLum(input) ≥ 0.142 → OKLCH L ≈ 0.45.
  return mode === "dark" ? 0.5 : 0.58
}
function semantic(hue, mode, intensity) {
  return { l: mode === "dark" ? 0.7 : 0.58, c: 0.16 * intensity, h: hue }
}

const CONTRAST = {
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
}

function buildTokens(theme, mode) {
  const inp = theme.inputs
  const der = theme.derivation
  const { hue: warmHue, chroma: warmChroma } = warmthToNeutral(
    inp.warmth,
    inp.primary.hue
  )
  const a = CONTRAST[der.contrast][mode]
  const c = warmChroma
  const h = warmHue
  const neutral = {
    bg: { l: a.bg, c, h },
    fg: { l: a.fg, c: c * 1.5, h },
    card: { l: a.card, c, h },
    muted: { l: a.muted, c: c * 1.4, h },
    mutedFg: { l: mode === "dark" ? 0.7 : 0.5, c: c * 1.4, h },
    border: { l: a.border, c, h },
    inputBorder: { l: inputBorderL(mode), c, h }, // Task 4b
    secondary: { l: a.muted, c: c * 1.4, h },
    surfaceAccent: { l: a.muted, c: c * 1.8, h },
    ring: { l: mode === "dark" ? 0.7 : 0.55, c, h },
  }
  const pLC = vibrancyToLC(inp.primary.vibrancy)
  const primaryRaw = {
    l: pLC.l,
    c: pLC.c * der.chromaBoost,
    h: inp.primary.hue,
  }
  const primary = tuneBrand(primaryRaw, mode, neutral.bg, 4.5)
  const aLC = vibrancyToLC(inp.accent.vibrancy)
  const accentRaw = {
    l: aLC.l,
    c: aLC.c * der.chromaBoost,
    h: applyAccentAnchor(inp.primary.hue, inp.accent.hue, inp.accent.anchor),
  }
  const accent = tuneBrand(accentRaw, mode, neutral.bg, 4.5)
  return {
    primary,
    accent,
    neutral,
    primaryFg: fgFor(primary),
    accentFg: fgFor(neutral.surfaceAccent), // accent token = neutral.surfaceAccent
    brandAccentFg: fgFor(accent),
    destructive: semantic(25, mode, der.semanticIntensity),
    success: semantic(145, mode, der.semanticIntensity),
    warning: semantic(70, mode, der.semanticIntensity),
    info: semantic(215, mode, der.semanticIntensity),
  }
}

// Pair ids match src/themes/a11y.ts PAIRS catalog. Drift guard: when the
// runtime catalog changes, update this list in lockstep.
function pairsFor(t) {
  return [
    ["fg-bg", "Body text on background", t.neutral.fg, t.neutral.bg, "text"],
    ["fg-card", "Body text on card", t.neutral.fg, t.neutral.card, "text"],
    [
      "muted-bg",
      "Muted text on background",
      t.neutral.mutedFg,
      t.neutral.bg,
      "text",
    ],
    [
      "muted-muted",
      "Muted text on muted",
      t.neutral.mutedFg,
      t.neutral.muted,
      "text",
    ],
    [
      "muted-card",
      "Muted text on card",
      t.neutral.mutedFg,
      t.neutral.card,
      "text",
    ],
    ["primary-fill", "Label on primary fill", t.primaryFg, t.primary, "text"],
    [
      "accent-fill",
      "Label on accent surface",
      t.accentFg,
      t.neutral.surfaceAccent,
      "text",
    ],
    [
      "brand-fill",
      "Label on brand accent fill",
      t.brandAccentFg,
      t.accent,
      "text",
    ],
    [
      "primary-link",
      "Primary as link/display",
      t.primary,
      t.neutral.bg,
      "text-display",
    ],
    [
      "accent-link",
      "Accent as link/display",
      t.accent,
      t.neutral.bg,
      "text-display",
    ],
    [
      "ring-bg",
      "Focus ring on background",
      { l: t.neutral.ring.l, c: t.primary.c, h: t.primary.h },
      t.neutral.bg,
      "ui",
    ],
    [
      "input-bg",
      "Input border on background",
      t.neutral.inputBorder,
      t.neutral.bg,
      "ui",
    ],
    ["destr-bg", "Destructive blob", t.destructive, t.neutral.bg, "ui"],
    ["success-bg", "Success blob", t.success, t.neutral.bg, "ui"],
    ["warning-bg", "Warning blob", t.warning, t.neutral.bg, "ui"],
    ["info-bg", "Info blob", t.info, t.neutral.bg, "ui"],
  ]
}

function passes(r, category) {
  if (category === "ui") return r >= 3.0
  if (category === "text-display") return r >= 3.0
  return r >= 4.5
}

let failures = 0
console.log("\nWCAG 2.x audit — built-in presets × {light, dark}\n")
for (const theme of registry.themes) {
  for (const mode of ["light", "dark"]) {
    const t = buildTokens(theme, mode)
    const rows = pairsFor(t).map(([id, label, fg, bg, cat]) => {
      const r = ratio(fg, bg)
      const ok = passes(r, cat)
      if (!ok) failures++
      return { id, label, r, ok, cat }
    })
    const fails = rows.filter((x) => !x.ok)
    console.log(
      `${theme.id.padEnd(10)} ${mode.padEnd(6)}  ${
        fails.length ? `❌ ${fails.length} fail` : "✓ pass"
      }`
    )
    for (const row of rows) {
      const tag = row.ok ? "PASS" : "FAIL"
      const flag = row.ok ? "" : " ❌"
      console.log(
        `  ${row.label.padEnd(28)} ${row.r.toFixed(2).padStart(5)}:1  ${tag}${flag}`
      )
    }
    console.log()
  }
}
process.exit(failures === 0 ? 0 : 1)
