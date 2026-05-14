# Theme-Aware Shader System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a 24-shader library (4 themes × 3 styles × idle/interactive), 6 leaning into ASCII, addressable as `<theme>.<style>.<variant>`, demoed on `/examples/shaders` with controls in the existing dev panel.

**Architecture:** Library on top of the `shaders` npm package (WebGPU + WebGL2 fallback). One `<ThemedShader id="..." />` entry point. Theme tokens feed shader colors via `getComputedStyle(<html>)`; per-slot overrides persist in localStorage with schema-version invalidation. The existing Controls tab gets one new option flag on `useDevControls`; the dev-panel provider gets focus state and a mounted-shader registry.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, `shaders@^2.5.124` (new), `leva@^0.10.1` (existing, used by Controls tab), Biome for lint/format. **No test runner** — verification is type-check + dev-server smoke + manual.

**Spec:** [`docs/superpowers/specs/2026-05-14-theme-shader-system-design.md`](../specs/2026-05-14-theme-shader-system-design.md). Read it first; this plan implements it.

---

## File structure

### New files (all under `src/components/shaders/themed/`)

| Path | Responsibility |
|---|---|
| `types.ts` | `ShaderId`, `ColorSlot`, `ShaderDef`, `ThemeColorToken`, `PerfMode`, `Variant`, `StyleOrdinal` |
| `char-sets.ts` | `CHAR_SETS` table — per-shader curated glyph ramps |
| `resolve-colors.ts` | `resolveSlotColors()` + `THEME_SENTINEL` + `defaultsFor()` |
| `registry.ts` | `SHADER_REGISTRY` record + `SHADER_IDS` ordered array, assembled from imported pair files |
| `define-pair.ts` | `definePair()` helper that returns `[idleDef, interactiveDef]` |
| `use-shader-overrides.ts` | localStorage hook keyed by shader ID, schema-version invalidation |
| `use-resolved-colors.ts` | Reads CSS vars; subscribes to theme provider; applies overrides |
| `use-shader-perf-mode.ts` | `full | reduced | fallback` resolution |
| `use-in-view.ts` | IntersectionObserver pause |
| `use-shader-controls.ts` | Wrapper combining `useDevControls(enabled)` + `useShaderOverrides` |
| `fallback.tsx` | `<ShaderFallback>` + `substituteVars()` |
| `themed-shader.tsx` | `<ThemedShader id="..." />` entry point |
| `showcase-tile.tsx` | Click-to-focus tile for the showcase route |
| `editorial/1.veil.tsx` | Editorial Veil pair |
| `editorial/2.letterpress.tsx` | Editorial Letterpress pair (ASCII) |
| `editorial/3.marble.tsx` | Editorial Marble pair |
| `saas/1.mesh.tsx` | SaaS Mesh pair |
| `saas/2.flow.tsx` | SaaS Flow pair |
| `saas/3.glyph-mesh.tsx` | SaaS Glyph Mesh pair (ASCII) |
| `bold/1.aurora.tsx` | Bold Aurora pair |
| `bold/2.ascii-plasma.tsx` | Bold Ascii Plasma pair (ASCII) |
| `bold/3.swirl.tsx` | Bold Swirl pair |
| `cyber/1.ascii-terrain.tsx` | Cyber Ascii Terrain pair (ASCII) |
| `cyber/2.code-rain.tsx` | Cyber Code Rain pair (ASCII) |
| `cyber/3.phosphor-console.tsx` | Cyber Phosphor Console pair (ASCII) |
| `index.ts` | Public exports |

### Modified files

| Path | Change |
|---|---|
| `package.json` | Add `shaders` dependency |
| `src/components/dev-panel/types.ts` | Add `renderIf` + `optionsLabels` to `DevControlSpec`; export `ShaderId` type |
| `src/components/dev-panel/hooks/use-dev-controls.ts` | Add `{ enabled?, values? }` options; honor `renderIf` + `optionsLabels` |
| `src/components/dev-panel/dev-panel-provider.tsx` | Add `focusedShaderId`, `mountedShaders`, `forceReducedMotion`, `cycleFocus`, plus keybind extensions |
| `src/components/dev-panel/tabs/controls-tab.tsx` | Add `<FocusedShaderChip>` header + reset affordances |
| `src/components/dev-panel/tabs/themes-tab.tsx` | Add "Reset all 24 shaders" button alongside existing Clear localStorage |
| `src/components/dev-panel/index.ts` | Re-export new public types |
| `src/app/examples/shaders/page.tsx` | Replace with 24-shader showcase |

### Untouched (back-compat)

- `src/components/shaders/mesh-gradient.tsx`, `grain-gradient.tsx` — existing `@paper-design/shaders-react` wrappers used by hero/CTA blocks. Stay as-is.

---

## Phase 1 — Install dependency + scaffold types

### Task 1.1: Install `shaders` package

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install**

```bash
pnpm add shaders
```

- [ ] **Step 2: Verify install**

```bash
node -e "console.log(require('shaders/package.json').version)"
```

Expected: `2.5.124` or higher.

- [ ] **Step 3: Verify React entry exports the components we need**

```bash
node -e "const r = require('shaders/react'); console.log(Object.keys(r).filter(k => /^(Shader|Ascii|Aurora|Plasma|Marble|FlowingGradient|MultiPointGradient|FallingLines|CRTScreen|CursorRipples|CursorTrail|Liquify|Smoke|Fog|GridDistortion|ChromaFlow|LinearGradient|Voronoi|Paper|FilmGrain|Swirl)$/.test(k)).sort())"
```

Expected: a list including `Shader`, `Ascii`, `Aurora`, `Plasma`, `Marble`, `FlowingGradient`, `MultiPointGradient`, `FallingLines`, `CRTScreen`, `CursorRipples`, `CursorTrail`, `Liquify`, `Smoke`, `Fog`, `GridDistortion`, `ChromaFlow`, `LinearGradient`, `Voronoi`, `Paper`, `FilmGrain`, `Swirl`.

If any are missing, stop and reconcile with the spec before proceeding.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(shaders): add shaders npm package"
```

---

### Task 1.2: Scaffold `themed/types.ts`

**Files:**
- Create: `src/components/shaders/themed/types.ts`

- [ ] **Step 1: Write the types file**

```ts
// src/components/shaders/themed/types.ts
import type { ReactNode } from "react"
import type { DevControlSchema } from "@/components/dev-panel/types"

export type ThemeId = "editorial" | "saas" | "bold" | "cyber"
export type StyleOrdinal = 1 | 2 | 3
export type Variant = "idle" | "interactive"
export type ShaderId = `${ThemeId}.${StyleOrdinal}.${Variant}`

export type ThemeColorToken =
  | "primary"
  | "accent"
  | "brand-accent"
  | "background"
  | "foreground"
  | "muted"
  | "muted-foreground"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "destructive"
  | "success"
  | "warning"
  | "info"

export type ColorSlot =
  | { kind: "theme"; token: ThemeColorToken }
  | { kind: "literal"; value: string }

export type PerfMode = "full" | "reduced" | "fallback"

export type BuildPropsContext = {
  colors: Record<string, string>
  controls: Record<string, unknown>
  perfMode: PerfMode
}

export type BuildPropsFn = (ctx: BuildPropsContext) => unknown
export type RenderFn = (props: unknown) => ReactNode

export type ShaderDef = {
  id: ShaderId
  label: string
  paperName: string
  themeId: ThemeId
  styleOrdinal: StyleOrdinal
  variant: Variant
  isAscii: boolean
  slots: Record<string, ColorSlot>
  schema: DevControlSchema
  schemaVersion: number
  buildProps: BuildPropsFn
  renderTree: RenderFn
  fallbackBackground: string
}

// localStorage shape — written by useShaderOverrides
export const THEME_SENTINEL = "__theme__" as const
export type SlotOverrides = Record<string, string | typeof THEME_SENTINEL>

export type ShaderOverrides = {
  v: number
  controls: Record<string, unknown>
  colorSlots: SlotOverrides
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no new errors. If the existing project already has unrelated errors, only verify ours don't add new ones (filter by `src/components/shaders/themed/types.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/components/shaders/themed/types.ts
git commit -m "feat(shaders): scaffold ShaderId, ColorSlot, ShaderDef types"
```

---

## Phase 2 — Pure helpers (no React)

### Task 2.1: `resolve-colors.ts`

**Files:**
- Create: `src/components/shaders/themed/resolve-colors.ts`

- [ ] **Step 1: Write the resolver**

```ts
// src/components/shaders/themed/resolve-colors.ts
import {
  type ColorSlot,
  type SlotOverrides,
  THEME_SENTINEL,
  type ThemeColorToken,
} from "./types"

// Fallback values used during SSR and when a CSS var hasn't been applied yet.
// Mirrors the editorial light-mode tokens — neutral defaults.
const DEFAULTS: Record<ThemeColorToken, string> = {
  primary: "#1a1a1a",
  accent: "#7c5cff",
  "brand-accent": "#d35400",
  background: "#fafafa",
  foreground: "#181818",
  muted: "#ececec",
  "muted-foreground": "#6e6e6e",
  "chart-1": "#3b82f6",
  "chart-2": "#10b981",
  "chart-3": "#f59e0b",
  "chart-4": "#ef4444",
  "chart-5": "#8b5cf6",
  destructive: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
}

export function defaultsFor(token: ThemeColorToken): string {
  return DEFAULTS[token]
}

export function resolveSlotColors(
  slots: Record<string, ColorSlot>,
  overrides: SlotOverrides | undefined,
  computed: CSSStyleDeclaration | null
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, slot] of Object.entries(slots)) {
    const override = overrides?.[key]
    if (override && override !== THEME_SENTINEL) {
      out[key] = override
      continue
    }
    if (slot.kind === "literal") {
      out[key] = slot.value
      continue
    }
    if (!computed) {
      out[key] = defaultsFor(slot.token)
      continue
    }
    const raw = computed.getPropertyValue(`--${slot.token}`).trim()
    out[key] = raw || defaultsFor(slot.token)
  }
  return out
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shaders/themed/resolve-colors.ts
git commit -m "feat(shaders): add pure color slot resolver"
```

---

### Task 2.2: `char-sets.ts` seed (will fill in as each ASCII shader lands)

**Files:**
- Create: `src/components/shaders/themed/char-sets.ts`

- [ ] **Step 1: Write the seed file**

```ts
// src/components/shaders/themed/char-sets.ts
import type { ShaderId } from "./types"

/**
 * Per-shader curated glyph ramps. Each ASCII shader's preset names map to
 * the actual glyph strings used by the `Ascii` component. Non-ASCII shaders
 * do not appear in this map.
 *
 * Filled in incrementally as each ASCII shader lands (Phase 8). Initial entries
 * are added with the editorial.2 Letterpress shader.
 */
export const CHAR_SETS: Partial<Record<ShaderId, Record<string, string>>> = {}

export function getCharSet(shaderId: ShaderId, preset: string): string {
  const map = CHAR_SETS[shaderId]
  if (!map) return " .:-=+" // safe fallback — any Ascii input renders
  return map[preset] ?? Object.values(map)[0] ?? " .:-=+"
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

Expected: no new errors.

```bash
git add src/components/shaders/themed/char-sets.ts
git commit -m "feat(shaders): scaffold CHAR_SETS table"
```

---

### Task 2.3: Empty registry

**Files:**
- Create: `src/components/shaders/themed/registry.ts`

- [ ] **Step 1: Write the empty registry**

```ts
// src/components/shaders/themed/registry.ts
import type { ShaderDef, ShaderId } from "./types"

/**
 * Populated by importing each pair file and spreading the [idle, interactive]
 * tuples it returns. Filled incrementally — Phase 6 wires the first pair;
 * Phase 8 wires the remaining eleven.
 */
export const SHADER_REGISTRY: Partial<Record<ShaderId, ShaderDef>> = {}

export const SHADER_IDS: readonly ShaderId[] = Object.keys(
  SHADER_REGISTRY
) as ShaderId[]

export function getShaderDef(id: ShaderId): ShaderDef {
  const def = SHADER_REGISTRY[id]
  if (!def) throw new Error(`Unknown shader id: ${id}`)
  return def
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): scaffold empty SHADER_REGISTRY"
```

---

## Phase 3 — Hooks

### Task 3.1: `use-shader-overrides.ts`

**Files:**
- Create: `src/components/shaders/themed/use-shader-overrides.ts`

- [ ] **Step 1: Write the hook**

```ts
// src/components/shaders/themed/use-shader-overrides.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { getShaderDef } from "./registry"
import type { ShaderId, ShaderOverrides } from "./types"

const STORAGE_PREFIX = "lookbook:shader:"

function empty(v: number): ShaderOverrides {
  return { v, controls: {}, colorSlots: {} }
}

function read(key: string, currentVersion: number): ShaderOverrides {
  if (typeof window === "undefined") return empty(currentVersion)
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return empty(currentVersion)
    const parsed = JSON.parse(raw) as ShaderOverrides
    if (parsed.v !== currentVersion) return empty(currentVersion)
    return parsed
  } catch {
    return empty(currentVersion)
  }
}

export function useShaderOverrides(
  shaderId: ShaderId
): [
  ShaderOverrides,
  (patch: Partial<ShaderOverrides>) => void,
  () => void,
] {
  const def = getShaderDef(shaderId)
  const key = `${STORAGE_PREFIX}${shaderId}`

  const [state, setState] = useState<ShaderOverrides>(() =>
    read(key, def.schemaVersion)
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* quota or private mode — silent */
    }
  }, [key, state])

  const patch = useCallback(
    (next: Partial<ShaderOverrides>) =>
      setState((prev) => ({ ...prev, ...next, v: def.schemaVersion })),
    [def.schemaVersion]
  )

  const reset = useCallback(
    () => setState(empty(def.schemaVersion)),
    [def.schemaVersion]
  )

  return [state, patch, reset]
}

/** Imperative reset used by the "Reset all 24 shaders" button in the Themes tab. */
export function clearAllShaderOverrides(ids: readonly ShaderId[]): void {
  if (typeof window === "undefined") return
  for (const id of ids) {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${id}`)
    } catch {
      /* silent */
    }
  }
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shaders/themed/use-shader-overrides.ts
git commit -m "feat(shaders): add useShaderOverrides + clearAllShaderOverrides"
```

---

### Task 3.2: `use-resolved-colors.ts`

**Files:**
- Create: `src/components/shaders/themed/use-resolved-colors.ts`

- [ ] **Step 1: Inspect the existing theme provider to confirm hook surface**

```bash
grep -n "export function useTheme\|isOverridden\|resolvedMode\|themeId" src/providers/theme-provider.tsx | head -20
```

Expected: confirms the provider exports `useTheme()` returning `{ themeId, resolvedMode, isOverridden, ... }` (per the existing `themes-tab.tsx` usage).

- [ ] **Step 2: Write the hook**

```ts
// src/components/shaders/themed/use-resolved-colors.ts
"use client"

