# Theme Accessibility — Audit and Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make WCAG 2.2 contrast a first-class property of the theme system: measured at runtime, displayed on a single accessibility overview page (light + dark side-by-side, all themes), surfaced live in the dev panel with a clickable indicator, and enforced as a floor for all built-in presets.

**Architecture:** A pure WCAG contrast library (`src/lib/contrast.ts`) feeds a theme-audit module (`src/themes/a11y.ts`) that enumerates known token pairs and grades them. The token derivation is upgraded so brand foregrounds and (where needed) brand lightness are picked by measured contrast instead of a binary lightness threshold, lifting the worst-offending pairs into AA. A new `/accessibility` route renders the full audit for every preset × mode in one document. The dev panel reads the same audit module reactively and renders a small chip that turns amber/red when the current theme drops below the moderate baseline; clicking it deep-links to the overview page anchor for the active preset+mode.

**Tech Stack:** Next.js 16 App Router (Server Components), React 19, TypeScript strict, Tailwind v4, shadcn/ui primitives, Biome 2.4. Verification via a standalone `scripts/audit-a11y.mjs` Node script (lift to Vitest later when the hardening spec's testing infra lands).

---

## 0. Audit findings (frozen for plan consumers)

This plan was sized against a numerical audit of the current four presets, performed by replicating the derivation pipeline and computing WCAG 2.x contrast ratios for the load-bearing token pairs. Results:

**Failure counts by preset × mode (pairs that fall below the moderate baseline):**

| Preset    | Light failures | Dark failures |
|-----------|----------------|---------------|
| Editorial | 3              | 3             |
| SaaS      | 4              | 1             |
| Bold      | 4              | 1             |
| Cyber     | 4 (incl. primary/bg = **2.78** — below AA-large) | 1 |

**Universal regressions:**
- `--border` against `--background` is ≈1.3:1 in every preset and every mode. The current `oklchToCss(ctx.neutral.border, alpha)` pass actively *reduces* contrast in dark mode. WCAG 1.4.11 (Non-text Contrast) requires 3:1 for UI components whose visibility is essential — `--input` falls under this; decorative borders are exempt.
- `foregroundFor()` uses a binary `bg.l > 0.6` cutoff. This misses vibrant accents (Editorial accent at L=0.62 gets near-black foreground, yielding 3.86:1 instead of the >4.5 we'd get with white). The picker must be *measured*, not thresholded.
- Light-mode brand-on-background fails for inherently-light hues (Cyber cyan, Bold yellow). The `darkenForMode` helper only handles dark mode; light mode has no parallel pass to push primary L down when the chroma + hue combine to produce a too-light brand color on near-white bg.

**No accessibility code exists today.** No contrast computation, no validation, no per-pair grading anywhere in the codebase. The "Contrast" axis (`low`/`medium`/`high` in `derivation-axes.ts`) drives lightness anchors only — it is not WCAG-aware.

The plan below addresses each of these directly. Phases are independently mergeable.

---

## 1. Threshold model (the contract every consumer uses)

WCAG 2.2 levels, applied per-pair-category:

| Pair category   | Examples                                                                 | Pass threshold   | "Moderate baseline" floor |
|-----------------|--------------------------------------------------------------------------|------------------|---------------------------|
| Body text       | `foreground/background`, `mutedForeground/background`, `cardForeground/card` | 4.5 (AA Normal) | 4.5                       |
| Filled surface  | `primaryForeground/primary`, `accentForeground/accent`, `brandAccentForeground/brandAccent` | 4.5 | 4.5 |
| Brand-on-neutral| `primary/background`, `accent/background`, `brandAccent/background`        | 4.5 if used as body, 3.0 if display-only | 4.5 (warn at 3.0–4.5) |
| UI component    | `input/background`, `ring/background`                                     | 3.0 (1.4.11)     | 3.0                       |
| Semantic blob   | `destructive/background`, `success/background`, `warning/background`, `info/background` | 3.0 (1.4.11) | 3.0 |
| Decorative      | `border/background`                                                      | exempt           | exempt                    |

Grades:
- `AAA` — text ≥ 7.0
- `AA` — text ≥ 4.5, UI ≥ 4.5
- `AA-Large` — text 3.0–4.5 (only valid for ≥18pt or ≥14pt-bold; signalled as a warning)
- `Fail` — text < 3.0 OR UI < 3.0

The dev-panel indicator fires when *any* pair falls below its moderate baseline.

---

## 2. File layout

**Create:**

| File | Purpose |
|---|---|
| `src/lib/contrast.ts` | Pure WCAG math: `relativeLuminance(rgb)`, `wcagRatio(a, b)`, `wcagRatioOklch(a, b)`, `gradeRatio(ratio, category)`. |
| `src/themes/a11y.ts` | Pair catalog (the list of token pairs to audit + their category). `auditTheme(theme, mode) → AuditResult`. `auditAllPresets() → PresetAuditResult[]`. |
| `src/app/(marketing)/accessibility/page.tsx` | Server-rendered overview page. Renders every preset × {light, dark} side-by-side. |
| `src/app/(marketing)/accessibility/_components/theme-preview-card.tsx` | A single card that scopes CSS vars + `.dark` class to its subtree so light and dark cards can coexist on one document. |
| `src/app/(marketing)/accessibility/_components/audit-matrix.tsx` | The pair-by-pair audit table for one theme+mode. |
| `src/app/(marketing)/accessibility/_components/sample-strip.tsx` | Renders body/heading/UI samples (size variants) inside the scoped theme. |
| `src/components/dev-panel/a11y-indicator.tsx` | Live indicator chip + popover summary; clickable → deep-links to overview. |
| `scripts/audit-a11y.mjs` | Standalone Node script that exercises the same logic without a test runner. CI-ready. |

**Modify:**

| File | Change |
|---|---|
| `src/themes/tokens.ts` | Replace `foregroundFor()` with a measured-contrast picker. Add a `tuneBrandForMode()` pass that lifts/dims brand L when needed to clear AA against bg. Rename `darkenForMode` accordingly (or wrap it). |
| `src/themes/registry.json` | Per-preset tweaks that, paired with the engine upgrade, push every pair to the moderate baseline. |
| `src/themes/derivation-axes.ts` | Add `darkOnly?: boolean` to `ContrastLevel`? No — instead: nothing here. Mode restriction handled at preset level if needed (Cyber). |
| `src/lib/routes.ts` | Add `/accessibility` to `devRoutes`. |
| `src/components/dev-panel/tabs/themes-tab.tsx` | Mount `<A11yIndicator />` in the panel header area (above presets). |
| `src/app/(marketing)/layout.tsx` (if it exists) | No change — the accessibility route uses its own layout. |

---

## 3. Phases

- **Phase 1 — Pure logic and audit data.** Contrast lib + a11y module + foreground heuristic upgrade + brand-tone-for-mode pass. End state: derivation engine produces tokens that pass the moderate baseline for at least Editorial/SaaS/Bold in both modes, and Cyber in dark mode.
- **Phase 2 — Preset reconciliation.** Walk through each preset's failures and apply input-level adjustments to clear the floor in both modes. Cyber gets either (a) light-mode-only input adjustments or (b) an explicit `modes: ["dark"]` annotation honored by the engine.
- **Phase 3 — Accessibility overview page.** Single page, all themes, both modes, all pairs, all size variants.
- **Phase 4 — Dev-panel live indicator.** Live audit; clickable chip with deep link.
- **Phase 5 — Standalone audit script + CI hook.**
- **Phase 6 — Documentation pass.**

Each phase is independently mergeable.

---

## 4. Tasks

### Task 1: WCAG contrast math library

**Files:**
- Create: `src/lib/contrast.ts`

- [ ] **Step 1: Write the module**

```ts
// src/lib/contrast.ts
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

export type Category =
  | "text"
  | "ui"
  | "decorative"

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
```

- [ ] **Step 2: Add the standalone verification script (used in place of unit tests until Vitest lands)**

**Files:**
- Create: `scripts/audit-a11y.mjs`

```js
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
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

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
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
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
  const L1 = relLum(oklchToRgb(a)), L2 = relLum(oklchToRgb(b))
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2)
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
const ACCENT_ANCHORS = { free: null, analogous: 30, triadic: 120, complementary: 180, split: -60 }
function applyAccentAnchor(primaryHue, accentHue, anchor) {
  const offset = ACCENT_ANCHORS[anchor]
  if (offset == null) return accentHue
  return (((primaryHue + offset) % 360) + 360) % 360
}
// Measured foreground picker (mirrors src/themes/tokens.ts foregroundFor from Task 3).
const NEAR_BLACK = { l: 0.13, c: 0, h: 0 }
const NEAR_WHITE = { l: 0.97, c: 0, h: 0 }
function fgFor(bg) {
  return ratio(NEAR_BLACK, bg) >= ratio(NEAR_WHITE, bg) ? NEAR_BLACK : NEAR_WHITE
}
// Brand-tone-for-mode (mirrors src/lib/color.ts tuneBrandForMode from Task 4).
// Walks L until BOTH (brand vs bg) AND (best fg vs brand) clear the floor.
function tuneBrand(raw, mode, bg, floor = 4.5) {
  const l0 = mode === "dark" ? Math.max(0.55, Math.min(0.85, raw.l + 0.08)) : raw.l
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
  low:    { light: { bg: 0.98, fg: 0.22, card: 0.97,  muted: 0.94, border: 0.9  }, dark: { bg: 0.16, fg: 0.94,  card: 0.2,  muted: 0.24, border: 0.28 } },
  medium: { light: { bg: 1.0,  fg: 0.15, card: 0.985, muted: 0.96, border: 0.92 }, dark: { bg: 0.13, fg: 0.97,  card: 0.18, muted: 0.22, border: 0.26 } },
  high:   { light: { bg: 1.0,  fg: 0.08, card: 0.99,  muted: 0.95, border: 0.88 }, dark: { bg: 0.08, fg: 0.985, card: 0.14, muted: 0.2,  border: 0.26 } },
}

function buildTokens(theme, mode) {
  const inp = theme.inputs, der = theme.derivation
  const { hue: warmHue, chroma: warmChroma } = warmthToNeutral(inp.warmth, inp.primary.hue)
  const a = CONTRAST[der.contrast][mode]
  const c = warmChroma, h = warmHue
  const neutral = {
    bg:            { l: a.bg,                       c,           h },
    fg:            { l: a.fg,                       c: c * 1.5,  h },
    card:          { l: a.card,                     c,           h },
    muted:         { l: a.muted,                    c: c * 1.4,  h },
    mutedFg:       { l: mode === "dark" ? 0.7 : 0.5, c: c * 1.4, h },
    border:        { l: a.border,                   c,           h },
    inputBorder:   { l: inputBorderL(mode),         c,           h }, // Task 4b
    secondary:     { l: a.muted,                    c: c * 1.4,  h },
    surfaceAccent: { l: a.muted,                    c: c * 1.8,  h },
    ring:          { l: mode === "dark" ? 0.7 : 0.55, c,         h },
  }
  const pLC = vibrancyToLC(inp.primary.vibrancy)
  const primaryRaw = { l: pLC.l, c: pLC.c * der.chromaBoost, h: inp.primary.hue }
  const primary = tuneBrand(primaryRaw, mode, neutral.bg, 4.5)
  const aLC = vibrancyToLC(inp.accent.vibrancy)
  const accentRaw = {
    l: aLC.l,
    c: aLC.c * der.chromaBoost,
    h: applyAccentAnchor(inp.primary.hue, inp.accent.hue, inp.accent.anchor),
  }
  const accent = tuneBrand(accentRaw, mode, neutral.bg, 4.5)
  return {
    primary, accent, neutral,
    primaryFg: fgFor(primary),
    accentFg:  fgFor(neutral.surfaceAccent), // accent token = neutral.surfaceAccent
    brandAccentFg: fgFor(accent),
    destructive: semantic(25,  mode, der.semanticIntensity),
    success:     semantic(145, mode, der.semanticIntensity),
    warning:     semantic(70,  mode, der.semanticIntensity),
    info:        semantic(215, mode, der.semanticIntensity),
  }
}

// Pair ids match src/themes/a11y.ts PAIRS catalog. Drift guard: when the
// runtime catalog changes, update this list in lockstep.
function pairsFor(t) {
  return [
    ["fg-bg",          "Body text on background",     t.neutral.fg,  t.neutral.bg,   "text"],
    ["fg-card",        "Body text on card",           t.neutral.fg,  t.neutral.card, "text"],
    ["muted-bg",       "Muted text on background",    t.neutral.mutedFg, t.neutral.bg,   "text"],
    ["muted-muted",    "Muted text on muted",         t.neutral.mutedFg, t.neutral.muted,"text"],
    ["muted-card",     "Muted text on card",          t.neutral.mutedFg, t.neutral.card, "text"],
    ["primary-fill",   "Label on primary fill",       t.primaryFg,   t.primary,        "text"],
    ["accent-fill",    "Label on accent surface",     t.accentFg,    t.neutral.surfaceAccent, "text"],
    ["brand-fill",     "Label on brand accent fill",  t.brandAccentFg, t.accent,       "text"],
    ["primary-link",   "Primary as link/display",     t.primary,     t.neutral.bg,     "text-display"],
    ["accent-link",    "Accent as link/display",      t.accent,      t.neutral.bg,     "text-display"],
    ["ring-bg",        "Focus ring on background",    { l: t.neutral.ring.l, c: t.primary.c, h: t.primary.h }, t.neutral.bg, "ui"],
    ["input-bg",       "Input border on background",  t.neutral.inputBorder, t.neutral.bg,  "ui"],
    ["destr-bg",       "Destructive blob",            t.destructive, t.neutral.bg,     "ui"],
    ["success-bg",     "Success blob",                t.success,     t.neutral.bg,     "ui"],
    ["warning-bg",     "Warning blob",                t.warning,     t.neutral.bg,     "ui"],
    ["info-bg",        "Info blob",                   t.info,        t.neutral.bg,     "ui"],
  ]
}

function passes(r, category) {
  if (category === "ui")           return r >= 3.0
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
    console.log(`${theme.id.padEnd(10)} ${mode.padEnd(6)}  ${fails.length ? `❌ ${fails.length} fail` : "✓ pass"}`)
    for (const row of rows) {
      const tag = row.ok ? "PASS" : "FAIL"
      const flag = row.ok ? "" : " ❌"
      console.log(`  ${row.label.padEnd(28)} ${row.r.toFixed(2).padStart(5)}:1  ${tag}${flag}`)
    }
    console.log()
  }
}
process.exit(failures === 0 ? 0 : 1)
```

Note: this script's local `buildTokens` mirrors the runtime engine *post-Task-3-and-Task-4* (measured `foregroundFor`, `tuneBrandForMode`). When run BEFORE Tasks 3 and 4 land, it will show fewer failures than the unfixed runtime — which is fine; it represents the floor the engine is being upgraded to. The verification loop is: ship Tasks 3 and 4, run `pnpm audit:a11y`, then ship Task 5 until zero failures.

- [ ] **Step 3: Add `audit:a11y` script**

**Files:**
- Modify: `package.json`

Add to `scripts`:
```json
"audit:a11y": "node scripts/audit-a11y.mjs"
```

- [ ] **Step 4: Verify the script runs**

Run: `pnpm audit:a11y`
Expected: prints a per-preset table with current failures (matches §0 of this plan). Exit code 1.

- [ ] **Step 5: Commit**

```bash
git add src/lib/contrast.ts scripts/audit-a11y.mjs package.json
git commit -m "feat(a11y): add WCAG contrast math + standalone audit script"
```

---

### Task 2: A11y pair catalog and audit function

**Files:**
- Create: `src/themes/a11y.ts`

- [ ] **Step 1: Build the pair catalog**

```ts
// src/themes/a11y.ts
/**
 * Accessibility audit module. The single place that knows which token
 * pairs to grade and how to grade them. Consumed by:
 * - the /accessibility overview page (server-rendered)
 * - the dev-panel live indicator (client-side reactive)
 * - scripts/audit-a11y.mjs (CI gate)
 *
 * Adding a pair = one entry in `PAIRS`. The overview page and the dev
 * panel pick it up automatically.
 */

import { hexToOklch } from "@/lib/color"
import {
  type Category,
  type Grade,
  gradeRatio,
  isBelowModerateBaseline,
  wcagRatioOklch,
} from "@/lib/contrast"

import type { ControllerTheme } from "./controller-types"
import { type ColorTokenKey, type ColorTokens } from "./tokens"
import type { Mode } from "./tokens"
import { resolveTokens } from "./registry"

export type PairSpec = {
  /** Stable id used as DOM anchor in the overview page. */
  id: string
  label: string
  /** Foreground token (text or graphic). */
  fg: ColorTokenKey
  /** Background token. */
  bg: ColorTokenKey
  category: Category
  /**
   * If `displayOnly: true`, the pair grades at the AA-Large floor (3.0)
   * and a result of "AA-Large" is treated as PASS for the moderate
   * baseline. Used for brand-on-background where the usage is heading-
   * sized display only.
   */
  displayOnly?: boolean
}

/** The audit catalog. Adding a pair here surfaces it everywhere. */
export const PAIRS: readonly PairSpec[] = [
  // Body text on neutral surfaces
  { id: "fg-bg",        label: "Body text on background",       fg: "foreground",        bg: "background", category: "text" },
  { id: "fg-card",      label: "Body text on card",             fg: "cardForeground",    bg: "card",       category: "text" },
  { id: "fg-popover",   label: "Body text on popover",          fg: "popoverForeground", bg: "popover",    category: "text" },
  { id: "muted-bg",     label: "Muted text on background",      fg: "mutedForeground",   bg: "background", category: "text" },
  { id: "muted-muted",  label: "Muted text on muted surface",   fg: "mutedForeground",   bg: "muted",      category: "text" },
  { id: "muted-card",   label: "Muted text on card",            fg: "mutedForeground",   bg: "card",       category: "text" },

  // Filled brand / surface affordances
  { id: "primary-fill",   label: "Label on primary fill",       fg: "primaryForeground",     bg: "primary",     category: "text" },
  { id: "secondary-fill", label: "Label on secondary fill",     fg: "secondaryForeground",   bg: "secondary",   category: "text" },
  { id: "accent-fill",    label: "Label on accent surface",     fg: "accentForeground",      bg: "accent",      category: "text" },
  { id: "brand-fill",     label: "Label on brand accent fill",  fg: "brandAccentForeground", bg: "brandAccent", category: "text" },
  { id: "destr-fill",     label: "Label on destructive fill",   fg: "background",            bg: "destructive", category: "text" },

  // Sidebar
  { id: "sb-fg",        label: "Sidebar text",                  fg: "sidebarForeground",        bg: "sidebar",        category: "text" },
  { id: "sb-primary",   label: "Sidebar active item",           fg: "sidebarPrimaryForeground", bg: "sidebarPrimary", category: "text" },
  { id: "sb-accent",    label: "Sidebar hover surface",         fg: "sidebarAccentForeground",  bg: "sidebarAccent",  category: "text" },

  // Brand color used as text/link on neutral (display-only allowance)
  { id: "primary-link", label: "Primary as link / display",     fg: "primary",     bg: "background", category: "text", displayOnly: true },
  { id: "accent-link",  label: "Accent as link / display",      fg: "accent",      bg: "background", category: "text", displayOnly: true },
  { id: "brand-link",   label: "Brand accent as display",       fg: "brandAccent", bg: "background", category: "text", displayOnly: true },

  // UI affordances (1.4.11 — 3:1 required)
  { id: "ring-bg",      label: "Focus ring on background",      fg: "ring",        bg: "background", category: "ui" },
  { id: "input-bg",     label: "Input border on background",    fg: "input",       bg: "background", category: "ui" },
  { id: "destr-bg",     label: "Destructive blob on bg",        fg: "destructive", bg: "background", category: "ui" },
  { id: "success-bg",   label: "Success blob on bg",            fg: "success",     bg: "background", category: "ui" },
  { id: "warning-bg",   label: "Warning blob on bg",            fg: "warning",     bg: "background", category: "ui" },
  { id: "info-bg",      label: "Info blob on bg",               fg: "info",        bg: "background", category: "ui" },

  // Decorative (graded but never blocks the baseline)
  { id: "border-bg",    label: "Decorative border on bg",       fg: "border",      bg: "background", category: "decorative" },
] as const

export type PairResult = {
  pair: PairSpec
  ratio: number
  grade: Grade
  /** True when the pair is below the moderate baseline for its category. */
  fails: boolean
  fgCss: string
  bgCss: string
}

export type AuditResult = {
  themeId: string
  themeName: string
  mode: Mode
  pairs: PairResult[]
  /** Pair ids that fail the moderate baseline. */
  failures: string[]
  /** Worst (lowest) ratio across all non-decorative pairs. */
  worstRatio: number
}

/** Parse an `oklch(L C H)` or `oklch(L C H / a)` string to an OKLCH triple. */
function parseOklch(s: string): { l: number; c: number; h: number } {
  // Accept "oklch(0.62 0.18 290)" or "oklch(0.62 0.18 290 / 0.6)".
  const m = s.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*[0-9.]+)?\s*\)/i)
  if (m) {
    return { l: +m[1], c: +m[2], h: +m[3] }
  }
  // Fallback: try hex.
  return hexToOklch(s)
}

export function auditTheme(theme: ControllerTheme, mode: Mode): AuditResult {
  const tokens = resolveTokens(theme, mode)
  const pairs: PairResult[] = PAIRS.map((p) => {
    const fgCss = tokens[p.fg]
    const bgCss = tokens[p.bg]
    const r = wcagRatioOklch(parseOklch(fgCss), parseOklch(bgCss))
    const grade = gradeRatio(r, p.category)
    // For display-only text pairs, AA-Large counts as PASS.
    const fails =
      p.category === "decorative"
        ? false
        : p.displayOnly
          ? r < 3.0
          : isBelowModerateBaseline(r, p.category)
    return { pair: p, ratio: r, grade, fails, fgCss, bgCss }
  })
  const failures = pairs.filter((p) => p.fails).map((p) => p.pair.id)
  const worst = pairs
    .filter((p) => p.pair.category !== "decorative")
    .reduce((m, p) => Math.min(m, p.ratio), Number.POSITIVE_INFINITY)
  return {
    themeId: theme.id,
    themeName: theme.name,
    mode,
    pairs,
    failures,
    worstRatio: worst,
  }
}

export function auditAllPresets(
  themes: readonly ControllerTheme[]
): AuditResult[] {
  const out: AuditResult[] = []
  for (const t of themes) {
    out.push(auditTheme(t, "light"))
    out.push(auditTheme(t, "dark"))
  }
  return out
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `pnpm exec tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Wire the script to import from the module**

**Files:**
- Modify: `scripts/audit-a11y.mjs`

Replace the verbatim catalog copy with a dynamic import:
```js
import { baseThemes } from "../src/themes/registry.ts"
// (Note: requires `node --experimental-strip-types` on Node 22, or
//  swap to a thin TS build step. If the project's Node version
//  doesn't support type-stripping, keep the catalog copy in the
//  script as a sanity check until Vitest lands.)
```

If type-stripping is not available, keep the script self-contained but add a fixture-style assertion that the pair list in the script matches the runtime catalog (count + ids). Implementation:

```js
// scripts/audit-a11y.mjs — drift guard
const RUNTIME_PAIR_IDS = [
  "fg-bg","fg-card","fg-popover","muted-bg","muted-muted","muted-card",
  "primary-fill","secondary-fill","accent-fill","brand-fill","destr-fill",
  "sb-fg","sb-primary","sb-accent",
  "primary-link","accent-link","brand-link",
  "ring-bg","input-bg","destr-bg","success-bg","warning-bg","info-bg",
  "border-bg",
]
// Pair ids in this script must match the runtime catalog exactly.
// Compare against src/themes/a11y.ts on every CI run via grep.
```

- [ ] **Step 4: Run the script**

Run: `pnpm audit:a11y`
Expected: same failure summary as before, but each row now lists the canonical pair id from the catalog.

- [ ] **Step 5: Commit**

```bash
git add src/themes/a11y.ts scripts/audit-a11y.mjs
git commit -m "feat(a11y): add theme audit module + pair catalog"
```

---

### Task 3: Replace `foregroundFor` with a measured-contrast picker

**Files:**
- Modify: `src/themes/tokens.ts:106-108`

Today's heuristic:
```ts
export function foregroundFor(bg: OKLCH): OKLCH {
  return bg.l > 0.6 ? { l: 0.13, c: 0, h: 0 } : { l: 0.97, c: 0, h: 0 }
}
```

This produces 3.86:1 on Editorial accent (light) and 4.17:1 on SaaS accent (light) because the binary cut at L=0.6 doesn't account for chroma.

- [ ] **Step 1: Replace with a measured picker**

```ts
// src/themes/tokens.ts (around line 106)
import { wcagRatioOklch } from "@/lib/contrast"

const NEAR_BLACK: OKLCH = { l: 0.13, c: 0, h: 0 }
const NEAR_WHITE: OKLCH = { l: 0.97, c: 0, h: 0 }

/**
 * Pick the readable near-black/near-white foreground for `bg` by
 * *measured* WCAG contrast — not by an L threshold. For vivid hues
 * the chroma can pull the perceived darkness across the simple L=0.6
 * cutoff, producing a too-low ratio. Measuring fixes that without
 * adding new tokens.
 */
export function foregroundFor(bg: OKLCH): OKLCH {
  const rBlack = wcagRatioOklch(NEAR_BLACK, bg)
  const rWhite = wcagRatioOklch(NEAR_WHITE, bg)
  return rBlack >= rWhite ? NEAR_BLACK : NEAR_WHITE
}
```

- [ ] **Step 2: Re-run the audit script**

Run: `pnpm audit:a11y`
Expected (delta vs §0):
- Editorial light: `accent-fill` 3.86 → ≥ 4.5 (picker flips to near-white)
- SaaS light: `primary-fill` 4.22 → ≥ 4.5; `accent-fill` 4.17 → ≥ 4.5
- Other passing rows unchanged

- [ ] **Step 3: Commit**

```bash
git add src/themes/tokens.ts
git commit -m "fix(a11y): pick brand foreground by measured contrast"
```

---

### Task 4: Brand-tone-for-mode pass (light + dark legibility)

The current pipeline has `darkenForMode` which lifts brand L for dark mode legibility. There is **no parallel pass for light mode** — and that's where Cyber breaks (cyan primary at L=0.62 against pure white = 2.78:1). We need a symmetric tone pass that, *after* the vibrancy curve and chromaBoost, nudges brand L until contrast against the mode's bg clears 4.5.

**Files:**
- Modify: `src/lib/color.ts:216-230`
- Modify: `src/themes/tokens.ts:55-99` (buildDeriveCtx — call the new helper)

- [ ] **Step 1: Generalize `darkenForMode` to `tuneBrandForMode`**

```ts
// src/lib/color.ts (add alongside darkenForMode)
import { wcagRatioOklch } from "./contrast"

const NEAR_BLACK_FG: OKLCH = { l: 0.13, c: 0, h: 0 }
const NEAR_WHITE_FG: OKLCH = { l: 0.97, c: 0, h: 0 }

/**
 * Tone a brand color for the target mode so it clears a contrast floor
 * against TWO things simultaneously:
 *   1. the mode's background (so the brand reads as a link / display)
 *   2. the best near-white/near-black foreground for the brand (so a
 *      filled button label reads on top of it)
 *
 * Without constraint (2), the brand-vs-bg search can land in the L≈0.5
 * "middle zone" where neither black nor white foreground passes 4.5 —
 * which produces the observed cluster of brand-fill pairs at 4.35–4.47.
 *
 * In dark mode we lift L; in light mode we drop L. Chroma is preserved.
 * Returns the brand color at the smallest L delta that clears both.
 */
export function tuneBrandForMode(
  raw: OKLCH,
  mode: "light" | "dark",
  bg: OKLCH,
  floor = 4.5
): OKLCH {
  // Step 1: apply mode-baseline lift (legacy darkenForMode brand behavior)
  const l0 =
    mode === "dark"
      ? Math.max(0.55, Math.min(0.85, raw.l + 0.08))
      : raw.l

  // Step 2: walk L in the legibility direction until BOTH constraints clear.
  //  - light bg → we want a darker brand → decrease L
  //  - dark  bg → we want a lighter brand → increase L
  const dir = bg.l > 0.5 ? -1 : 1
  let attempt: OKLCH = { ...raw, l: clamp01(l0) }
  for (let step = 0; step <= 40; step++) {
    const test: OKLCH = { ...raw, l: clamp01(l0 + dir * step * 0.02) }
    const rBg = wcagRatioOklch(test, bg)
    const rWhiteFg = wcagRatioOklch(NEAR_WHITE_FG, test)
    const rBlackFg = wcagRatioOklch(NEAR_BLACK_FG, test)
    const rBestFg = Math.max(rWhiteFg, rBlackFg)
    attempt = test
    if (rBg >= floor && rBestFg >= floor) break
  }
  return attempt
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}
```

(Keep `darkenForMode` exactly as it is. `tuneBrandForMode` is a new helper. The kind="surface" and kind="border" callers — if any — are unchanged. Brand callers in `buildDeriveCtx` migrate to `tuneBrandForMode`.)

- [ ] **Step 2: Refactor `darkenForMode` callsites that aren't brand**

The `darkenForMode(l, { kind: "surface" })` and `kind: "border"` paths are NOT brand-toned — they're geometric mirrors used elsewhere. Grep for `darkenForMode`:

```bash
grep -rn "darkenForMode" src
```

Expected callers: `src/themes/tokens.ts` (primary + accent — these are the brand callers we want).

If `kind: "surface"` and `kind: "border"` callers exist, leave them on the old helper. Rename the helper if needed (don't break the API; only add `tuneBrandForMode`).

- [ ] **Step 3: Update `buildDeriveCtx` to use the new helper**

```ts
// src/themes/tokens.ts (replace L= lines in buildDeriveCtx)
import { tuneBrandForMode } from "@/lib/color"

// inside buildDeriveCtx, AFTER neutral.bg is computed:
const primary: OKLCH = tuneBrandForMode(
  { l: pLC.l, c: pLC.c * derivation.chromaBoost, h: inputs.primary.hue },
  mode,
  neutral.bg,
  4.5
)
const accent: OKLCH = tuneBrandForMode(
  {
    l: aLC.l,
    c: aLC.c * derivation.chromaBoost,
    h: applyAccentAnchor(
      inputs.primary.hue,
      inputs.accent.hue,
      inputs.accent.anchor
    ),
  },
  mode,
  neutral.bg,
  4.5
)
```

Note: this requires `neutral.bg` to be known before brand tones — reorder the function so the neutral palette is built first, then brand colors consult it.

- [ ] **Step 4: Re-run the audit script**

Run: `pnpm audit:a11y`
Expected: with Task 4 only (Task 4b not yet shipped), text pairs clear 4.5 for every preset × mode. `input-bg` still fails universally — that's Task 4b's responsibility. A representative passing row: Cyber-light `Label on primary fill` ≈ 4.84:1, `Primary as link/display` ≈ 5.23:1. Cyber-light primary L is pulled down to ~0.45 from the raw 0.62.

- [ ] **Step 5: Visual smoke test**

Run: `pnpm dev`
Visit `/sandbox` for each preset (`~` → theme switcher). Confirm primary buttons still look like the intended preset. Specifically:
- Cyber light: primary cyan is darker than before; still recognizable as cyan.
- Bold light: purple primary slightly muted.
- Editorial dark: muted-orange primary nudged lighter.

If any preset looks broken, capture the regression and tune `derivation.chromaBoost` or the preset's vibrancy in Task 5.

- [ ] **Step 6: Commit**

```bash
git add src/lib/color.ts src/themes/tokens.ts
git commit -m "fix(a11y): tune brand lightness per-mode to clear AA"
```

---

### Task 4b: Split input border from decorative border

The audit's `input-bg` pair fails universally (≈1.3:1) because `--input` and `--border` derive from the same `neutral.border` anchor, which is calibrated for visual subtlety (L 0.88–0.92 light, 0.26 dark). WCAG 1.4.11 requires **3:1** for UI components whose visibility is essential to identification — an input's boundary qualifies. Decorative borders (around cards, sections) are exempt because they're reinforced by shadow + spacing.

The fix: derive `input` from a *separate* `inputBorder` anchor that clears 3:1 against bg by construction. The current `border` token stays as-is for decorative use.

**Files:**
- Modify: `src/themes/tokens.ts` (the `NeutralPalette` type, `buildDeriveCtx`, the `input` token derive)

- [ ] **Step 1: Add `inputBorder` to the neutral palette**

```ts
// src/themes/tokens.ts (NeutralPalette type, around line 29)
export type NeutralPalette = {
  bg: OKLCH
  fg: OKLCH
  card: OKLCH
  muted: OKLCH
  mutedFg: OKLCH
  border: OKLCH
  /** Input/textarea border. Required to clear 3:1 vs bg (WCAG 1.4.11). */
  inputBorder: OKLCH
  surfaceAccent: OKLCH
  ring: OKLCH
  secondary: OKLCH
}
```

- [ ] **Step 2: Compute `inputBorder` in `buildDeriveCtx`**

```ts
// src/themes/tokens.ts (inside buildDeriveCtx, beside the existing neutral.border line)

// Input border: separately picked so 3:1 vs bg is guaranteed.
// Light mode: bg L≈1.0, need OKLCH L ≤ ~0.585 to clear 3:1.
// Dark mode:  bg L≈0.13, need OKLCH L ≥ ~0.45 to clear 3:1.
// Pick a value comfortably inside that range, biased toward the
// existing border tone so the visual delta from `border` is small.
const inputBorder: OKLCH = {
  l: mode === "dark" ? 0.5 : 0.58,
  c,
  h,
}

const neutral: NeutralPalette = {
  // ...existing fields...
  inputBorder,
}
```

- [ ] **Step 3: Update the `input` token to derive from `inputBorder`**

```ts
// src/themes/tokens.ts (the input entry in COLOR_TOKENS, around line 223)
input: {
  cssVar: "--input",
  category: "surface",
  derive: (ctx) =>
    oklchToCss(ctx.neutral.inputBorder, ctx.mode === "dark" ? 0.9 : 1),
},
```

Note: the alpha drops to 0.9 in dark mode (down from the previous 0.6, which was making contrast worse). Use a value that keeps the visual weight close to before; the change is the underlying L, not the alpha.

- [ ] **Step 4: Verify `input-bg` clears 3.0 in the audit**

Run: `pnpm audit:a11y`
Expected: `Input border on background` row shows ≥ 3.0:1 in every preset × mode.

- [ ] **Step 5: Visual check — inputs still look like inputs, not buttons**

Run: `pnpm dev`
Visit `/login` and `/signup` for each preset in both modes.
Expected: the input border is darker than before but still reads as a thin boundary, not a heavy outline. If it looks like a button, lower the chroma multiplier on `inputBorder` or pick L=0.6 (light) / L=0.48 (dark) and re-verify the audit.

- [ ] **Step 6: Commit**

```bash
git add src/themes/tokens.ts
git commit -m "fix(a11y): split input border from decorative border (WCAG 1.4.11)"
```

---

### Task 5: Preset adjustments — clear any residual failures

After Tasks 3, 4, and 4b, the engine alone is expected to produce a clean audit. (Verified during plan authoring by mirroring the upgraded engine in `scripts/audit-a11y.mjs` and running it against the unmodified `registry.json`: all 8 cards pass.) This task exists to catch edge cases the engine can't reach — e.g., a preset whose `chromaBoost` is high enough that the brand stays out of gamut after the tune, or a `semanticIntensity` that pulls the destructive/info blobs too pale.

If `pnpm audit:a11y` already exits 0 after Task 4b, skip directly to Step 4 (visual smoke test).

These are tuned at the **preset input** level so the look stays intentional.

- [ ] **Step 1: Re-run the audit and capture the residual failures**

Run: `pnpm audit:a11y > /tmp/post-engine.txt`
Inspect: focus on rows still marked FAIL.

- [ ] **Step 2: For each residual failure, adjust the offending preset**

The knobs (in order of preference):

1. **`derivation.chromaBoost`** — drop by 0.05–0.1 if a vivid hue is the culprit.
2. **`derivation.semanticIntensity`** — drop if the failure is a semantic blob.
3. **`inputs.<role>.vibrancy`** — drop to dim the brand color while keeping the hue.
4. **`inputs.<role>.hue`** — last resort; this changes the brand identity.

Edit `src/themes/registry.json` per failure. Re-run `pnpm audit:a11y` after each change.

**Worked example — Editorial light, `accent / bg = 4.16`:**

```json
// src/themes/registry.json — editorial preset
"accent": { "hue": 25, "vibrancy": 78, "anchor": "free" }
// becomes:
"accent": { "hue": 25, "vibrancy": 70, "anchor": "free" }
```

Re-run; if ratio crosses 4.5, move on. If not, drop another 4 points or shift hue 5° away from yellow.

**Worked example — Cyber light, primary too pale even after engine pull:**

After Task 4, Cyber's primary L will be pulled darker until contrast ≥ 4.5. If the resulting cyan looks washed out, the preset's identity is compromised. Two options:

A. **Accept the engine-tuned tone.** Cyber's character lives in dark mode; light is a fallback.
B. **Add a per-mode preset override** in `registry.json`:
```json
"cyber": {
  // ...existing fields...
  "overrides": {
    "light": {
      "primary": "oklch(0.55 0.16 190)",
      "ring":    "oklch(0.55 0.16 190)"
    }
  }
}
```

The `overrides` field is already supported (`ControllerTheme.overrides.light/dark`). Use it when the engine's safe tone doesn't match the brand intent.

- [ ] **Step 3: Iterate until the audit is clean**

Loop: `pnpm audit:a11y` → adjust → re-run. Stop when every preset × mode reports 0 failures.

- [ ] **Step 4: Visual smoke test**

Run: `pnpm dev`
Visit `/sandbox` for each preset (`~` → theme switcher). Confirm primary buttons still look like the intended preset. Specifically:
- Cyber light: primary cyan is darker than before; still recognizable as cyan.
- Bold light: purple primary slightly muted.
- Editorial dark: muted-orange primary nudged lighter.

If any preset looks broken, either roll back the engine pull for that preset via `overrides.light/dark` (worked example above) or accept the slight visual drift as the cost of WCAG compliance.

- [ ] **Step 5: Commit (only if you made changes)**

```bash
git add src/themes/registry.json
git commit -m "fix(a11y): tune presets to clear moderate baseline"
```

If the audit was already clean after Task 4b and no preset changes were needed, skip this commit.

---

### Task 6: Accessibility overview page — scaffolding

**Files:**
- Create: `src/app/(marketing)/accessibility/page.tsx`
- Create: `src/app/(marketing)/accessibility/_components/theme-preview-card.tsx`
- Create: `src/app/(marketing)/accessibility/_components/audit-matrix.tsx`
- Create: `src/app/(marketing)/accessibility/_components/sample-strip.tsx`
- Create: `src/app/(marketing)/accessibility/_components/grade-badge.tsx`

The page is a **server component** — it pulls the registry, runs the audit per preset × mode, and emits one document containing every result. Light + dark coexist by scoping CSS variables + the `.dark` class to per-card divs.

- [ ] **Step 1: The page shell**

```tsx
// src/app/(marketing)/accessibility/page.tsx
import Link from "next/link"

import { auditAllPresets } from "@/themes/a11y"
import { baseThemes } from "@/themes/registry"

import { AuditMatrix } from "./_components/audit-matrix"
import { GradeBadge } from "./_components/grade-badge"
import { SampleStrip } from "./_components/sample-strip"
import { ThemePreviewCard } from "./_components/theme-preview-card"

export const metadata = {
  title: "Accessibility · Lookbook",
  description:
    "WCAG 2.2 contrast audit for every built-in theme, in both light and dark modes.",
}

export default function AccessibilityPage() {
  const results = auditAllPresets(baseThemes)
  const totalFailures = results.reduce(
    (n, r) => n + r.failures.length,
    0
  )

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          /accessibility
        </p>
        <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Contrast audit
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground">
          WCAG 2.2 contrast ratios for every built-in theme, both light and
          dark. Pairs are categorized as body text (≥ 4.5 to pass AA), UI
          affordances (≥ 3.0 per 1.4.11), or decorative (exempt). Anything
          below the moderate baseline shows up in red.
        </p>
        <div className="flex flex-wrap items-baseline gap-3 pt-2 text-sm">
          <span className="font-mono text-muted-foreground">
            {results.length} cards · {totalFailures} failure
            {totalFailures === 1 ? "" : "s"}
          </span>
          {totalFailures === 0 && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-xs text-emerald-600 dark:text-emerald-400">
              all defaults pass
            </span>
          )}
        </div>
      </header>

      {/* Threshold legend */}
      <section className="flex flex-wrap gap-3">
        <GradeBadge grade="AAA" />
        <GradeBadge grade="AA" />
        <GradeBadge grade="AA-Large" />
        <GradeBadge grade="Fail" />
        <GradeBadge grade="Exempt" />
      </section>

      {/* Per-preset matrix: light card next to dark card */}
      <div className="flex flex-col gap-12">
        {baseThemes.map((theme) => {
          const light = results.find(
            (r) => r.themeId === theme.id && r.mode === "light"
          )!
          const dark = results.find(
            (r) => r.themeId === theme.id && r.mode === "dark"
          )!
          return (
            <section
              key={theme.id}
              id={`preset-${theme.id}`}
              className="scroll-mt-12 flex flex-col gap-4"
            >
              <header className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    {theme.name}
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground">
                    {theme.id}
                  </span>
                </div>
                {(light.failures.length > 0 || dark.failures.length > 0) && (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-mono text-xs text-red-600 dark:text-red-400">
                    {light.failures.length + dark.failures.length} failing
                  </span>
                )}
              </header>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ThemePreviewCard
                  theme={theme}
                  mode="light"
                  result={light}
                  anchorId={`preset-${theme.id}-light`}
                >
                  <SampleStrip />
                  <AuditMatrix result={light} />
                </ThemePreviewCard>
                <ThemePreviewCard
                  theme={theme}
                  mode="dark"
                  result={dark}
                  anchorId={`preset-${theme.id}-dark`}
                >
                  <SampleStrip />
                  <AuditMatrix result={dark} />
                </ThemePreviewCard>
              </div>
            </section>
          )
        })}
      </div>

      <footer className="flex flex-col gap-2 pt-8 text-sm text-muted-foreground">
        <p>
          Methodology: WCAG 2.x relative-luminance contrast computed against
          OKLCH values produced by the runtime derivation pipeline. See{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">
            src/themes/a11y.ts
          </code>{" "}
          for the pair catalog.
        </p>
        <p>
          Open the dev panel (<kbd className="rounded border border-border bg-muted px-1 font-mono">~</kbd>)
          to live-edit a theme; the indicator at the top of the Themes tab
          mirrors this page for the current selection.
        </p>
        <Link
          className="text-foreground underline-offset-4 hover:underline"
          href="/sandbox"
        >
          See the active theme on real components →
        </Link>
      </footer>
    </main>
  )
}
```

- [ ] **Step 2: The themed preview card (scopes light/dark to a subtree)**

```tsx
// src/app/(marketing)/accessibility/_components/theme-preview-card.tsx
import type { CSSProperties } from "react"

import { deriveShadows } from "@/themes/derive"
import { resolveTokens, tokensToCssVars } from "@/themes/registry"
import type { ControllerTheme } from "@/themes/controller-types"
import type { Mode } from "@/themes/tokens"
import type { AuditResult } from "@/themes/a11y"

import { cn } from "@/lib/utils"

export function ThemePreviewCard({
  theme,
  mode,
  result,
  anchorId,
  children,
}: {
  theme: ControllerTheme
  mode: Mode
  result: AuditResult
  anchorId: string
  children: React.ReactNode
}) {
  const tokens = resolveTokens(theme, mode)
  const shadows = deriveShadows(mode, theme)
  const varsRecord = tokensToCssVars(tokens, shadows, theme)
  const style = varsRecord as unknown as CSSProperties

  return (
    <article
      id={anchorId}
      style={style}
      className={cn(
        // The `.dark` class enables Tailwind's `dark:` variants
        // for descendants when needed.
        mode === "dark" && "dark",
        "scroll-mt-12 flex flex-col gap-3 rounded-lg border border-border bg-background p-4 text-foreground"
      )}
    >
      <header className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          {mode}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px]",
            result.failures.length === 0
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/15 text-red-600 dark:text-red-400"
          )}
        >
          {result.failures.length === 0
            ? "pass"
            : `${result.failures.length} fail`}
        </span>
      </header>
      {children}
    </article>
  )
}
```

- [ ] **Step 3: The sample strip (size variants — proves the eye matches the math)**

```tsx
// src/app/(marketing)/accessibility/_components/sample-strip.tsx
export function SampleStrip() {
  return (
    <div className="flex flex-col gap-3">
      {/* Display + body */}
      <div className="flex flex-col gap-1.5">
        <p className="font-heading text-3xl font-semibold tracking-tight">
          The quick brown fox.
        </p>
        <p className="text-sm text-foreground">
          The quick brown fox jumps over the lazy dog. Pack my box with five
          dozen liquor jugs.
        </p>
        <p className="text-xs text-muted-foreground">
          Muted: how vexingly quick daft zebras jump.
        </p>
      </div>

      {/* Filled affordances */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Primary
        </span>
        <span className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">
          Secondary
        </span>
        <span className="rounded-md bg-accent px-3 py-1.5 text-sm text-accent-foreground">
          Accent
        </span>
        <span className="rounded-md bg-brand-accent px-3 py-1.5 text-sm text-brand-accent-foreground">
          Brand
        </span>
        <span className="rounded-md bg-destructive px-3 py-1.5 text-sm text-background">
          Destructive
        </span>
      </div>

      {/* Inputs + semantic */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex h-8 items-center rounded-md border border-input bg-background px-2 text-xs text-muted-foreground">
          input border
        </span>
        <span className="inline-flex h-8 items-center rounded-md ring-2 ring-ring px-2 text-xs">
          focus ring
        </span>
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-success" />
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-warning" />
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-info" />
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-destructive" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: The audit matrix (table of pairs × ratio × grade)**

```tsx
// src/app/(marketing)/accessibility/_components/audit-matrix.tsx
import { cn } from "@/lib/utils"
import type { AuditResult, PairResult } from "@/themes/a11y"

import { GradeBadge } from "./grade-badge"

export function AuditMatrix({ result }: { result: AuditResult }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-card/30 font-mono text-[11px]">
      {result.pairs.map((p) => (
        <PairRow key={p.pair.id} pr={p} />
      ))}
    </div>
  )
}

function PairRow({ pr }: { pr: PairResult }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-1.5",
        pr.fails && "bg-red-500/5"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm border border-foreground/10"
          style={{ background: pr.bgCss }}
        />
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm border border-foreground/10"
          style={{ background: pr.fgCss }}
        />
        <span className="truncate">{pr.pair.label}</span>
      </div>
      <span className="tabular text-foreground/80">
        {pr.ratio.toFixed(2)}:1
      </span>
      <GradeBadge grade={pr.grade} />
    </div>
  )
}
```

- [ ] **Step 5: The grade badge**

```tsx
// src/app/(marketing)/accessibility/_components/grade-badge.tsx
import { cn } from "@/lib/utils"
import type { Grade } from "@/lib/contrast"

const STYLES: Record<Grade, string> = {
  AAA:       "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  AA:        "bg-foreground/10 text-foreground/80",
  "AA-Large":"bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Fail:      "bg-red-500/15 text-red-700 dark:text-red-300",
  Exempt:    "bg-muted text-muted-foreground",
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[10px]",
        STYLES[grade]
      )}
    >
      {grade}
    </span>
  )
}
```

- [ ] **Step 6: Register the route in `devRoutes`**

```ts
// src/lib/routes.ts (add to devRoutes array)
{
  path: "/accessibility",
  label: "Accessibility",
  group: "reference",
  description:
    "WCAG 2.2 contrast audit for every theme × mode, on one page.",
},
```

- [ ] **Step 7: Visual verification**

Run: `pnpm dev`
Visit: `http://localhost:3000/accessibility`
Expected:
- Page renders four sections (Editorial, SaaS, Bold, Cyber).
- Each section has two cards side-by-side: light (white bg) and dark (near-black bg).
- After Tasks 3–5, the "X failing" badge is absent on every card.
- The pair tables show 24 rows each.
- The sample strip text is legible on both light and dark cards.
- The TOC at top shows "all defaults pass".