import { useMemo } from "react"
import { useTheme } from "@/providers/theme-provider"
import { resolveSlotColors } from "./resolve-colors"
import { useShaderOverrides } from "./use-shader-overrides"
import type { ColorSlot, ShaderId } from "./types"

export function useResolvedColors(
  shaderId: ShaderId,
  slots: Record<string, ColorSlot>
): Record<string, string> {
  const { themeId, resolvedMode, isOverridden } = useTheme()
  const [overrides] = useShaderOverrides(shaderId)

  return useMemo(() => {
    const computed =
      typeof window === "undefined"
        ? null
        : getComputedStyle(document.documentElement)
    return resolveSlotColors(slots, overrides.colorSlots, computed)
    // re-run when theme/mode/overrides change
  }, [slots, overrides.colorSlots, themeId, resolvedMode, isOverridden])
}
```

- [ ] **Step 3: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/use-resolved-colors.ts
git commit -m "feat(shaders): add useResolvedColors hook"
```

---

### Task 3.3: `use-shader-perf-mode.ts`

**Files:**
- Create: `src/components/shaders/themed/use-shader-perf-mode.ts`

- [ ] **Step 1: Check for an existing reduced-motion hook**

```bash
grep -rn "useReducedMotion\|prefers-reduced-motion" src/components/motion src/hooks 2>/dev/null | head -10
```

Expected: find an existing hook (likely `use-should-reduce-macro.ts` or similar in `components/motion`). If a `useReducedMotion()` hook exists, use it. If only a `useShouldReduceMacro()` exists, that's the project's wrapper — use it directly. The `forceReducedMotion` toggle will live in the dev-panel provider (added in Phase 4).

- [ ] **Step 2: Write the hook (using the existing motion hook)**

If the project exports a `useReducedMotion()` from `@/components/motion`:

```ts
// src/components/shaders/themed/use-shader-perf-mode.ts
"use client"

import { useEffect, useState } from "react"
import { useShouldReduceMacro } from "@/components/motion/use-should-reduce-macro"
import { useDevPanel } from "@/components/dev-panel"
import type { PerfMode, Variant } from "./types"

let webgl2Cached: boolean | null = null

function detectWebGL2(): boolean {
  if (webgl2Cached !== null) return webgl2Cached
  if (typeof document === "undefined") return false
  try {
    const c = document.createElement("canvas")
    webgl2Cached = !!c.getContext("webgl2")
  } catch {
    webgl2Cached = false
  }
  return webgl2Cached
}

export function useShaderPerfMode(_variant: Variant): PerfMode {
  const osReduced = useShouldReduceMacro()
  const { forceReducedMotion } = useDevPanel()
  const [hasGL2, setHasGL2] = useState(true) // optimistic; corrected post-mount

  useEffect(() => {
    setHasGL2(detectWebGL2())
  }, [])

  if (!hasGL2) return "fallback"
  if (osReduced || forceReducedMotion) return "reduced"
  return "full"
}
```

If the project uses a different hook name, swap the import accordingly. The variant arg is unused today (kept for future per-variant tuning).

- [ ] **Step 3: Type-check**

```bash
pnpm exec tsc --noEmit
```

Note: this will error on `forceReducedMotion` not being in the dev-panel context yet. That's expected — Phase 4 adds it. Skip the type-check pass on this file until Phase 4 lands; commit nonetheless so the work isn't lost. Or add a temporary `// @ts-expect-error` — your call. **Recommended: commit now, the type-check passes after Phase 4.**

- [ ] **Step 4: Commit**

```bash
git add src/components/shaders/themed/use-shader-perf-mode.ts
git commit -m "feat(shaders): add useShaderPerfMode (depends on Phase 4 panel state)"
```

---

### Task 3.4: `use-in-view.ts`

**Files:**
- Create: `src/components/shaders/themed/use-in-view.ts`

- [ ] **Step 1: Write the hook**

```ts
// src/components/shaders/themed/use-in-view.ts
"use client"

import { type RefObject, useEffect, useState } from "react"

export function useInView(
  ref: RefObject<Element | null>,
  rootMargin = "200px"
): boolean {
  // SSR-safe: assume in-view so server-rendered markup includes the shader subtree.
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, rootMargin])

  return inView
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/use-in-view.ts
git commit -m "feat(shaders): add useInView IntersectionObserver hook"
```

---

## Phase 4 — Dev panel extensions

### Task 4.1: Extend `DevControlSpec` with `renderIf` + `optionsLabels`

**Files:**
- Modify: `src/components/dev-panel/types.ts`

- [ ] **Step 1: Read the existing types**

```bash
cat src/components/dev-panel/types.ts
```

- [ ] **Step 2: Apply the additive extensions**

Edit `src/components/dev-panel/types.ts` — change the `select` variant and add a base `renderIf` field that all variants accept:

```ts
import type { ReactNode } from "react"

type RenderIf = { key: string; equals: string | number | boolean }

export type DevControlSpec =
  | {
      type: "number"
      default: number
      min?: number
      max?: number
      step?: number
      label?: string
      renderIf?: RenderIf
    }
  | { type: "boolean"; default: boolean; label?: string; renderIf?: RenderIf }
  | { type: "string"; default: string; label?: string; renderIf?: RenderIf }
  | { type: "color"; default: string; label?: string; renderIf?: RenderIf }
  | {
      type: "select"
      default: string
      options: readonly string[]
      optionsLabels?: Record<string, string>
      label?: string
      renderIf?: RenderIf
    }
  | {
      type: "vec3"
      default: [number, number, number]
      label?: string
      renderIf?: RenderIf
    }

// ... rest of file unchanged (DevControlSchema, DevControlValues, DevRoute, DevDataEntry)
```

Keep `DevControlValues`, `DevControlSchema`, `DevRoute`, `DevDataPrimitive`, `DevDataValue`, `DevDataGetter`, `DevDataEntry` exactly as they are.

- [ ] **Step 3: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no new errors. Existing usages don't touch `renderIf`/`optionsLabels` so are unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/components/dev-panel/types.ts
git commit -m "feat(dev-panel): add renderIf + optionsLabels to DevControlSpec"
```

---

### Task 4.2: Extend `useDevControls` with `{ enabled, values }` + honor `renderIf`/`optionsLabels`

**Files:**
- Modify: `src/components/dev-panel/hooks/use-dev-controls.ts`

- [ ] **Step 1: Read existing implementation**

```bash
cat src/components/dev-panel/hooks/use-dev-controls.ts
```

- [ ] **Step 2: Rewrite with the new options object**

```ts
// src/components/dev-panel/hooks/use-dev-controls.ts
"use client"

import { folder, useControls } from "leva"
import { useMemo } from "react"

import type {
  DevControlSchema,
  DevControlSpec,
  DevControlValues,
} from "../types"

type LevaInput = Record<string, unknown>

type UseDevControlsOptions = {
  /** When false, the folder is not registered with Leva; the hook still
   *  returns merged defaults+values so the caller can render correctly. */
  enabled?: boolean
  /** Pre-populated values to merge over schema defaults when disabled,
   *  or to seed Leva's inputs when enabled. */
  values?: Record<string, unknown>
}

function specToLevaInput(
  spec: DevControlSpec,
  seedValue: unknown
): LevaInput {
  const value = seedValue ?? spec.default
  const renderProp = spec.renderIf
    ? {
        render: (get: (key: string) => unknown) =>
          get(spec.renderIf!.key) === spec.renderIf!.equals,
      }
    : {}

  switch (spec.type) {
    case "number":
      return {
        value,
        min: spec.min,
        max: spec.max,
        step: spec.step,
        label: spec.label,
        ...renderProp,
      }
    case "boolean":
    case "string":
    case "color":
      return { value, label: spec.label, ...renderProp }
    case "select": {
      // Leva expects { options: { displayLabel: value, ... } } or [value, ...].
      // If optionsLabels is provided, build the displayLabel → value object form.
      if (spec.optionsLabels) {
        const opts: Record<string, string> = {}
        for (const v of spec.options) {
          opts[spec.optionsLabels[v] ?? v] = v
        }
        return { value, options: opts, label: spec.label, ...renderProp }
      }
      return {
        value,
        options: [...spec.options],
        label: spec.label,
        ...renderProp,
      }
    }
    case "vec3": {
      const v = value as [number, number, number] | { x: number; y: number; z: number }
      const seed = Array.isArray(v) ? { x: v[0], y: v[1], z: v[2] } : v
      return { value: seed, label: spec.label, ...renderProp }
    }
  }
}

function defaultFor(spec: DevControlSpec): unknown {
  return spec.type === "vec3" ? [...spec.default] : spec.default
}

function mergeDefaults<S extends DevControlSchema>(
  schema: S,
  values: Record<string, unknown>
): DevControlValues<S> {
  const out: Record<string, unknown> = {}
  for (const [key, spec] of Object.entries(schema)) {
    const v = values[key]
    if (v === undefined) {
      out[key] = defaultFor(spec)
      continue
    }
    if (spec.type === "vec3") {
      if (Array.isArray(v) && v.length === 3) out[key] = v
      else if (v && typeof v === "object" && "x" in v && "y" in v && "z" in v) {
        const o = v as { x: number; y: number; z: number }
        out[key] = [o.x, o.y, o.z]
      } else out[key] = defaultFor(spec)
    } else {
      out[key] = v
    }
  }
  return out as DevControlValues<S>
}

export function useDevControls<S extends DevControlSchema>(
  group: string,
  schema: S,
  options?: UseDevControlsOptions
): DevControlValues<S> {
  const enabled = options?.enabled ?? true
  const externalValues = options?.values

  const folderSchema = useMemo(() => {
    if (!enabled) return null
    const inner: Record<string, LevaInput> = {}
    for (const [key, spec] of Object.entries(schema)) {
      inner[key] = specToLevaInput(spec, externalValues?.[key])
    }
    return { [group]: folder(inner as never) } as Record<string, unknown>
    // Re-register when schema or seed values shape changes.
  }, [enabled, group, schema, externalValues])

  // useControls is conditional — pass an empty object when disabled.
  const levaValues = useControls(
    (folderSchema ?? {}) as never
  ) as Record<string, unknown>

  return useMemo(() => {
    if (!enabled) {
      return mergeDefaults(schema, externalValues ?? {})
    }
    // Normalize vec3 values back to tuples.
    const normalized: Record<string, unknown> = {}
    for (const [key, spec] of Object.entries(schema)) {
      const raw = levaValues[key]
      if (spec.type === "vec3") {
        if (raw && typeof raw === "object" && "x" in raw && "y" in raw && "z" in raw) {
          const v = raw as { x: number; y: number; z: number }
          normalized[key] = [v.x, v.y, v.z]
        } else if (Array.isArray(raw) && raw.length === 3) {
          normalized[key] = raw
        } else {
          normalized[key] = defaultFor(spec)
        }
      } else {
        normalized[key] = raw ?? defaultFor(spec)
      }
    }
    return normalized as DevControlValues<S>
  }, [enabled, externalValues, schema, levaValues])
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no new errors. Existing callers (`useDevControls(group, schema)`) keep working since `options` is undefined.

- [ ] **Step 4: Smoke-test the existing Controls tab still works**

```bash
pnpm dev
```

Open `http://localhost:3000`, press `~` to open the dev panel, switch to Controls tab. Without any shaders mounted, the empty-state message should still render. No errors in the console.

- [ ] **Step 5: Commit**

```bash
git add src/components/dev-panel/hooks/use-dev-controls.ts
git commit -m "feat(dev-panel): useDevControls accepts {enabled, values}, renderIf/optionsLabels"
```

---

### Task 4.3: Extend `DevPanelProvider` — focus state, mounted shaders, force reduced motion

**Files:**
- Modify: `src/components/dev-panel/dev-panel-provider.tsx`

- [ ] **Step 1: Add new fields to context and provider**

Append to the existing context type and rewrite the provider:

```tsx
// src/components/dev-panel/dev-panel-provider.tsx
"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { DevDataEntry } from "./types"
import type { ShaderId } from "@/components/shaders/themed/types"

type DevPanelContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
  dataProbes: ReadonlyMap<string, DevDataEntry>
  registerData: (id: string, entry: DevDataEntry) => void
  unregisterData: (id: string) => void

  // NEW
  focusedShaderId: ShaderId | null
  setFocusedShaderId: (id: ShaderId | null) => void
  cycleFocus: (dir: 1 | -1) => void
  forceReducedMotion: boolean
  setForceReducedMotion: (v: boolean) => void
  mountedShaders: ReadonlySet<ShaderId>
  registerMountedShader: (id: ShaderId) => void
  unregisterMountedShader: (id: ShaderId) => void
}

const Ctx = createContext<DevPanelContextValue | null>(null)

export function DevPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("themes")
  const [dataProbes, setDataProbes] = useState<Map<string, DevDataEntry>>(
    () => new Map()
  )
  const [focusedShaderId, setFocusedShaderId] = useState<ShaderId | null>(null)
  const [forceReducedMotion, setForceReducedMotion] = useState(false)
  const [mountedShaders, setMountedShaders] = useState<Set<ShaderId>>(
    () => new Set()
  )

  const toggle = useCallback(() => setOpen((o) => !o), [])

  const registerData = useCallback((id: string, entry: DevDataEntry) => {
    setDataProbes((prev) => {
      const next = new Map(prev)
      next.set(id, entry)
      return next
    })
  }, [])

  const unregisterData = useCallback((id: string) => {
    setDataProbes((prev) => {
      if (!prev.has(id)) return prev
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const registerMountedShader = useCallback((id: ShaderId) => {
    setMountedShaders((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const unregisterMountedShader = useCallback((id: ShaderId) => {
    setMountedShaders((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const cycleFocus = useCallback(
    (dir: 1 | -1) => {
      setFocusedShaderId((current) => {
        const ids = Array.from(mountedShaders).sort()
        if (ids.length === 0) return null
        const idx = current === null ? -1 : ids.indexOf(current)
        const nextIdx = idx + dir
        if (nextIdx < 0 || nextIdx >= ids.length) return null
        return ids[nextIdx]
      })
    },
    [mountedShaders]
  )

  useEffect(() => {
    function isModifierComboFor(e: KeyboardEvent, base: "[" | "]"): boolean {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac")
      const mod = isMac ? e.metaKey : e.ctrlKey
      return mod && e.key === base
    }

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const inEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      // ~ / backtick toggles
      const isTilde = (e.key === "~" || e.key === "`") && !e.metaKey && !e.ctrlKey && !e.altKey
      if (isTilde && !inEditable) {
        e.preventDefault()
        toggle()
        return
      }

      // Esc — close OR clear focus
      if (e.key === "Escape" && open) {
        if (focusedShaderId !== null) {
          setFocusedShaderId(null)
        } else {
          setOpen(false)
        }
        return
      }

      // Cmd+] / Cmd+[ (macOS) or Ctrl+] / Ctrl+[ (others) — cycle focus
      if (open) {
        if (isModifierComboFor(e, "]")) {
          e.preventDefault()
          cycleFocus(1)
        } else if (isModifierComboFor(e, "[")) {
          e.preventDefault()
          cycleFocus(-1)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggle, open, focusedShaderId, cycleFocus])

  const value = useMemo<DevPanelContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      activeTab,
      setActiveTab,
      dataProbes,
      registerData,
      unregisterData,
      focusedShaderId,
      setFocusedShaderId,
      cycleFocus,
      forceReducedMotion,
      setForceReducedMotion,
      mountedShaders,
      registerMountedShader,
      unregisterMountedShader,
    }),
    [
      open,
      toggle,
      activeTab,
      dataProbes,
      registerData,
      unregisterData,
      focusedShaderId,
      cycleFocus,
      forceReducedMotion,
      mountedShaders,
      registerMountedShader,
      unregisterMountedShader,
    ]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDevPanel() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error("useDevPanel must be used inside <DevPanelProvider>")
  }
  return ctx
}