- [ ] **Step 8: Commit**

```bash
git add src/app/\(marketing\)/accessibility src/lib/routes.ts
git commit -m "feat(a11y): add /accessibility overview page"
```

---

### Task 7: Dev-panel live accessibility indicator

**Files:**
- Create: `src/components/dev-panel/a11y-indicator.tsx`
- Modify: `src/components/dev-panel/tabs/themes-tab.tsx` (mount the indicator)

The indicator:
- Renders inside the Themes tab, just below the theme switcher (a stable spot, visible regardless of which preset is active).
- Computes `auditTheme(theme, resolvedMode)` on every theme/mode change.
- Default visual: small neutral chip with "A11y ✓" + worst-case ratio.
- Below moderate baseline: chip flips amber + shows failure count; clicking opens the `/accessibility` page deep-linked to the current preset+mode anchor in a new tab.
- A small expandable list shows the failing pair ids inline (no router needed for that part).

- [ ] **Step 1: Build the indicator**

```tsx
// src/components/dev-panel/a11y-indicator.tsx
"use client"

import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/theme-provider"
import { auditTheme } from "@/themes/a11y"

export function A11yIndicator() {
  const { theme, resolvedMode } = useTheme()
  const [open, setOpen] = useState(false)

  const result = useMemo(
    () => auditTheme(theme, resolvedMode),
    [theme, resolvedMode]
  )

  const failing = result.failures.length > 0
  const anchor = `/accessibility#preset-${theme.id}-${resolvedMode}`

  return (
    <section className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px]",
          failing
            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "border-border bg-muted/40 text-muted-foreground"
        )}
      >
        {failing ? (
          <AlertTriangle className="size-3.5" aria-hidden />
        ) : (
          <CheckCircle2
            className="size-3.5 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        )}
        <span className="flex-1 truncate">
          {failing
            ? `${result.failures.length} a11y issue${result.failures.length === 1 ? "" : "s"} · worst ${result.worstRatio.toFixed(2)}:1`
            : `A11y passes · worst ${result.worstRatio.toFixed(2)}:1`}
        </span>
        <a
          href={anchor}
          target="_blank"
          rel="noreferrer"
          aria-label="Open accessibility overview for this theme"
          className={cn(
            "inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[10px] underline-offset-4 transition-colors cursor-pointer hover:bg-foreground/5",
            failing && "text-amber-800 dark:text-amber-200"
          )}
        >
          overview
          <ExternalLink className="size-3" />
        </a>
        {failing && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded px-1 py-0.5 font-mono text-[10px] transition-colors cursor-pointer hover:bg-foreground/5"
            aria-expanded={open}
            aria-controls="a11y-indicator-details"
          >
            {open ? "hide" : "details"}
          </button>
        )}
      </div>
      {failing && open && (
        <ul
          id="a11y-indicator-details"
          className="flex flex-col gap-1 rounded-md border border-border bg-muted/20 p-2 font-mono text-[10px] text-muted-foreground"
        >
          {result.pairs
            .filter((p) => p.fails)
            .map((p) => (
              <li key={p.pair.id} className="flex items-center justify-between">
                <span className="truncate">{p.pair.label}</span>
                <span className="tabular shrink-0 pl-2 text-amber-700 dark:text-amber-300">
                  {p.ratio.toFixed(2)}:1
                </span>
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Mount the indicator in the Themes tab**

```tsx
// src/components/dev-panel/tabs/themes-tab.tsx
// Add import:
import { A11yIndicator } from "../a11y-indicator"

// Inside the returned JSX, insert AFTER the theme switcher Section
// (around line 154, before the `<Separator />` that precedes PRESETS),
// or at the very top of the column so it's always visible:
//
// <A11yIndicator />
// <Separator />
//
// Choose: very top is best — it's always visible regardless of which
// controls the user is editing.
```

The indicator should be at the **top** of the Themes tab so it's never scrolled out of view. Place it as the first child of the outer flex container, immediately above the theme switcher Section.

- [ ] **Step 3: Verify the indicator updates live**

Run: `pnpm dev`
Open the dev panel (`~`).
- With all defaults passing: chip is neutral with "A11y passes · worst N.NN:1".
- Drag the Primary vibrancy slider to 0 (gray): expect chip to flip amber because brand-on-bg will fail.
- Click "overview" — opens `/accessibility#preset-saas-light` in a new tab; the page scrolls to the SaaS light card.
- Click "details" — expands the inline failure list.

- [ ] **Step 4: Verify the indicator works across all theme configurations**

For each preset (Editorial / SaaS / Bold / Cyber):
- Switch to it from the theme switcher; confirm the indicator updates within ~1 render.
- Tune one control to break a11y on purpose (e.g., set Primary vibrancy to 5 on Cyber light); confirm the chip turns amber and the failing pair is named in details.
- Click reset; confirm the chip returns to passing.

For mode switching:
- Toggle Light → Dark → System; confirm the indicator updates and the overview link's anchor matches the new resolvedMode.

- [ ] **Step 5: Commit**

```bash
git add src/components/dev-panel/a11y-indicator.tsx src/components/dev-panel/tabs/themes-tab.tsx
git commit -m "feat(a11y): live indicator in dev panel + deep link to overview"
```

---

### Task 8: Documentation + final verification

**Files:**
- Modify: `src/themes/README.md` (likely created by the hardening spec Phase 1; if not yet present, create it)
- Modify: `docs/UI_POLISH.md` (add a one-paragraph "Accessibility" section pointing at `/accessibility`)
- Optionally create: `docs/adr/0019-theme-accessibility.md` (one-page ADR documenting the threshold model + the brand-tune-for-mode decision)

- [ ] **Step 1: Document the audit module and pair catalog**

If `src/themes/README.md` exists, append a section:

```markdown
## Accessibility

Every preset is held to WCAG 2.2 AA on text pairs (≥ 4.5:1) and 1.4.11
on UI components (≥ 3.0:1). Anything below shows up:

- as a red row on `/accessibility` (the overview page),
- as an amber chip at the top of the Themes tab in the dev panel.

The pair catalog lives in `src/themes/a11y.ts`. Adding a new color
token to `src/themes/tokens.ts` is one entry there; if the token is
text-bearing or interactive, also add it to the catalog so it's audited.

Foreground colors for filled surfaces (`primaryForeground`,
`accentForeground`, etc.) are picked by **measured contrast** in
`foregroundFor(bg)` — there is no L threshold. Brand colors (`primary`,
`accent`) are tone-adjusted per mode via `tuneBrandForMode` so they
clear AA against the mode's background.

`pnpm audit:a11y` runs the audit from the command line; it exits
non-zero on any failure and is wired into CI when the hardening spec's
CI workflow lands.
```

- [ ] **Step 2: Wire the audit into CI (lightweight)**

If `.github/workflows/ci.yml` exists (from the hardening spec), insert `pnpm audit:a11y` between `pnpm check` and `pnpm build`:

```yaml
- run: pnpm audit:a11y
```

If CI doesn't exist yet, skip — the hardening spec's Phase 2 will pick it up.

- [ ] **Step 3: Run the full local verify**

```bash
pnpm check          # biome + polish
pnpm exec tsc --noEmit
pnpm audit:a11y     # WCAG floor
pnpm build          # next build
```

All four should exit 0.

- [ ] **Step 4: Manual visual review**

Visit each route in the dev panel's Nav tab and confirm nothing looks regressed by the brand-tone adjustments:
- `/` — marketing home with every block
- `/variants` — gallery
- `/sandbox` — design system reference
- `/dashboard` — shadcn dashboard
- `/login`, `/signup` — auth blocks

For each, switch through Editorial / SaaS / Bold / Cyber in both light and dark. Primary CTAs should still look like the intended brand color, just tonally adjusted.

- [ ] **Step 5: Commit**

```bash
git add src/themes/README.md docs/UI_POLISH.md .github/workflows/ci.yml docs/adr/0019-theme-accessibility.md
git commit -m "docs(a11y): document the contrast audit + thresholds"
```

---

## 5. Out of scope

- **APCA (Accessible Perceptual Contrast Algorithm).** The plan uses WCAG 2.x because it's the current legal standard and what audits ship against. APCA is the future. Adding it later means a parallel grading function in `contrast.ts` and a toggle in the overview UI.
- **Color-blindness simulations.** Useful but a separate axis.
- **Animated motion / `prefers-reduced-motion` audit.** Out of scope — the polish system already handles this (ADR 0011).
- **Component-level audits** (e.g., button focus rings on hover). The pair catalog covers the tokens; component behavior is implicit.
- **Per-page themed OG images** referencing the accessibility status — far out.
- **A CI failure budget** (e.g., "allow 2 AA-Large warnings per preset"). The plan treats the moderate baseline as a hard floor.

## 6. Risks

- **Aesthetic drift.** Tuning Cyber primary into light mode produces a darker cyan than the brand suggests; the same applies (less severely) to Bold yellow accent. Mitigation: per-preset `overrides.light/dark` exist already (`ControllerTheme.overrides`); use them when the engine pull degrades the look beyond acceptance.
- **Drift between the runtime catalog and the audit script.** If the script keeps its own copy of the catalog, it can drift. Mitigation: once Vitest lands (hardening spec Phase 2), lift the script's body into a unit test that imports the runtime catalog directly. Until then, the script asserts an `expectedIds` list against the runtime by string-matching pair ids.
- **Custom-edited themes can drop below the floor.** The dev-panel indicator catches this in development; in production builds the indicator is off (`process.env.NODE_ENV !== "development"` gate in `DevPanel`). This is by design: the audit is a guide, not a runtime enforcer for end users.
- **Per-token overrides bypass the engine.** A preset that sets `overrides.light.primary` skips `tuneBrandForMode`. Mitigation: the audit catches it anyway because the audit reads the *resolved* tokens, which include overrides.
- **Border token rule is asymmetric.** Decorative borders are exempt; input borders aren't. The current tokens collapse both into `--border` + `--input`. If a theme makes `--input` look identical to `--border`, an input loses its boundary. The audit flags this via the `input-bg` pair.
- **Server-rendering vs. live edits.** The `/accessibility` page is server-rendered from the static registry — it shows the *base* presets, not the user's localStorage-edited variants. If we want it to track local edits, the page becomes client-only. For now, document that the page shows base presets; the dev-panel indicator covers user edits.

## 7. Test plan

After Phase 1 (Tasks 1–5):
- `pnpm audit:a11y` exits 0; output shows every preset × mode with 0 failures.
- `pnpm exec tsc --noEmit` is clean.
- Manual: open `/sandbox` for each preset in both modes; nothing reads worse than before.

After Phase 3 (Task 6):
- `/accessibility` route loads.
- Eight cards render: Editorial-light, Editorial-dark, SaaS-light, SaaS-dark, Bold-light, Bold-dark, Cyber-light, Cyber-dark.
- Each card has 24 pair rows.
- Each card's "pass/fail" badge matches the state from `pnpm audit:a11y`.
- View source of the page; confirm the page is server-rendered (no `"use client"`).

After Phase 4 (Task 7):
- Open dev panel on any route. Indicator shows "A11y passes" with worst-case ratio for the default theme (SaaS).
- Drag Primary vibrancy to 0; indicator flips amber, details list contains `primary-link`, `primary-fill`, `ring-bg`.
- Click "overview" link; new tab opens to `/accessibility` and scrolls to `#preset-saas-light` (or whichever mode is resolved).
- Switch to Bold; indicator updates within a render frame.
- Refresh page; indicator state matches the persisted theme.

After Phase 5 (Task 8):
- `pnpm audit:a11y` runs in CI on PR; PR with a regression goes red.

## 8. Done-when

- Every built-in preset in `src/themes/registry.json` passes the moderate baseline in both modes (confirmed by `pnpm audit:a11y`).
- The `/accessibility` page exists and is linked from the dev panel's Nav tab.
- The dev panel's Themes tab shows the live a11y indicator at the top.
- The indicator's "overview" link deep-links to the correct anchor on `/accessibility`.
- `src/themes/README.md` documents the audit module and how to add new pairs.
- `pnpm audit:a11y` is wired into CI (or noted as a Phase-2-hardening-spec dependency if CI isn't built yet).