export function useMountedShaderCount(): number {
  return useDevPanel().mountedShaders.size
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: now the `use-shader-perf-mode.ts` from Task 3.3 type-checks too.

- [ ] **Step 3: Smoke test**

```bash
pnpm dev
```

Open the site, press `~` — panel opens. Press `~` again — closes. Press `Esc` while open — closes. No regressions.

- [ ] **Step 4: Commit**

```bash
git add src/components/dev-panel/dev-panel-provider.tsx
git commit -m "feat(dev-panel): add focus state, mounted shaders, force-reduced-motion"
```

---

### Task 4.4: `use-shader-controls.ts` wrapper

**Files:**
- Create: `src/components/shaders/themed/use-shader-controls.ts`

- [ ] **Step 1: Write the wrapper**

```ts
// src/components/shaders/themed/use-shader-controls.ts
"use client"

import { useEffect } from "react"
import { useDevControls } from "@/components/dev-panel/hooks/use-dev-controls"
import type { DevControlSchema, DevControlValues } from "@/components/dev-panel/types"
import { getShaderDef } from "./registry"
import { useShaderOverrides } from "./use-shader-overrides"
import type { ShaderId } from "./types"

export function useShaderControls<S extends DevControlSchema>(
  shaderId: ShaderId,
  schema: S,
  isActive: boolean
): DevControlValues<S> {
  const [overrides, patch] = useShaderOverrides(shaderId)
  const def = getShaderDef(shaderId)

  const values = useDevControls(`Shader · ${def.label}`, schema, {
    enabled: isActive,
    values: overrides.controls,
  })

  useEffect(() => {
    if (!isActive) return
    patch({ controls: values })
    // intentionally exhaustive: write back any change while active
  }, [isActive, values, patch])

  return values
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/use-shader-controls.ts
git commit -m "feat(shaders): add useShaderControls wrapper"
```

---

## Phase 5 — Themed shader + fallback

### Task 5.1: `fallback.tsx`

**Files:**
- Create: `src/components/shaders/themed/fallback.tsx`

- [ ] **Step 1: Write the fallback component**

```tsx
// src/components/shaders/themed/fallback.tsx
"use client"

import { useMemo } from "react"
import type { ShaderDef } from "./types"

export function substituteVars(
  template: string,
  colors: Record<string, string>
): string {
  return template.replace(/\{\{([a-e])\}\}/g, (_, key: string) => {
    return colors[key] ?? "transparent"
  })
}

export function ShaderFallback({
  def,
  colors,
}: {
  def: ShaderDef
  colors: Record<string, string>
}) {
  const css = useMemo(
    () => substituteVars(def.fallbackBackground, colors),
    [def.fallbackBackground, colors]
  )
  return (
    <div aria-hidden className="absolute inset-0" style={{ background: css }} />
  )
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/fallback.tsx
git commit -m "feat(shaders): add ShaderFallback + substituteVars"
```

---

### Task 5.2: `themed-shader.tsx`

**Files:**
- Create: `src/components/shaders/themed/themed-shader.tsx`

- [ ] **Step 1: Write the entry point**

```tsx
// src/components/shaders/themed/themed-shader.tsx
"use client"

import { type CSSProperties, useEffect, useMemo, useRef } from "react"
import { Shader } from "shaders/react"

import { useDevPanel } from "@/components/dev-panel"
import { cn } from "@/lib/utils"

import { ShaderFallback } from "./fallback"
import { getShaderDef } from "./registry"
import { useInView } from "./use-in-view"
import { useResolvedColors } from "./use-resolved-colors"
import { useShaderControls } from "./use-shader-controls"
import { useShaderPerfMode } from "./use-shader-perf-mode"
import type { ShaderId } from "./types"

export function ThemedShader({
  id,
  className,
  style,
}: {
  id: ShaderId
  className?: string
  style?: CSSProperties
}) {
  const def = getShaderDef(id)
  const ref = useRef<HTMLDivElement>(null)
  const colors = useResolvedColors(id, def.slots)
  const inView = useInView(ref, "200px")
  const perfMode = useShaderPerfMode(def.variant)
  const { focusedShaderId, registerMountedShader, unregisterMountedShader } =
    useDevPanel()
  // "Active in dev panel" = either nothing is focused (show all folders) or this shader is.
  const isActive = focusedShaderId === null || focusedShaderId === id
  const controls = useShaderControls(id, def.schema, isActive)

  useEffect(() => {
    registerMountedShader(id)
    return () => unregisterMountedShader(id)
  }, [id, registerMountedShader, unregisterMountedShader])

  const props = useMemo(
    () => def.buildProps({ colors, controls, perfMode }),
    [def, colors, controls, perfMode]
  )

  return (
    <div
      ref={ref}
      data-shader-id={id}
      className={cn("relative", className)}
      style={style}
    >
      {perfMode === "fallback" ? (
        <ShaderFallback def={def} colors={colors} />
      ) : inView ? (
        <Shader className="absolute inset-0">{def.renderTree(props)}</Shader>
      ) : null /* paused: off-screen */}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: clean, with all hooks in place.

- [ ] **Step 3: Commit**

```bash
git add src/components/shaders/themed/themed-shader.tsx
git commit -m "feat(shaders): add <ThemedShader> entry point"
```

---

## Phase 6 — First end-to-end shader: `editorial.1` Veil

### Task 6.1: `define-pair.ts` helper

**Files:**
- Create: `src/components/shaders/themed/define-pair.ts`

- [ ] **Step 1: Write the helper**

```ts
// src/components/shaders/themed/define-pair.ts
import type { DevControlSchema } from "@/components/dev-panel/types"
import type {
  BuildPropsFn,
  ColorSlot,
  RenderFn,
  ShaderDef,
  ShaderId,
  StyleOrdinal,
  ThemeId,
} from "./types"

type DefinePairSpec = {
  baseId: `${ThemeId}.${StyleOrdinal}`
  label: string
  paperName: string
  isAscii: boolean
  slots: Record<string, ColorSlot>
  idleExtraSlots?: Record<string, ColorSlot>
  interactiveExtraSlots?: Record<string, ColorSlot>
  baseSchema: DevControlSchema
  interactiveSchema: DevControlSchema
  schemaVersion: number
  buildIdle: BuildPropsFn
  renderIdle: RenderFn
  buildInteractive: BuildPropsFn
  renderInteractive: RenderFn
  fallbackBackground: string
}

export function definePair(spec: DefinePairSpec): [ShaderDef, ShaderDef] {
  const [theme, ordinal] = spec.baseId.split(".") as [ThemeId, string]
  const styleOrdinal = Number(ordinal) as StyleOrdinal

  const idle: ShaderDef = {
    id: `${spec.baseId}.idle` as ShaderId,
    label: `${spec.label} · idle`,
    paperName: spec.paperName,
    themeId: theme,
    styleOrdinal,
    variant: "idle",
    isAscii: spec.isAscii,
    slots: { ...spec.slots, ...(spec.idleExtraSlots ?? {}) },
    schema: spec.baseSchema,
    schemaVersion: spec.schemaVersion,
    buildProps: spec.buildIdle,
    renderTree: spec.renderIdle,
    fallbackBackground: spec.fallbackBackground,
  }

  const interactive: ShaderDef = {
    id: `${spec.baseId}.interactive` as ShaderId,
    label: `${spec.label} · interactive`,
    paperName: spec.paperName,
    themeId: theme,
    styleOrdinal,
    variant: "interactive",
    isAscii: spec.isAscii,
    slots: { ...spec.slots, ...(spec.interactiveExtraSlots ?? {}) },
    schema: { ...spec.baseSchema, ...spec.interactiveSchema },
    schemaVersion: spec.schemaVersion,
    buildProps: spec.buildInteractive,
    renderTree: spec.renderInteractive,
    fallbackBackground: spec.fallbackBackground,
  }

  return [idle, interactive]
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/define-pair.ts
git commit -m "feat(shaders): add definePair helper"
```

---

### Task 6.2: `editorial/1.veil.tsx`

**Files:**
- Create: `src/components/shaders/themed/editorial/1.veil.tsx`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/editorial/1.veil.tsx
import { CursorRipples, FlowingGradient, Paper } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "muted" },
  c: { kind: "theme", token: "brand-accent" },
  d: { kind: "theme", token: "muted-foreground" },
}

const BASE_SCHEMA: DevControlSchema = {
  speed: { type: "number", default: 0.4, min: 0, max: 2, step: 0.05, label: "speed" },
  distortion: { type: "number", default: 0.6, min: 0, max: 2, step: 0.05, label: "distortion" },
  paperGrain: { type: "number", default: 0.2, min: 0, max: 0.5, step: 0.01, label: "paper" },
  grainScale: { type: "number", default: 1.2, min: 0.1, max: 3, step: 0.05, label: "grain scale" },
  seed: { type: "number", default: 0, min: 0, max: 100, step: 1, label: "seed" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: { type: "number", default: 3, min: 0, max: 20, step: 0.1, label: "ripple" },
  rippleRadius: { type: "number", default: 0.6, min: 0.1, max: 1, step: 0.05, label: "radius" },
}

type IdleProps = {
  flowing: {
    colorA: string
    colorB: string
    colorC: string
    colorD: string
    speed: number
    distortion: number
    seed: number
  }
  paper: { roughness: number; grainScale: number }
}

type InteractiveProps = IdleProps & {
  ripple: { intensity: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): IdleProps {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    flowing: {
      colorA: colors.a,
      colorB: colors.b,
      colorC: colors.c,
      colorD: colors.d,
      speed: (controls.speed as number) * speedMul,
      distortion: controls.distortion as number,
      seed: controls.seed as number,
    },
    paper: {
      roughness: controls.paperGrain as number,
      grainScale: controls.grainScale as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): InteractiveProps {
  return {
    ...buildIdle(ctx),
    ripple: {
      intensity: ctx.controls.rippleIntensity as number,
      radius: ctx.controls.rippleRadius as number,
    },
  }
}

function renderIdle(props: unknown) {
  const p = props as IdleProps
  return (
    <>
      <FlowingGradient
        colorA={p.flowing.colorA}
        colorB={p.flowing.colorB}
        colorC={p.flowing.colorC}
        colorD={p.flowing.colorD}
        speed={p.flowing.speed}
        distortion={p.flowing.distortion}
        seed={p.flowing.seed}
        colorSpace="oklch"
      />
      <Paper roughness={p.paper.roughness} grainScale={p.paper.grainScale} displacement={0.08} />
    </>
  )
}

function renderInteractive(props: unknown) {
  const p = props as InteractiveProps
  return (
    <>
      <CursorRipples
        intensity={p.ripple.intensity}
        decay={12}
        radius={p.ripple.radius}
        chromaticSplit={0}
      >
        <FlowingGradient
          colorA={p.flowing.colorA}
          colorB={p.flowing.colorB}
          colorC={p.flowing.colorC}
          colorD={p.flowing.colorD}
          speed={p.flowing.speed}
          distortion={p.flowing.distortion}
          seed={p.flowing.seed}
          colorSpace="oklch"
        />
      </CursorRipples>
      <Paper roughness={p.paper.roughness} grainScale={p.paper.grainScale} displacement={0.08} />
    </>
  )
}

export const editorialVeilPair = definePair({
  baseId: "editorial.1",
  label: "Editorial · Veil",
  paperName: "FlowingGradient + Paper",
  isAscii: false,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(at 70% 30%, {{c}} 0%, transparent 55%), linear-gradient(135deg, {{a}} 0%, {{b}} 100%)",
})
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

Note: if `shaders/react` types complain about specific component prop names, fix them by reading the corresponding doc via the shaders MCP `get-shader-docs` tool. The prop names in the spec are from the MCP and should match.

- [ ] **Step 3: Commit**

```bash
git add src/components/shaders/themed/editorial/1.veil.tsx
git commit -m "feat(shaders): editorial.1 Veil pair (FlowingGradient + Paper)"
```

---

### Task 6.3: Wire `editorial.1` into the registry

**Files:**
- Modify: `src/components/shaders/themed/registry.ts`

- [ ] **Step 1: Import and register**

Rewrite `registry.ts`:

```ts
// src/components/shaders/themed/registry.ts
import { editorialVeilPair } from "./editorial/1.veil"
import type { ShaderDef, ShaderId } from "./types"

const allPairs: ReadonlyArray<readonly [ShaderDef, ShaderDef]> = [
  editorialVeilPair,
  // remaining pairs added in Phase 8
]

export const SHADER_REGISTRY: Partial<Record<ShaderId, ShaderDef>> =
  Object.fromEntries(
    allPairs.flat().map((d) => [d.id, d] as const)
  ) as Partial<Record<ShaderId, ShaderDef>>

export const SHADER_IDS: readonly ShaderId[] = (
  Object.keys(SHADER_REGISTRY) as ShaderId[]
).sort()

export function getShaderDef(id: ShaderId): ShaderDef {
  const def = SHADER_REGISTRY[id]
  if (!def) throw new Error(`Unknown shader id: ${id}`)
  return def
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): register editorial.1 Veil pair"
```

---

### Task 6.4: Smoke-test the first pair on a scratch page

**Files:**
- Modify: `src/app/examples/shaders/page.tsx` (temporary scratch state)

- [ ] **Step 1: Replace the example page with a minimal smoke test**

```tsx
// src/app/examples/shaders/page.tsx
"use client"

import { ThemedShader } from "@/components/shaders/themed/themed-shader"

export default function ShadersExamplePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Shader smoke test
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border">
          <ThemedShader id="editorial.1.idle" className="absolute inset-0" />
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-white">
            editorial.1.idle
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border">
          <ThemedShader id="editorial.1.interactive" className="absolute inset-0" />
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-white">
            editorial.1.interactive
          </span>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Run the dev server**

```bash
pnpm dev
```

- [ ] **Step 3: Manual verification**

Open `http://localhost:3000/examples/shaders`. Expect:
- Two tiles render, both with a slow flowing gradient + paper texture overlay.
- Move the cursor across the right tile — ripples are barely visible (we set `intensity=3` very low).
- Open the dev panel (`~`), switch to Controls tab — folders for both `editorial.1.idle` and `editorial.1.interactive` appear, with `speed`, `distortion`, `paper`, etc.
- Drag `speed` on idle — the left tile slows/speeds in real time.
- Open Themes tab, switch from Editorial to Bold — both tiles' colors update (the bg / muted / brand-accent values change).

If any of these fails, debug before proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/app/examples/shaders/page.tsx
git commit -m "chore(shaders): smoke-test editorial.1 on examples page"
```

---

## Phase 7 — Showcase route

### Task 7.1: `showcase-tile.tsx`

**Files:**
- Create: `src/components/shaders/themed/showcase-tile.tsx`

- [ ] **Step 1: Write the tile component**

```tsx
// src/components/shaders/themed/showcase-tile.tsx
"use client"

import { useDevPanel } from "@/components/dev-panel"
import { cn } from "@/lib/utils"
import { getShaderDef } from "./registry"
import { ThemedShader } from "./themed-shader"
import type { ShaderId } from "./types"

export function ShaderTile({ id }: { id: ShaderId }) {
  const def = getShaderDef(id)
  const { focusedShaderId, setFocusedShaderId, setOpen, setActiveTab } =
    useDevPanel()
  const isFocused = focusedShaderId === id

  return (
    <button
      type="button"
      data-focused={isFocused}
      onClick={() => {
        const next = isFocused ? null : id
        setFocusedShaderId(next)
        if (next !== null) {
          setOpen(true)
          setActiveTab("controls")
        }
      }}
      className={cn(
        "group relative aspect-[16/10] overflow-hidden rounded-lg border border-border text-left cursor-pointer",
        "transition-shadow hover:shadow-[var(--shadow-raised)]",
        "data-[focused=true]:ring-2 data-[focused=true]:ring-ring data-[focused=true]:ring-offset-2 data-[focused=true]:ring-offset-background"
      )}
    >
      <ThemedShader id={id} className="absolute inset-0" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 font-mono text-[10px] text-white">
        <span>{id}</span>
        <span className="flex items-center gap-1">
          {def.isAscii && (
            <span className="rounded bg-white/15 px-1 py-0.5 tracking-wider">
              ASCII
            </span>
          )}
          <span className="opacity-80">{def.paperName}</span>
        </span>
      </span>
    </button>
  )
}
```

- [ ] **Step 2: Type-check and commit**

```bash
pnpm exec tsc --noEmit
```

```bash
git add src/components/shaders/themed/showcase-tile.tsx
git commit -m "feat(shaders): add ShaderTile click-to-focus component"
```

---

### Task 7.2: Showcase page with theme bands + URL state

**Files:**
- Modify: `src/app/examples/shaders/page.tsx`

- [ ] **Step 1: Write the showcase page**

```tsx
// src/app/examples/shaders/page.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

import { useDevPanel } from "@/components/dev-panel"
import { useTheme } from "@/providers/theme-provider"
import { ShaderTile } from "@/components/shaders/themed/showcase-tile"
import { SHADER_REGISTRY } from "@/components/shaders/themed/registry"
import type {
  ShaderId,
  ThemeId,
  Variant,
} from "@/components/shaders/themed/types"
import { cn } from "@/lib/utils"

const THEMES: readonly ThemeId[] = ["editorial", "saas", "bold", "cyber"]

function useBandVariants(): [Record<ThemeId, Variant>, (next: Record<ThemeId, Variant>) => void] {
  const router = useRouter()
  const params = useSearchParams()
  const state = useMemo<Record<ThemeId, Variant>>(
    () => ({
      editorial: (params.get("editorial") as Variant) ?? "idle",
      saas: (params.get("saas") as Variant) ?? "idle",
      bold: (params.get("bold") as Variant) ?? "idle",
      cyber: (params.get("cyber") as Variant) ?? "idle",
    }),
    [params]
  )
  const set = useCallback(
    (next: Record<ThemeId, Variant>) => {
      const sp = new URLSearchParams()
      for (const t of THEMES) {
        if (next[t] !== "idle") sp.set(t, next[t])
      }
      const qs = sp.toString()
      router.replace(qs ? `/examples/shaders?${qs}` : "/examples/shaders")
    },
    [router]
  )
  return [state, set]
}

export default function ShadersExamplePage() {
  const [variants, setVariants] = useBandVariants()
  const { themeId, setThemeId, themes } = useTheme()
  const { forceReducedMotion, setForceReducedMotion } = useDevPanel()

  const totalShaders = Object.keys(SHADER_REGISTRY).length

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="sticky top-0 z-10 -mx-6 mb-6 border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              /examples/shaders
            </h1>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {totalShaders} shader{totalShaders === 1 ? "" : "s"} · theme:{" "}
              <span className="text-foreground">{themeId}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeChips themes={themes.map((t) => t.id as ThemeId)} active={themeId as ThemeId} onPick={setThemeId} />
            <button
              type="button"
              data-active={forceReducedMotion}
              onClick={() => setForceReducedMotion(!forceReducedMotion)}
              className={cn(
                "rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-muted",
                "data-[active=true]:border-foreground/30 data-[active=true]:bg-muted data-[active=true]:text-foreground"
              )}
            >
              reduced motion {forceReducedMotion ? "●" : "○"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10">
        {THEMES.map((theme) => (
          <ThemeBand
            key={theme}
            theme={theme}
            variant={variants[theme]}
            onVariantChange={(v) => setVariants({ ...variants, [theme]: v })}
          />
        ))}
      </div>
    </main>
  )
}

function ThemeChips({
  themes,
  active,
  onPick,
}: {
  themes: readonly ThemeId[]
  active: ThemeId
  onPick: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {themes.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onPick(id)}
          data-active={id === active}
          className={cn(
            "rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium capitalize transition-colors hover:bg-muted cursor-pointer",
            "data-[active=true]:border-foreground/30 data-[active=true]:bg-muted"
          )}
        >
          {id}
        </button>
      ))}
    </div>
  )
}

function ThemeBand({
  theme,
  variant,
  onVariantChange,
}: {
  theme: ThemeId
  variant: Variant
  onVariantChange: (v: Variant) => void
}) {
  const ids: ShaderId[] = (["1", "2", "3"] as const).map(
    (n) => `${theme}.${n}.${variant}` as ShaderId
  )
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-medium capitalize tracking-tight">
          {theme}
        </h2>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
          {(["idle", "interactive"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onVariantChange(v)}
              data-active={v === variant}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[10px] capitalize transition-colors cursor-pointer hover:bg-muted",
                "data-[active=true]:bg-foreground data-[active=true]:text-background"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) =>
          SHADER_REGISTRY[id] ? (
            <ShaderTile key={id} id={id} />
          ) : (
            <div
              key={id}
              className="grid aspect-[16/10] place-items-center rounded-lg border border-dashed border-border text-center font-mono text-[10px] text-muted-foreground/60"
            >
              {id}
              <br />
              (not yet implemented)
            </div>
          )
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```

If the `useTheme()` hook's return shape uses different property names (e.g. `theme` instead of `themes`), adapt accordingly — verify by reading `src/providers/theme-provider.tsx` first.

- [ ] **Step 3: Smoke test**

```bash
pnpm dev
```

Visit `/examples/shaders`. Expect:
- 4 theme bands, each with 3 tiles (most showing "not yet implemented" placeholders), plus the editorial row showing a live `editorial.1` tile.
- Theme chips in the header switch themes.
- Per-band `idle | interactive` toggle changes the URL and swaps the tile IDs.
- Reduced-motion toggle shows the visible shader slowing down.
- Click the editorial.1 tile — dev panel opens, switches to Controls tab.

- [ ] **Step 4: Commit**

```bash
git add src/app/examples/shaders/page.tsx
git commit -m "feat(shaders): showcase route with theme bands + URL state"
```

---

## Phase 8 — Remaining 11 shader pairs

Each task follows the same shape: write `<theme>/<n>.<name>.tsx`, register it, smoke-test, commit. For ASCII shaders, also add the entry to `char-sets.ts`.

### Task 8.1: `editorial.2` Letterpress (ASCII)

**Files:**
- Create: `src/components/shaders/themed/editorial/2.letterpress.tsx`
- Modify: `src/components/shaders/themed/char-sets.ts`, `src/components/shaders/themed/registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/editorial/2.letterpress.tsx
import { Ascii, GridDistortion, LinearGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  cellSize: { type: "number", default: 45, min: 24, max: 80, step: 1, label: "cell size" },
  gamma: { type: "number", default: 1.2, min: 0.5, max: 2, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "marks",
    options: ["marks", "rule", "dots"] as const,
    optionsLabels: {
      marks: "marks  (. : - = +)",
      rule: "rule  (─ │ ┼)",
      dots: "dots  (· : ∶)",
    },
    label: "characters",
  },
  angle: { type: "number", default: 135, min: 0, max: 360, step: 1, label: "angle" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  distortionIntensity: { type: "number", default: 0.4, min: 0, max: 2, step: 0.05, label: "distortion" },
  distortionRadius: { type: "number", default: 1.2, min: 0, max: 3, step: 0.1, label: "radius" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  gradient: { colorA: string; colorB: string; angle: number }
  distortion?: { intensity: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  return {
    ascii: {
      characters: getCharSet("editorial.2.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    gradient: {
      colorA: colors.a,
      colorB: colors.c,
      angle: controls.angle as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    distortion: {
      intensity: ctx.controls.distortionIntensity as number,
      radius: ctx.controls.distortionRadius as number,
    },
  }
}

function renderIdle(props: unknown) {
  const p = props as Props
  return (
    <Ascii
      characters={p.ascii.characters}
      fontFamily="IBM Plex Mono"
      cellSize={p.ascii.cellSize}
      spacing={0.95}
      gamma={p.ascii.gamma}
    >
      <LinearGradient
        colorA={p.gradient.colorA}
        colorB={p.gradient.colorB}
        angle={p.gradient.angle}
        colorSpace="oklch"
      />
    </Ascii>
  )
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <Ascii
      characters={p.ascii.characters}
      fontFamily="IBM Plex Mono"
      cellSize={p.ascii.cellSize}
      spacing={0.95}
      gamma={p.ascii.gamma}
    >
      <GridDistortion
        intensity={p.distortion!.intensity}
        decay={4}
        radius={p.distortion!.radius}
        gridSize={64}
      >
        <LinearGradient
          colorA={p.gradient.colorA}
          colorB={p.gradient.colorB}
          angle={p.gradient.angle}
          colorSpace="oklch"
        />
      </GridDistortion>
    </Ascii>
  )
}

export const editorialLetterpressPair = definePair({
  baseId: "editorial.2",
  label: "Editorial · Letterpress",
  paperName: "Ascii ← LinearGradient",
  isAscii: true,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground: "linear-gradient(135deg, {{a}} 0%, {{c}} 100%)",
})
```

- [ ] **Step 2: Add char-set entries**

Replace `char-sets.ts`:

```ts
// src/components/shaders/themed/char-sets.ts
import type { ShaderId } from "./types"

const editorial2 = { marks: " .:-=+", rule: "─│┼", dots: "·:∶" }

export const CHAR_SETS: Partial<Record<ShaderId, Record<string, string>>> = {
  "editorial.2.idle": editorial2,
  "editorial.2.interactive": editorial2,
}

export function getCharSet(shaderId: ShaderId, preset: string): string {
  const map = CHAR_SETS[shaderId]
  if (!map) return " .:-=+"
  return map[preset] ?? Object.values(map)[0] ?? " .:-=+"
}
```

- [ ] **Step 3: Register**

In `registry.ts`, add the import and include in `allPairs`:

```ts
import { editorialLetterpressPair } from "./editorial/2.letterpress"

const allPairs: ReadonlyArray<readonly [ShaderDef, ShaderDef]> = [
  editorialVeilPair,
  editorialLetterpressPair,
]
```

- [ ] **Step 4: Type-check + smoke test + commit**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Verify `editorial.2.idle` renders ASCII letterpress; `editorial.2.interactive` warps under cursor.

```bash
git add src/components/shaders/themed/editorial/2.letterpress.tsx src/components/shaders/themed/char-sets.ts src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): editorial.2 Letterpress (ASCII)"
```

---

### Task 8.2: `editorial.3` Marble

**Files:**
- Create: `src/components/shaders/themed/editorial/3.marble.tsx`
- Modify: `src/components/shaders/themed/registry.ts`

- [ ] **Step 1: Inspect project's OKLCh luminance helper**

```bash
grep -n "hexToOklch\|parseOklch\|oklchLuminance" src/lib/color.ts | head -10
```

If `src/lib/color.ts` exports something that parses an OKLCh CSS string to `{l, c, h}`, use it. Otherwise add a small parser inline below.

- [ ] **Step 2: Write the pair file**

```tsx
// src/components/shaders/themed/editorial/3.marble.tsx
import { FilmGrain, Liquify, Marble } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "muted-foreground" },
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  scale: { type: "number", default: 1.5, min: 0.5, max: 3, step: 0.05, label: "scale" },
  turbulence: { type: "number", default: 8, min: 0, max: 20, step: 0.5, label: "turbulence" },
  speed: { type: "number", default: 0.04, min: 0, max: 0.1, step: 0.005, label: "speed" },
  grainOverride: { type: "number", default: 0, min: 0, max: 0.4, step: 0.01, label: "grain (0 = auto)" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  liquifyIntensity: { type: "number", default: 4, min: 0, max: 20, step: 0.1, label: "liquify" },
  liquifyStiffness: { type: "number", default: 8, min: 1, max: 30, step: 0.5, label: "stiffness" },
}

function parseOklchL(value: string): number {
  // Accept oklch(L C H) or oklch(L C H / A). Returns L in [0,1].
  const m = value.match(/oklch\(\s*([0-9.]+)/i)
  if (!m) return 0.5 // unknown — neutral default
  return Math.max(0, Math.min(1, parseFloat(m[1])))
}

function calibratedGrain(bgColor: string, override: number): number {
  if (override > 0) return override
  const l = parseOklchL(bgColor)
  return Math.max(0.05, Math.min(0.32, 0.32 - 0.27 * l))
}

type Props = {
  marble: { colorA: string; colorB: string; colorC: string; scale: number; turbulence: number; speed: number }
  film: { strength: number }
  liquify?: { intensity: number; stiffness: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    marble: {
      colorA: colors.a,
      colorB: colors.b,
      colorC: colors.c,
      scale: controls.scale as number,
      turbulence: controls.turbulence as number,
      speed: (controls.speed as number) * speedMul,
    },
    film: { strength: calibratedGrain(colors.a, controls.grainOverride as number) },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    liquify: {
      intensity: ctx.controls.liquifyIntensity as number,
      stiffness: ctx.controls.liquifyStiffness as number,
    },
  }
}

function renderIdle(props: unknown) {
  const p = props as Props
  return (
    <>
      <Marble
        colorA={p.marble.colorA}
        colorB={p.marble.colorB}
        colorC={p.marble.colorC}
        scale={p.marble.scale}
        turbulence={p.marble.turbulence}
        speed={p.marble.speed}
        colorSpace="oklch"
      />
      <FilmGrain strength={p.film.strength} bias={2} />
    </>
  )
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <>
      <Liquify intensity={p.liquify!.intensity} stiffness={p.liquify!.stiffness} damping={4} radius={0.6}>
        <Marble
          colorA={p.marble.colorA}
          colorB={p.marble.colorB}
          colorC={p.marble.colorC}
          scale={p.marble.scale}
          turbulence={p.marble.turbulence}
          speed={p.marble.speed}
          colorSpace="oklch"
        />
      </Liquify>
      <FilmGrain strength={p.film.strength} bias={2} />
    </>
  )
}

export const editorialMarblePair = definePair({
  baseId: "editorial.3",
  label: "Editorial · Marble",
  paperName: "Marble + FilmGrain",
  isAscii: false,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(at 40% 60%, {{c}} 0%, transparent 35%), linear-gradient(135deg, {{a}} 0%, {{b}} 100%)",
})
```

- [ ] **Step 3: Register**

```ts
import { editorialMarblePair } from "./editorial/3.marble"
// add to allPairs
```

- [ ] **Step 4: Type-check + smoke test + commit**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Verify marble veins drift slowly; FilmGrain visible at correct intensity for the current theme's bg luminance; interactive variant warps under cursor.

```bash
git add src/components/shaders/themed/editorial/3.marble.tsx src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): editorial.3 Marble + auto-calibrated grain"
```

---

### Task 8.3: `saas.1` Mesh

**Files:**
- Create: `src/components/shaders/themed/saas/1.mesh.tsx`
- Modify: `src/components/shaders/themed/registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/saas/1.mesh.tsx
import { CursorRipples, MultiPointGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
  c: { kind: "theme", token: "brand-accent" },
  d: { kind: "theme", token: "chart-1" },
  e: { kind: "theme", token: "background" },
}

const BASE_SCHEMA: DevControlSchema = {
  smoothness: { type: "number", default: 2.5, min: 0, max: 5, step: 0.05, label: "smoothness" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: { type: "number", default: 6, min: 0, max: 20, step: 0.1, label: "ripple" },
  rippleRadius: { type: "number", default: 0.5, min: 0.1, max: 1, step: 0.05, label: "radius" },
  chromaticSplit: { type: "number", default: 0.6, min: 0, max: 3, step: 0.1, label: "chroma split" },
}

type Props = {
  mesh: {
    colorA: string; colorB: string; colorC: string; colorD: string; colorE: string
    smoothness: number
  }
  ripple?: { intensity: number; radius: number; chromaticSplit: number }
}

function buildIdle({ colors, controls }: BuildPropsContext): Props {
  return {
    mesh: {
      colorA: colors.a, colorB: colors.b, colorC: colors.c, colorD: colors.d, colorE: colors.e,
      smoothness: controls.smoothness as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    ripple: {
      intensity: ctx.controls.rippleIntensity as number,
      radius: ctx.controls.rippleRadius as number,
      chromaticSplit: ctx.controls.chromaticSplit as number,
    },
  }
}

function meshNode(p: Props) {
  return (
    <MultiPointGradient
      colorA={p.mesh.colorA} positionA={{ x: 0.2, y: 0.2 }}
      colorB={p.mesh.colorB} positionB={{ x: 0.8, y: 0.15 }}
      colorC={p.mesh.colorC} positionC={{ x: 0.85, y: 0.85 }}
      colorD={p.mesh.colorD} positionD={{ x: 0.15, y: 0.85 }}
      colorE={p.mesh.colorE} positionE={{ x: 0.5, y: 0.5 }}
      smoothness={p.mesh.smoothness}
    />
  )
}

function renderIdle(props: unknown) {
  return meshNode(props as Props)
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <CursorRipples
      intensity={p.ripple!.intensity}
      decay={8}
      radius={p.ripple!.radius}
      chromaticSplit={p.ripple!.chromaticSplit}
    >
      {meshNode(p)}
    </CursorRipples>
  )
}

export const saasMeshPair = definePair({
  baseId: "saas.1",
  label: "SaaS · Mesh",
  paperName: "MultiPointGradient",
  isAscii: false,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(at 20% 20%, {{a}}, transparent 50%), radial-gradient(at 80% 15%, {{b}}, transparent 50%), radial-gradient(at 85% 85%, {{c}}, transparent 50%), radial-gradient(at 15% 85%, {{d}}, transparent 50%), linear-gradient({{e}}, {{e}})",
})
```

- [ ] **Step 2: Register, type-check, smoke test, commit**

```ts
// registry.ts
import { saasMeshPair } from "./saas/1.mesh"
// add to allPairs
```

```bash
pnpm exec tsc --noEmit
pnpm dev
```

```bash
git add src/components/shaders/themed/saas/1.mesh.tsx src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): saas.1 Mesh (5-point gradient)"
```

---

### Task 8.4: `saas.2` Flow (FlowingGradient idle / ChromaFlow interactive — same-family swap)

**Files:**
- Create: `src/components/shaders/themed/saas/2.flow.tsx`
- Modify: `src/components/shaders/themed/registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/saas/2.flow.tsx
import { ChromaFlow, FlowingGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "primary" },
  c: { kind: "theme", token: "accent" },
  d: { kind: "theme", token: "brand-accent" },
}

const INTERACTIVE_EXTRA_SLOTS: Record<string, ColorSlot> = {
  e: { kind: "theme", token: "chart-1" },
  f: { kind: "theme", token: "chart-2" },
}

const BASE_SCHEMA: DevControlSchema = {
  speed: { type: "number", default: 0.8, min: 0, max: 2, step: 0.05, label: "speed" },
  distortion: { type: "number", default: 0.7, min: 0, max: 2, step: 0.05, label: "distortion" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  intensity: { type: "number", default: 1.0, min: 0.5, max: 1.5, step: 0.05, label: "intensity" },
  radius: { type: "number", default: 2.5, min: 0, max: 5, step: 0.1, label: "radius" },
  momentum: { type: "number", default: 28, min: 10, max: 60, step: 1, label: "momentum" },
}

type IdleProps = {
  flowing: { colorA: string; colorB: string; colorC: string; colorD: string; speed: number; distortion: number }
}
type InteractiveProps = {
  chroma: {
    baseColor: string; upColor: string; downColor: string; leftColor: string; rightColor: string
    intensity: number; radius: number; momentum: number
  }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): IdleProps {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    flowing: {
      colorA: colors.a,
      colorB: colors.b,
      colorC: colors.c,
      colorD: colors.d,
      speed: (controls.speed as number) * speedMul,
      distortion: controls.distortion as number,
    },
  }
}

function buildInteractive({ colors, controls }: BuildPropsContext): InteractiveProps {
  return {
    chroma: {
      baseColor: colors.b,
      upColor: colors.c,
      downColor: colors.d,
      leftColor: colors.e ?? colors.b,
      rightColor: colors.f ?? colors.c,
      intensity: controls.intensity as number,
      radius: controls.radius as number,
      momentum: controls.momentum as number,
    },
  }
}

function renderIdle(props: unknown) {
  const p = props as IdleProps
  return (
    <FlowingGradient
      colorA={p.flowing.colorA}
      colorB={p.flowing.colorB}
      colorC={p.flowing.colorC}
      colorD={p.flowing.colorD}
      speed={p.flowing.speed}
      distortion={p.flowing.distortion}
      colorSpace="oklch"
    />
  )
}

function renderInteractive(props: unknown) {
  const p = props as InteractiveProps
  return (
    <ChromaFlow
      baseColor={p.chroma.baseColor}
      upColor={p.chroma.upColor}
      downColor={p.chroma.downColor}
      leftColor={p.chroma.leftColor}
      rightColor={p.chroma.rightColor}
      intensity={p.chroma.intensity}
      radius={p.chroma.radius}
      momentum={p.chroma.momentum}
    />
  )
}

export const saasFlowPair = definePair({
  baseId: "saas.2",
  label: "SaaS · Flow",
  paperName: "FlowingGradient → ChromaFlow",
  isAscii: false,
  slots: SLOTS,
  interactiveExtraSlots: INTERACTIVE_EXTRA_SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "linear-gradient(135deg, {{a}}, {{b}} 40%, {{c}} 70%, {{d}})",
})
```

- [ ] **Step 2: Register, type-check, smoke test, commit**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

```bash
git add src/components/shaders/themed/saas/2.flow.tsx src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): saas.2 Flow (FlowingGradient → ChromaFlow swap)"
```

---

### Task 8.5: `saas.3` Glyph Mesh (ASCII)

**Files:**
- Create: `src/components/shaders/themed/saas/3.glyph-mesh.tsx`
- Modify: `char-sets.ts`, `registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/saas/3.glyph-mesh.tsx
import { Ascii, CursorRipples, MultiPointGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
  c: { kind: "theme", token: "brand-accent" },
  d: { kind: "theme", token: "chart-1" },
  e: { kind: "theme", token: "background" },
}

const BASE_SCHEMA: DevControlSchema = {
  cellSize: { type: "number", default: 38, min: 24, max: 60, step: 1, label: "cell size" },
  smoothness: { type: "number", default: 2.5, min: 0, max: 5, step: 0.05, label: "smoothness" },
  gamma: { type: "number", default: 1, min: 0.5, max: 2, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "data",
    options: ["data", "dots", "blocks"] as const,
    optionsLabels: {
      data: "data  (. + × ▪ █)",
      dots: "dots  (· • ◦ ●)",
      blocks: "blocks  (░ ▒ ▓ █)",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: { type: "number", default: 4, min: 0, max: 20, step: 0.1, label: "ripple" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  mesh: { a: string; b: string; c: string; d: string; e: string; smoothness: number }
  ripple?: { intensity: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  return {
    ascii: {
      characters: getCharSet("saas.3.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    mesh: {
      a: colors.a, b: colors.b, c: colors.c, d: colors.d, e: colors.e,
      smoothness: controls.smoothness as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    ripple: { intensity: ctx.controls.rippleIntensity as number },
  }
}

function meshNode(p: Props) {
  return (
    <MultiPointGradient
      colorA={p.mesh.a} positionA={{ x: 0.2, y: 0.2 }}
      colorB={p.mesh.b} positionB={{ x: 0.8, y: 0.15 }}
      colorC={p.mesh.c} positionC={{ x: 0.85, y: 0.85 }}
      colorD={p.mesh.d} positionD={{ x: 0.15, y: 0.85 }}
      colorE={p.mesh.e} positionE={{ x: 0.5, y: 0.5 }}
      smoothness={p.mesh.smoothness}
    />
  )
}

function asciiNode(p: Props, child: React.ReactNode) {
  return (
    <Ascii characters={p.ascii.characters} fontFamily="Geist Mono" cellSize={p.ascii.cellSize} spacing={1} gamma={p.ascii.gamma}>
      {child}
    </Ascii>
  )
}

function renderIdle(props: unknown) {
  const p = props as Props
  return asciiNode(p, meshNode(p))
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <CursorRipples intensity={p.ripple!.intensity} decay={10} radius={0.5} chromaticSplit={0}>
      {asciiNode(p, meshNode(p))}
    </CursorRipples>
  )
}

export const saasGlyphMeshPair = definePair({
  baseId: "saas.3",
  label: "SaaS · Glyph Mesh",
  paperName: "Ascii ← MultiPointGradient",
  isAscii: true,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(at 20% 20%, {{a}}, transparent 50%), radial-gradient(at 80% 15%, {{b}}, transparent 50%), radial-gradient(at 85% 85%, {{c}}, transparent 50%), radial-gradient(at 15% 85%, {{d}}, transparent 50%), linear-gradient({{e}}, {{e}})",
})
```

- [ ] **Step 2: Add char-sets, register, smoke, commit**

`char-sets.ts`:
```ts
const saas3 = { data: ".+×▪█", dots: "·•◦●", blocks: "░▒▓█" }

export const CHAR_SETS = {
  ...,
  "saas.3.idle": saas3,
  "saas.3.interactive": saas3,
}
```

```bash
git add src/components/shaders/themed/saas/3.glyph-mesh.tsx src/components/shaders/themed/char-sets.ts src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): saas.3 Glyph Mesh (ASCII)"
```

---

### Task 8.6: `bold.1` Aurora

**Files:**
- Create: `src/components/shaders/themed/bold/1.aurora.tsx`
- Modify: `registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/bold/1.aurora.tsx
import { Aurora, CursorRipples } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  intensity: { type: "number", default: 85, min: 0, max: 100, step: 1, label: "intensity" },
  curtains: { type: "select", default: "4", options: ["1", "2", "3", "4"] as const, label: "curtains" },
  speed: { type: "number", default: 3.5, min: -10, max: 10, step: 0.1, label: "speed" },
  waviness: { type: "number", default: 80, min: 0, max: 200, step: 1, label: "waviness" },
  rayDensity: { type: "number", default: 35, min: 0, max: 100, step: 1, label: "rays" },
  height: { type: "number", default: 140, min: 10, max: 200, step: 1, label: "height" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: { type: "number", default: 8, min: 0, max: 20, step: 0.1, label: "ripple" },
  rippleRadius: { type: "number", default: 0.6, min: 0.1, max: 1, step: 0.05, label: "radius" },
  chromaticSplit: { type: "number", default: 1.2, min: 0, max: 3, step: 0.1, label: "chroma split" },
}

type Props = {
  aurora: {
    colorA: string; colorB: string; colorC: string
    intensity: number; curtainCount: number; speed: number; waviness: number; rayDensity: number; height: number
  }
  ripple?: { intensity: number; radius: number; chromaticSplit: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  const intensityMul = perfMode === "reduced" ? 0.7 : 1
  return {
    aurora: {
      colorA: colors.a, colorB: colors.b, colorC: colors.c,
      intensity: (controls.intensity as number) * intensityMul,
      curtainCount: Number(controls.curtains as string),
      speed: (controls.speed as number) * speedMul,
      waviness: controls.waviness as number,
      rayDensity: controls.rayDensity as number,
      height: controls.height as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    ripple: {
      intensity: ctx.controls.rippleIntensity as number,
      radius: ctx.controls.rippleRadius as number,
      chromaticSplit: ctx.controls.chromaticSplit as number,
    },
  }
}

function auroraNode(p: Props) {
  return (
    <Aurora
      colorA={p.aurora.colorA}
      colorB={p.aurora.colorB}
      colorC={p.aurora.colorC}
      intensity={p.aurora.intensity}
      curtainCount={p.aurora.curtainCount}
      speed={p.aurora.speed}
      waviness={p.aurora.waviness}
      rayDensity={p.aurora.rayDensity}
      height={p.aurora.height}
      colorSpace="oklch"
    />
  )
}

function renderIdle(props: unknown) {
  return auroraNode(props as Props)
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <CursorRipples
      intensity={p.ripple!.intensity}
      decay={6}
      radius={p.ripple!.radius}
      chromaticSplit={p.ripple!.chromaticSplit}
    >
      {auroraNode(p)}
    </CursorRipples>
  )
}

export const boldAuroraPair = definePair({
  baseId: "bold.1",
  label: "Bold · Aurora",
  paperName: "Aurora",
  isAscii: false,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(ellipse 80% 50% at 50% 100%, {{c}} 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 30% 80%, {{b}}, transparent 60%), linear-gradient(180deg, {{a}} 0%, transparent 100%)",
})
```

- [ ] **Step 2: Register + smoke + commit**

```bash
git add src/components/shaders/themed/bold/1.aurora.tsx src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): bold.1 Aurora"
```

---

### Task 8.7: `bold.2` Ascii Plasma (ASCII)

**Files:**
- Create: `src/components/shaders/themed/bold/2.ascii-plasma.tsx`
- Modify: `char-sets.ts`, `registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/bold/2.ascii-plasma.tsx
import { Ascii, Liquify, Plasma } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "background" },
}

const BASE_SCHEMA: DevControlSchema = {
  cellSize: { type: "number", default: 26, min: 16, max: 50, step: 1, label: "cell size" },
  density: { type: "number", default: 2.5, min: 0, max: 4, step: 0.1, label: "density" },
  speed: { type: "number", default: 1.8, min: 0, max: 5, step: 0.1, label: "speed" },
  warp: { type: "number", default: 0.5, min: 0, max: 1, step: 0.01, label: "warp" },
  contrast: { type: "number", default: 1.4, min: 0, max: 3, step: 0.05, label: "contrast" },
  gamma: { type: "number", default: 1.4, min: 0.5, max: 3, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "blocks",
    options: ["blocks", "digits", "letters"] as const,
    optionsLabels: {
      blocks: "blocks  (█ ▓ ▒ ░ )",
      digits: "digits  (0–9)",
      letters: "letters  (MWHEX#-:.)",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  liquifyIntensity: { type: "number", default: 6, min: 0, max: 20, step: 0.1, label: "liquify" },
  liquifyStiffness: { type: "number", default: 4, min: 1, max: 30, step: 0.5, label: "stiffness" },
  liquifyDamping: { type: "number", default: 3, min: 0, max: 10, step: 0.1, label: "damping" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  plasma: { colorA: string; colorB: string; density: number; speed: number; warp: number; contrast: number }
  liquify?: { intensity: number; stiffness: number; damping: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("bold.2.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    plasma: {
      colorA: colors.a, colorB: colors.b,
      density: controls.density as number,
      speed: (controls.speed as number) * speedMul,
      warp: controls.warp as number,
      contrast: controls.contrast as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    liquify: {
      intensity: ctx.controls.liquifyIntensity as number,
      stiffness: ctx.controls.liquifyStiffness as number,
      damping: ctx.controls.liquifyDamping as number,
    },
  }
}

function plasmaNode(p: Props) {
  return (
    <Plasma
      colorA={p.plasma.colorA}
      colorB={p.plasma.colorB}
      density={p.plasma.density}
      speed={p.plasma.speed}
      intensity={1.8}
      warp={p.plasma.warp}
      contrast={p.plasma.contrast}
      balance={55}
      colorSpace="oklch"
    />
  )
}

function asciiWrap(p: Props, child: React.ReactNode) {
  return (
    <Ascii characters={p.ascii.characters} fontFamily="JetBrains Mono" cellSize={p.ascii.cellSize} spacing={1} gamma={p.ascii.gamma}>
      {child}
    </Ascii>
  )
}

function renderIdle(props: unknown) {
  const p = props as Props
  return asciiWrap(p, plasmaNode(p))
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <Liquify
      intensity={p.liquify!.intensity}
      stiffness={p.liquify!.stiffness}
      damping={p.liquify!.damping}
      radius={0.8}
      edges="mirror"
    >
      {asciiWrap(p, plasmaNode(p))}
    </Liquify>
  )
}

export const boldAsciiPlasmaPair = definePair({
  baseId: "bold.2",
  label: "Bold · Ascii Plasma",
  paperName: "Ascii ← Plasma",
  isAscii: true,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(circle at 50% 50%, {{a}} 0%, transparent 60%), linear-gradient(135deg, {{b}}, {{a}})",
})
```

- [ ] **Step 2: Char-sets, register, smoke, commit**

```ts
// char-sets.ts add:
const bold2 = { blocks: "█▓▒░ ", digits: "0123456789", letters: "MWHEX#-:." }
// "bold.2.idle": bold2, "bold.2.interactive": bold2
```

```bash
git add src/components/shaders/themed/bold/2.ascii-plasma.tsx src/components/shaders/themed/char-sets.ts src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): bold.2 Ascii Plasma (ASCII)"
```

---

### Task 8.8: `bold.3` Swirl + Smoke overlay

**Files:**
- Create: `src/components/shaders/themed/bold/3.swirl.tsx`
- Modify: `registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/bold/3.swirl.tsx
import { Smoke, Swirl } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
}

const INTERACTIVE_EXTRA_SLOTS: Record<string, ColorSlot> = {
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  speed: { type: "number", default: 1.4, min: 0, max: 5, step: 0.1, label: "speed" },
  detail: { type: "number", default: 1.8, min: 0, max: 5, step: 0.1, label: "detail" },
  blend: { type: "number", default: 50, min: 0, max: 100, step: 1, label: "blend" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  smokeIntensity: { type: "number", default: 0.5, min: 0.1, max: 1, step: 0.05, label: "smoke" },
  mouseInfluence: { type: "number", default: 0.8, min: 0, max: 2, step: 0.05, label: "cursor pull" },
  mouseRadius: { type: "number", default: 0.2, min: 0.02, max: 0.5, step: 0.01, label: "cursor radius" },
}

type Props = {
  swirl: { colorA: string; colorB: string; speed: number; detail: number; blend: number }
  smoke?: { colorA: string; colorB: string; intensity: number; mouseInfluence: number; mouseRadius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    swirl: {
      colorA: colors.a, colorB: colors.b,
      speed: (controls.speed as number) * speedMul,
      detail: controls.detail as number,
      blend: controls.blend as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    smoke: {
      colorA: ctx.colors.c ?? ctx.colors.a,
      colorB: ctx.colors.a,
      intensity: ctx.controls.smokeIntensity as number,
      mouseInfluence: ctx.controls.mouseInfluence as number,
      mouseRadius: ctx.controls.mouseRadius as number,
    },
  }
}

function swirlNode(p: Props) {
  return (
    <Swirl
      colorA={p.swirl.colorA}
      colorB={p.swirl.colorB}
      speed={p.swirl.speed}
      detail={p.swirl.detail}
      blend={p.swirl.blend}
      colorSpace="oklch"
    />
  )
}

function renderIdle(props: unknown) {
  return swirlNode(props as Props)
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <>
      {swirlNode(p)}
      <Smoke
        colorA={p.smoke!.colorA}
        colorB={p.smoke!.colorB}
        emitFrom={{ x: 0.5, y: 1 }}
        direction={0}
        speed={15}
        intensity={p.smoke!.intensity}
        mouseInfluence={p.smoke!.mouseInfluence}
        mouseRadius={p.smoke!.mouseRadius}
        dissipation={0.3}
        detail={22}
      />
    </>
  )
}

export const boldSwirlPair = definePair({
  baseId: "bold.3",
  label: "Bold · Swirl",
  paperName: "Swirl (+ Smoke)",
  isAscii: false,
  slots: SLOTS,
  interactiveExtraSlots: INTERACTIVE_EXTRA_SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(at 60% 40%, {{c}} 0%, transparent 40%), conic-gradient(from 180deg at 50% 50%, {{a}}, {{b}}, {{a}})",
})
```

- [ ] **Step 2: Register + smoke + commit**

```bash
git add src/components/shaders/themed/bold/3.swirl.tsx src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): bold.3 Swirl + Smoke overlay"
```

---

### Task 8.9: `cyber.1` Ascii Terrain (ASCII)

**Files:**
- Create: `src/components/shaders/themed/cyber/1.ascii-terrain.tsx`
- Modify: `char-sets.ts`, `registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/cyber/1.ascii-terrain.tsx
import { Ascii, GridDistortion, Voronoi } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
  c: { kind: "theme", token: "background" },
}

const BASE_SCHEMA: DevControlSchema = {
  cellSize: { type: "number", default: 20, min: 12, max: 36, step: 1, label: "cell size" },
  voronoiScale: { type: "number", default: 8, min: 2, max: 15, step: 0.5, label: "scale" },
  voronoiSpeed: { type: "number", default: 0.4, min: 0, max: 2, step: 0.05, label: "speed" },
  gamma: { type: "number", default: 1, min: 0.5, max: 2, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "density",
    options: ["density", "sparse", "blocks"] as const,
    optionsLabels: {
      density: "density  (#@%*+-: )",
      sparse: "sparse  (. : ;)",
      blocks: "blocks  (█ ▓ ▒ ░)",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  distortionIntensity: { type: "number", default: 1.2, min: 0, max: 5, step: 0.05, label: "distortion" },
  distortionRadius: { type: "number", default: 1.2, min: 0, max: 3, step: 0.1, label: "radius" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  voronoi: { colorA: string; colorB: string; colorBorder: string; scale: number; speed: number }
  distortion?: { intensity: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("cyber.1.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    voronoi: {
      colorA: colors.a, colorB: colors.b, colorBorder: colors.c,
      scale: controls.voronoiScale as number,
      speed: (controls.voronoiSpeed as number) * speedMul,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    distortion: {
      intensity: ctx.controls.distortionIntensity as number,
      radius: ctx.controls.distortionRadius as number,
    },
  }
}

function voronoiNode(p: Props) {
  return (
    <Voronoi
      colorA={p.voronoi.colorA}
      colorB={p.voronoi.colorB}
      colorBorder={p.voronoi.colorBorder}
      scale={p.voronoi.scale}
      speed={p.voronoi.speed}
      edgeIntensity={0.6}
      edgeSoftness={0.04}
      colorSpace="oklch"
    />
  )
}

function asciiWrap(p: Props, child: React.ReactNode) {
  return (
    <Ascii characters={p.ascii.characters} fontFamily="JetBrains Mono" cellSize={p.ascii.cellSize} spacing={1} gamma={p.ascii.gamma}>
      {child}
    </Ascii>
  )
}

function renderIdle(props: unknown) {
  const p = props as Props
  return asciiWrap(p, voronoiNode(p))
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <GridDistortion
      intensity={p.distortion!.intensity}
      decay={2.5}
      radius={p.distortion!.radius}
      gridSize={48}
      edges="wrap"
    >
      {asciiWrap(p, voronoiNode(p))}
    </GridDistortion>
  )
}

export const cyberAsciiTerrainPair = definePair({
  baseId: "cyber.1",
  label: "Cyber · Ascii Terrain",
  paperName: "Ascii ← Voronoi",
  isAscii: true,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(at 30% 30%, {{a}}, transparent 40%), radial-gradient(at 70% 70%, {{b}}, transparent 40%), linear-gradient(180deg, {{c}}, #000)",
})
```

- [ ] **Step 2: Char-sets, register, smoke, commit**

```ts
// char-sets.ts add:
const cyber1 = { density: "#@%*+-: ", sparse: ". : ;", blocks: "█▓▒░ " }
// "cyber.1.idle": cyber1, "cyber.1.interactive": cyber1
```

```bash
git add src/components/shaders/themed/cyber/1.ascii-terrain.tsx src/components/shaders/themed/char-sets.ts src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): cyber.1 Ascii Terrain (ASCII)"
```

---

### Task 8.10: `cyber.2` Code Rain (ASCII + dynamic prop mapping)

**Files:**
- Create: `src/components/shaders/themed/cyber/2.code-rain.tsx`
- Modify: `char-sets.ts`, `registry.ts`

- [ ] **Step 1: Confirm dynamic prop mapping syntax**

The spec describes binding `Ascii.gamma` to cursor distance via the `shaders` library's dynamic prop mapping with `smoothing=0.2 momentum=0.2`. The exact syntax from `shaders/react` should match the MCP's `dynamic-prop-mapping` pro-note. If unsure, fetch it:

```
# in a dev session, before writing code, query the shaders MCP:
mcp__shaders__get-shader-docs(['Ascii'])   # for current gamma prop type
ReadMcpResourceTool('shaders://pro-notes/dynamic-prop-mapping')
```

Use the **map mode** with cursor as the driver. If the API surface in `shaders@2.5.124` doesn't yet expose the same syntax shown in the MCP docs, fall back to a simple `useEffect` that listens to `pointermove` and writes a clamped `gamma` value into a `useState` cell that the shader consumes — the visual result is the same, with slightly less smoothing finesse.

- [ ] **Step 2: Write the pair file**

```tsx
// src/components/shaders/themed/cyber/2.code-rain.tsx
"use client"

import { Ascii, FallingLines, Smoke } from "shaders/react"
import { useEffect, useState } from "react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
}

const INTERACTIVE_EXTRA_SLOTS: Record<string, ColorSlot> = {
  b: { kind: "theme", token: "accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  density: { type: "number", default: 28, min: 10, max: 40, step: 1, label: "columns" },
  speed: { type: "number", default: 0.8, min: 0, max: 2, step: 0.05, label: "speed" },
  trailLength: { type: "number", default: 0.65, min: 0.2, max: 1, step: 0.05, label: "trail" },
  strokeWidth: { type: "number", default: 0.7, min: 0.3, max: 1, step: 0.05, label: "stroke" },
  cellSize: { type: "number", default: 24, min: 16, max: 40, step: 1, label: "cell size" },
  gamma: { type: "number", default: 0.9, min: 0.5, max: 2, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "binary",
    options: ["binary", "hex", "katakana", "asciiArt"] as const,
    optionsLabels: {
      binary: "binary  (0 1)",
      hex: "hex  (0–F)",
      katakana: "katakana  (アイウエオ…)",
      asciiArt: "ascii-art  (#@%*+-: )",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  cursorBrightness: { type: "number", default: 0.3, min: 0, max: 0.6, step: 0.05, label: "cursor brightness" },
  smokeRadius: { type: "number", default: 0.15, min: 0.02, max: 0.5, step: 0.01, label: "smoke radius" },
  smokeIntensity: { type: "number", default: 0.5, min: 0, max: 2, step: 0.05, label: "smoke influence" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  rain: { colorA: string; speed: number; density: number; trailLength: number; strokeWidth: number }
  cursor?: { brightness: number; smokeColorA: string; smokeColorB: string; smokeRadius: number; smokeIntensity: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("cyber.2.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    rain: {
      colorA: colors.a,
      speed: (controls.speed as number) * speedMul,
      density: controls.density as number,
      trailLength: controls.trailLength as number,
      strokeWidth: controls.strokeWidth as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    cursor: {
      brightness: ctx.controls.cursorBrightness as number,
      smokeColorA: ctx.colors.b ?? ctx.colors.a,
      smokeColorB: ctx.colors.a,
      smokeRadius: ctx.controls.smokeRadius as number,
      smokeIntensity: ctx.controls.smokeIntensity as number,
    },
  }
}

function renderIdle(props: unknown) {
  const p = props as Props
  return (
    <Ascii characters={p.ascii.characters} fontFamily="VT323" cellSize={p.ascii.cellSize} spacing={1} gamma={p.ascii.gamma}>
      <FallingLines
        colorA={p.rain.colorA}
        colorB="transparent"
        angle={90}
        speed={p.rain.speed}
        speedVariance={0.5}
        density={p.rain.density}
        trailLength={p.rain.trailLength}
        strokeWidth={p.rain.strokeWidth}
        rounding={0.2}
        colorSpace="oklch"
      />
    </Ascii>
  )
}

function CodeRainInteractive({ p }: { p: Props }) {
  // Fallback driver: poll pointer position, modulate gamma via state.
  // Replace with shaders.com dynamic prop mapping once the API is confirmed.
  const [gamma, setGamma] = useState(p.ascii.gamma)
  useEffect(() => {
    let raf = 0
    let lastClient = { x: 0.5, y: 0.5 }
    const onMove = (e: PointerEvent) => {
      lastClient = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    }
    const loop = () => {
      // Distance from screen center; closer = brighter (lower gamma).
      const dx = lastClient.x - 0.5
      const dy = lastClient.y - 0.5
      const dist = Math.sqrt(dx * dx + dy * dy)
      const t = Math.max(0, Math.min(1, 1 - dist * 2))
      const next = p.ascii.gamma - p.cursor!.brightness * t
      setGamma((g) => g + (next - g) * 0.2) // smoothing 0.2
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener("pointermove", onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [p.ascii.gamma, p.cursor])

  return (
    <>
      <Ascii characters={p.ascii.characters} fontFamily="VT323" cellSize={p.ascii.cellSize} spacing={1} gamma={gamma}>
        <FallingLines
          colorA={p.rain.colorA}
          colorB="transparent"
          angle={90}
          speed={p.rain.speed}
          speedVariance={0.5}
          density={p.rain.density}
          trailLength={p.rain.trailLength}
          strokeWidth={p.rain.strokeWidth}
          rounding={0.2}
          colorSpace="oklch"
        />
      </Ascii>
      <Smoke
        colorA={p.cursor!.smokeColorA}
        colorB={p.cursor!.smokeColorB}
        emitFrom={{ x: 0.5, y: 0.5 }}
        direction={0}
        speed={5}
        intensity={0.4}
        mouseInfluence={p.cursor!.smokeIntensity}
        mouseRadius={p.cursor!.smokeRadius}
        dissipation={0.4}
        detail={18}
      />
    </>
  )
}

function renderInteractive(props: unknown) {
  return <CodeRainInteractive p={props as Props} />
}

export const cyberCodeRainPair = definePair({
  baseId: "cyber.2",
  label: "Cyber · Code Rain",
  paperName: "Ascii ← FallingLines",
  isAscii: true,
  slots: SLOTS,
  interactiveExtraSlots: INTERACTIVE_EXTRA_SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "repeating-linear-gradient(180deg, transparent 0px, {{a}} 1px, transparent 4px), linear-gradient(180deg, var(--background) 0%, #000 100%)",
})
```

- [ ] **Step 2: Char-sets, register, smoke, commit**

```ts
// char-sets.ts add:
const cyber2 = {
  binary: "01",
  hex: "0123456789ABCDEF",
  katakana: "アイウエオカキクケコ",
  asciiArt: "#@%*+-: ",
}
// "cyber.2.idle": cyber2, "cyber.2.interactive": cyber2
```

```bash
git add src/components/shaders/themed/cyber/2.code-rain.tsx src/components/shaders/themed/char-sets.ts src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): cyber.2 Code Rain (ASCII + cursor-driven gamma)"
```

---

### Task 8.11: `cyber.3` Phosphor Console (ASCII)

**Files:**
- Create: `src/components/shaders/themed/cyber/3.phosphor-console.tsx`
- Modify: `char-sets.ts`, `registry.ts`

- [ ] **Step 1: Write the pair file**

```tsx
// src/components/shaders/themed/cyber/3.phosphor-console.tsx
import { Ascii, CRTScreen, CursorTrail, FlowingGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "primary" },
  c: { kind: "theme", token: "accent" },
  d: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  gradientSpeed: { type: "number", default: 1, min: 0, max: 3, step: 0.05, label: "gradient speed" },
  gradientDistortion: { type: "number", default: 0.8, min: 0, max: 2, step: 0.05, label: "distortion" },
  cellSize: { type: "number", default: 22, min: 16, max: 40, step: 1, label: "cell size" },
  scanlineIntensity: { type: "number", default: 0.55, min: 0, max: 1, step: 0.05, label: "scanlines" },
  colorShift: { type: "number", default: 2.2, min: 0, max: 5, step: 0.1, label: "color shift" },
  vignetteRadius: { type: "number", default: 0.4, min: 0, max: 1, step: 0.05, label: "vignette" },
  gamma: { type: "number", default: 1.1, min: 0.5, max: 2, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "phosphor",
    options: ["phosphor", "loFi", "stark"] as const,
    optionsLabels: {
      phosphor: "phosphor  (@█▓▒░ )",
      loFi: "lo-fi  (█ ▒ ░ )",
      stark: "stark  (█  )",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  trailLength: { type: "number", default: 0.4, min: 0.1, max: 2, step: 0.05, label: "trail length" },
  trailRadius: { type: "number", default: 0.6, min: 0.5, max: 2, step: 0.05, label: "trail radius" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  crt: { scanlineIntensity: number; colorShift: number; vignetteRadius: number }
  gradient: { colorA: string; colorB: string; colorC: string; colorD: string; speed: number; distortion: number }
  trail?: { colorA: string; colorB: string; length: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("cyber.3.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    crt: {
      scanlineIntensity: controls.scanlineIntensity as number,
      colorShift: controls.colorShift as number,
      vignetteRadius: controls.vignetteRadius as number,
    },
    gradient: {
      colorA: colors.a, colorB: colors.b, colorC: colors.c, colorD: colors.d,
      speed: (controls.gradientSpeed as number) * speedMul,
      distortion: controls.gradientDistortion as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    trail: {
      colorA: ctx.colors.d,
      colorB: ctx.colors.b,
      length: ctx.controls.trailLength as number,
      radius: ctx.controls.trailRadius as number,
    },
  }
}

function gradientNode(p: Props) {
  return (
    <FlowingGradient
      colorA={p.gradient.colorA}
      colorB={p.gradient.colorB}
      colorC={p.gradient.colorC}
      colorD={p.gradient.colorD}
      speed={p.gradient.speed}
      distortion={p.gradient.distortion}
      colorSpace="oklch"
    />
  )
}

function renderIdle(props: unknown) {
  const p = props as Props
  return (
    <CRTScreen
      pixelSize={120}
      colorShift={p.crt.colorShift}
      scanlineIntensity={p.crt.scanlineIntensity}
      scanlineFrequency={400}
      brightness={1.15}
      contrast={1.35}
      vignetteIntensity={0.7}
      vignetteRadius={p.crt.vignetteRadius}
    >
      <Ascii characters={p.ascii.characters} fontFamily="JetBrains Mono" cellSize={p.ascii.cellSize} spacing={1} gamma={p.ascii.gamma}>
        {gradientNode(p)}
      </Ascii>
    </CRTScreen>
  )
}

function renderInteractive(props: unknown) {
  const p = props as Props
  return (
    <CRTScreen
      pixelSize={120}
      colorShift={p.crt.colorShift}
      scanlineIntensity={p.crt.scanlineIntensity}
      scanlineFrequency={400}
      brightness={1.15}
      contrast={1.35}
      vignetteIntensity={0.7}
      vignetteRadius={p.crt.vignetteRadius}
    >
      <Ascii characters={p.ascii.characters} fontFamily="JetBrains Mono" cellSize={p.ascii.cellSize} spacing={1} gamma={p.ascii.gamma}>
        {gradientNode(p)}
        <CursorTrail
          colorA={p.trail!.colorA}
          colorB={p.trail!.colorB}
          radius={p.trail!.radius}
          length={p.trail!.length}
          shrink={1}
          colorSpace="oklch"
        />
      </Ascii>
    </CRTScreen>
  )
}

export const cyberPhosphorConsolePair = definePair({
  baseId: "cyber.3",
  label: "Cyber · Phosphor Console",
  paperName: "CRTScreen ← Ascii ← FlowingGradient",
  isAscii: true,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%), repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px), linear-gradient(90deg, {{a}}, {{b}})",
})
```

- [ ] **Step 2: Char-sets, register, smoke, commit**

```ts
// char-sets.ts add:
const cyber3 = { phosphor: "@█▓▒░ ", loFi: "█▒░ ", stark: "█ " }
// "cyber.3.idle": cyber3, "cyber.3.interactive": cyber3
```

```bash
git add src/components/shaders/themed/cyber/3.phosphor-console.tsx src/components/shaders/themed/char-sets.ts src/components/shaders/themed/registry.ts
git commit -m "feat(shaders): cyber.3 Phosphor Console (CRT + ASCII + flow)"
```

---

## Phase 9 — Dev panel UX polish

### Task 9.1: Focus chip in Controls tab

**Files:**
- Modify: `src/components/dev-panel/tabs/controls-tab.tsx`

- [ ] **Step 1: Replace the Controls tab with the focus chip + existing Leva host**

```tsx
// src/components/dev-panel/tabs/controls-tab.tsx
"use client"

import { Leva } from "leva"
import { RotateCcw, Settings2, X } from "lucide-react"

import { useDevPanel, useMountedShaderCount } from "../dev-panel-provider"
import { useShaderOverrides } from "@/components/shaders/themed/use-shader-overrides"
import { getShaderDef, SHADER_REGISTRY } from "@/components/shaders/themed/registry"
import { THEME_SENTINEL, type ShaderId } from "@/components/shaders/themed/types"
import { cn } from "@/lib/utils"

export function ControlsTab() {
  return (
    <div className="flex h-full flex-col">
      <FocusChip />
      <div className="leva-host relative flex-1 overflow-y-auto">
        <Leva
          fill
          flat
          hideCopyButton
          titleBar={false}
          theme={{
            sizes: { rootWidth: "100%", controlWidth: "100px", numberInputMinWidth: "44px" },
            colors: { elevation1: "transparent", elevation2: "transparent", elevation3: "transparent" },
            radii: { sm: "4px", lg: "6px" },
          }}
        />
        <ControlsEmptyState />
      </div>
    </div>
  )
}

function FocusChip() {
  const { focusedShaderId, setFocusedShaderId } = useDevPanel()
  const mountedCount = useMountedShaderCount()

  if (focusedShaderId === null) {
    if (mountedCount === 0) return null
    return (
      <p className="px-2.5 py-1.5 text-[10px] text-muted-foreground">
        {mountedCount} shader{mountedCount === 1 ? "" : "s"} visible · click a tile to focus
      </p>
    )
  }

  const def = getShaderDef(focusedShaderId)
  return (
    <div className="m-1.5 flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
      <div className="flex min-w-0 flex-col">
        <span className="font-mono text-[10px] text-muted-foreground">{focusedShaderId}</span>
        <span className="truncate text-xs font-medium">{def.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <ResetShaderButton id={focusedShaderId} />
        <ResetSlotMenu id={focusedShaderId} />
        <button
          type="button"
          aria-label="Clear focus"
          onClick={() => setFocusedShaderId(null)}
          className="grid size-5 place-items-center rounded transition-colors cursor-pointer hover:bg-muted"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  )
}

function ResetShaderButton({ id }: { id: ShaderId }) {
  const [, , reset] = useShaderOverrides(id)
  return (
    <button
      type="button"
      onClick={reset}
      title="Reset all controls + slots to theme defaults"
      className="grid size-5 place-items-center rounded transition-colors cursor-pointer hover:bg-muted"
    >
      <RotateCcw className="size-3" />
    </button>
  )
}

function ResetSlotMenu({ id }: { id: ShaderId }) {
  const [overrides, patch] = useShaderOverrides(id)
  const def = getShaderDef(id)
  const slotKeys = Object.keys(def.slots)
  return (
    <select
      aria-label="Reset slot to theme"
      defaultValue=""
      onChange={(e) => {
        const key = e.target.value
        if (!key) return
        patch({
          colorSlots: { ...overrides.colorSlots, [key]: THEME_SENTINEL },
        })
        e.target.value = ""
      }}
      className="h-5 cursor-pointer rounded border border-border bg-card px-1 font-mono text-[9px] text-muted-foreground hover:bg-muted"
    >
      <option value="">↺ slot</option>
      {slotKeys.map((k) => {
        const slot = def.slots[k]
        const label = slot.kind === "theme" ? `${k} · ${slot.token}` : `${k} · literal`
        return (
          <option key={k} value={k}>
            {label}
          </option>
        )
      })}
    </select>
  )
}

function ControlsEmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
      <Settings2 className="size-6 opacity-40" />
      <p className="text-xs">
        No controls registered. Open{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">/examples/shaders</code>{" "}
        to focus a shader, or call{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">useDevControls()</code>{" "}
        from a component.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Type-check, smoke, commit**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Verify: focus chip appears when shaders mounted; clicking the X clears focus; the slot dropdown resets a slot back to theme on selection.

```bash
git add src/components/dev-panel/tabs/controls-tab.tsx
git commit -m "feat(dev-panel): focus chip + reset affordances in Controls tab"
```

---

### Task 9.2: "Reset all 24 shaders" in Themes tab

**Files:**
- Modify: `src/components/dev-panel/tabs/themes-tab.tsx`

- [ ] **Step 1: Find the existing actions section (around the Clear localStorage button)**

```bash
grep -n "Clear localStorage\|clearAll\|handleClearClick" src/components/dev-panel/tabs/themes-tab.tsx | head -5
```

- [ ] **Step 2: Add a Reset-All-Shaders button next to the existing one**

In `themes-tab.tsx`, import the helper and add a button inside the actions `section`:

```tsx
import { clearAllShaderOverrides } from "@/components/shaders/themed/use-shader-overrides"
import { SHADER_IDS } from "@/components/shaders/themed/registry"
// ...

// inside the actions <section className="flex flex-col gap-1.5">, alongside the Clear localStorage button:
<Button
  type="button"
  size="sm"
  variant="ghost"
  className="h-7 text-xs"
  onClick={() => clearAllShaderOverrides(SHADER_IDS)}
>
  <RotateCcw className="size-3.5" />
  Reset all 24 shaders
</Button>
```

- [ ] **Step 3: Type-check, smoke, commit**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Verify the new button clears localStorage entries with the `lookbook:shader:` prefix.

```bash
git add src/components/dev-panel/tabs/themes-tab.tsx
git commit -m "feat(dev-panel): Reset-all-shaders button in Themes tab"
```

---

### Task 9.3: Off-showcase `[edit]` chip in `<ThemedShader />`

**Files:**
- Modify: `src/components/shaders/themed/themed-shader.tsx`

- [ ] **Step 1: Add the dev-only edit chip**

Insert after the inner Shader/ShaderFallback markup:

```tsx
// inside the returned <div>:
{process.env.NODE_ENV === "development" && devPanel.open && !devPanel.focusedShaderId && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      devPanel.setFocusedShaderId(id)
      devPanel.setActiveTab("controls")
    }}
    className="absolute right-1.5 top-1.5 z-10 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px] text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
  >
    [edit]
  </button>
)}
```

Where `devPanel = useDevPanel()` is destructured at the top of the function. Wrap the whole `<div>` content's parent with `className="group ..."` if needed (not strictly required since the button has opacity transitions).

Important: this chip is **suppressed inside the showcase tile** (the tile itself is the click target). Suppression is implicit: when `showcase-tile.tsx` is on the page, clicking the tile sets `focusedShaderId`, which hides the chip per the condition above. No extra prop needed.

- [ ] **Step 2: Type-check, smoke, commit**

```bash
pnpm exec tsc --noEmit
pnpm dev
```

Verify: outside the showcase, embedding `<ThemedShader id="..." />` shows an `[edit]` chip on hover when dev panel is open. Click it → that shader becomes focused.

```bash
git add src/components/shaders/themed/themed-shader.tsx
git commit -m "feat(shaders): off-showcase [edit] chip when dev panel is open"
```

---

### Task 9.4: Public `index.ts` for the themed library

**Files:**
- Create: `src/components/shaders/themed/index.ts`

- [ ] **Step 1: Re-export the public API**

```ts
// src/components/shaders/themed/index.ts
export { ThemedShader } from "./themed-shader"
export { ShaderTile } from "./showcase-tile"
export { ShaderFallback } from "./fallback"
export { SHADER_REGISTRY, SHADER_IDS, getShaderDef } from "./registry"
export {
  clearAllShaderOverrides,
  useShaderOverrides,
} from "./use-shader-overrides"
export { useResolvedColors } from "./use-resolved-colors"
export { useShaderPerfMode } from "./use-shader-perf-mode"
export type {
  ShaderId,
  ShaderDef,
  ThemeId,
  StyleOrdinal,
  Variant,
  ColorSlot,
  PerfMode,
  ShaderOverrides,
  SlotOverrides,
  ThemeColorToken,
} from "./types"
export { THEME_SENTINEL } from "./types"
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shaders/themed/index.ts
git commit -m "feat(shaders): public index re-exports for themed library"
```

---

## Phase 10 — Verification + cleanup

### Task 10.1: Full type + build pass

- [ ] **Step 1: Type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Lint**

```bash
pnpm check
```

Expected: clean. Fix any Biome complaints (unused imports, etc.).

- [ ] **Step 3: Production build**

```bash
pnpm build
```

Expected: success. Cache Components / partial prerender warnings are fine; new errors are not.

- [ ] **Step 4: Commit any lint fixes**

```bash
git add -A
git commit -m "chore(shaders): lint fixes after full build"
```

---

### Task 10.2: Manual verification per spec section 17

Open `pnpm dev` in a browser and step through the checklist:

- [ ] **1. Showcase loads at 60fps on the default theme**

Visit `/examples/shaders`. Open Chrome DevTools → Performance tab → record 5 seconds. Verify frame rate stays ≥55fps for the 12 visible tiles.

- [ ] **2. Per-band toggle works**

Click each band's `interactive` toggle. Verify the URL updates (`?cyber=interactive`) and the tile IDs in the footers swap.

- [ ] **3. Theme switching is live**

Click each theme chip (Editorial / SaaS / Bold / Cyber). Every tile updates colors without a reload.

- [ ] **4. Click-to-focus opens the panel**

Click each tile. Verify the dev panel opens to the Controls tab and the focus chip shows the correct ID.

- [ ] **5. Color override persists**

In a focused shader's Leva folder, set a color slot to a custom hex. Refresh the page. The override is still applied. Click the slot's reset entry in the `↺ slot` dropdown. The override clears.

- [ ] **6. Reduced motion**

Toggle the `reduced motion ○` button in the showcase header. Every visible shader slows visibly. For ASCII shaders, glyphs grow larger.

- [ ] **7. Fallback path** (optional, requires WebGL2 disable)

In Chrome flags or via `chrome://flags`, disable WebGL2. Reload `/examples/shaders`. All tiles render their static CSS gradient fallbacks (no animation, colors match theme).

- [ ] **8. Keyboard cycling**

With the dev panel open and shaders visible, press Cmd+] (macOS) or Ctrl+] (other). Focus cycles to the next shader. Cmd+[ cycles back. Escape clears focus.

- [ ] **9. Reset all shaders**

In the Themes tab, click the new "Reset all 24 shaders" button. Refresh. All previously-overridden shaders return to theme defaults.

- [ ] **10. Existing usages unaffected**

Visit `/` (the SaaS home), `/bold`, `/editorial`. The existing hero/CTA shaders (from the unchanged `mesh-gradient.tsx` / `grain-gradient.tsx`) still render correctly. No regressions.

- [ ] **Step 1: If any verification step fails, debug and fix inline. Commit fixes separately for traceability.**

```bash
# example for each fix:
git add <changed files>
git commit -m "fix(shaders): <specific issue>"
```

---

## Self-review

After all phases above:

**1. Spec coverage:** Walk through `docs/superpowers/specs/2026-05-14-theme-shader-system-design.md` section by section. For each numbered requirement, confirm a task exists. The notable mappings:

| Spec § | Task(s) |
|---|---|
| §5 prereq (install `shaders`) | 1.1 |
| §6.1 module layout | 1.2 + all phase 2-9 file creates |
| §6.2 ShaderId | 1.2 |
| §6.3 ShaderDef | 1.2, 6.1 |
| §6.4 definePair | 6.1 |
| §6.5 ThemedShader | 5.2 |
| §7 12 recipes | 6.2, 8.1–8.11 (12 pairs total) |
| §7.5 control envelope | every shader's `*_SCHEMA` |
| §8 theme resolver | 2.1, 3.2, 3.1 |
| §9 perf + fallback | 3.3, 3.4, 5.1 |
| §10 showcase route | 7.1, 7.2 |
| §11 dev panel UX | 4.1, 4.2, 4.3, 4.4, 9.1, 9.2, 9.3 |
| §12 char-set previews | 8.1, 8.5, 8.7, 8.9, 8.10, 8.11 (each ASCII shader updates char-sets.ts) |
| §13 reduced-motion contract | `buildProps` of every shader |
| §15 versioning | `schemaVersion: 1` on every pair |
| §17 verification | 10.2 |

**2. Placeholder scan:** No "TBD", no "TODO", no "implement appropriate X", no "similar to Task N". Every code block is complete.

**3. Type consistency:** Type names match across tasks:
- `ShaderId`, `ShaderDef`, `ColorSlot`, `PerfMode`, `Variant`, `ThemeId` defined in 1.2 and used identically in every subsequent task.
- `useDevControls(group, schema, options?)` signature matches between 4.2 (definition) and 4.4 (caller).
- `useShaderOverrides` returns `[overrides, patch, reset]` triple — used consistently in 4.4, 9.1, 9.3.
- `definePair` signature in 6.1 matches every call in 6.2 and 8.1–8.11.

---

## Execution handoff

Plan complete and saved to [`docs/superpowers/plans/2026-05-14-theme-shader-system.md`](docs/superpowers/plans/2026-05-14-theme-shader-system.md). Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
