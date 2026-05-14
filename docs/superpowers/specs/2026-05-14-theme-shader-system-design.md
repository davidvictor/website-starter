# Theme-aware Shader System

**Status:** Design accepted, ready for implementation plan
**Date:** 2026-05-14
**Author:** David (with assistant)
**Driver:** Add a library of 24 theme-aware WebGPU shaders, addressable as `<theme>.<style>.<variant>`, demoed on `/examples/shaders`, with live controls in the existing dev panel. Half the library leans into ASCII for a tech-forward aesthetic.

---

## 1. Context

The project already ships two thin shader wrappers (`MeshGradient`, `GrainGradient`) from `@paper-design/shaders-react@0.0.76`, used inline in `hero/saas.tsx`, `hero/bold.tsx`, `cta/saas.tsx`, `cta/bold.tsx`. These remain as-is. This spec adds a **separate, complete library** alongside.

The new library is built on the [`shaders`](https://shaders.com) npm package (WebGPU-first, auto-falls-back to WebGL2). That package's `<Shader>` parent + nested-children composition model and its `Ascii`, `MultiPointGradient`, `CRTScreen`, `FallingLines`, `FlowingGradient`, `ChromaFlow`, `CursorRipples`, `Liquify`, `Marble`, `Aurora`, `Plasma`, `ContourLines`, etc. components are the building blocks.

The existing dev panel (Themes / Controls / Nav / Data tabs, opens on `~`) and its `useDevControls(group, schema)` Leva-driven hook are reused; we extend the Controls tab with a focus chip and one new option flag on the hook.

## 2. Goals

- A **24-shader library** addressable by stable ID `<theme>.<style>.<variant>` where `theme ∈ {editorial, saas, bold, cyber}`, `style ∈ {1, 2, 3}`, `variant ∈ {idle, interactive}`.
- Each shader **inherits theme color tokens** by default; users can **override per slot** in the dev panel.
- A **showcase route** `/examples/shaders` displays all 24 in a navigable grid.
- Controls live in the **existing Controls tab**, with one shader's folder visible at a time when focused.
- **Six of twelve shader concepts are ASCII-based** — every theme has ≥1 ASCII shader; cyber goes all-in.
- **60fps** target on a 2020+ laptop; static CSS gradient fallback when neither WebGPU nor WebGL2 is available; reduced-motion concession.

## 3. Non-goals

- Migrating the existing `hero/{saas,bold}.tsx` and `cta/{saas,bold}.tsx` to the new library. Those keep their current `@paper-design/shaders-react` wrappers untouched.
- Cross-device override sync (localStorage only, scoped per browser).
- Preset packs per shader. Each shader file IS its canonical preset. (Multiple named presets per shader is a v2 feature; the registry shape leaves room.)
- A standalone "background only" page-level shader. Library tile usage only — composition into blocks is per-consumer.

## 4. Decisions resolved upfront

| Open question | Resolution |
|---|---|
| 18 vs 24 vs 27 vs 36 | **24** = 4 themes × 3 styles × 2 variants (idle / interactive) |
| Composition vs theme as axis | **Theme.** Cyber is a first-class fourth theme with its own 3 styles |
| Where shaders attach | **Library + showcase.** No automatic wiring. Consumers import individual shaders. |
| Token mapping default | **Brand triplet** (`--primary` / `--accent` / `--brand-accent`); 4th slot fills from `--chart-1`; 5th from `--background` |
| Mouse impl | **Native Interactive components** (`CursorRipples`, `Liquify`, `ChromaFlow`, etc.). One exception (`cyber.2`) uses dynamic prop mapping. |
| Override persistence | **`localStorage`**, keyed by shader ID; invalidated by `schemaVersion` drift |
| Dev-bar location | **Folder inside existing Controls tab** via `useDevControls` (with one new `enabled` flag) |
| Perf target / fallback | **60fps**; library handles WebGPU→WebGL2 fallback internally; we add a **CSS gradient fallback** for no-WebGL2 + reduced-motion damping + IntersectionObserver pause |
| Naming | **Stable ID** = `<theme>.<style>.<variant>` (e.g. `editorial.2.idle`). The underlying shaders.com component used at each ordinal is metadata, not contract |
| Preset packs | **None in v1.** File IS the preset. Versioning via `schemaVersion` on each registry entry |

## 5. Prerequisite — install `shaders` package

```bash
pnpm add shaders
```

- Package: **`shaders`** (latest `2.5.124`, not Paper Design)
- React entry: **`shaders/react`**
- Tech: WebGPU primary with built-in WebGL2 fallback
- All consuming components must be `"use client"`

Keep `@paper-design/shaders-react@0.0.76` in `package.json` for back-compat with existing hero/CTA usages.

## 6. Architecture

### 6.1 Module layout

```
src/components/shaders/                        # existing — keep
  index.ts
  mesh-gradient.tsx          (existing, untouched)
  grain-gradient.tsx         (existing, untouched)

src/components/shaders/themed/                 # NEW — the library
  index.ts                   # public exports
  types.ts                   # ShaderId, ShaderDef, ColorSlot, SlotOverrides
  registry.ts                # SHADER_REGISTRY: Record<ShaderId, ShaderDef>
  define-pair.ts             # helper for declaring an idle + interactive pair
  char-sets.ts               # curated ASCII glyph ramps per shader
  resolve-colors.ts          # pure resolver (slots + overrides + CSSVars → strings)
  use-resolved-colors.ts     # hook bound to theme provider
  use-shader-overrides.ts    # localStorage hook keyed by ShaderId
  use-shader-perf-mode.ts    # full | reduced | fallback
  use-in-view.ts             # IntersectionObserver pause
  use-shader-controls.ts     # wraps useDevControls with enabled flag
  themed-shader.tsx          # <ThemedShader id="..." />
  fallback.tsx               # <ShaderFallback def={...} colors={...} />
  showcase-tile.tsx          # focusable tile used on /examples/shaders
  editorial/
    1.veil.tsx               # exports veilIdle + veilInteractive ShaderDefs
    2.letterpress.tsx        # ASCII
    3.marble.tsx
  saas/
    1.mesh.tsx
    2.flow.tsx
    3.glyph-mesh.tsx          # ASCII
  bold/
    1.aurora.tsx
    2.ascii-plasma.tsx        # ASCII
    3.swirl.tsx
  cyber/
    1.ascii-terrain.tsx       # ASCII
    2.code-rain.tsx           # ASCII
    3.phosphor-console.tsx    # ASCII

src/app/examples/shaders/page.tsx              # REWRITTEN to the showcase
```

Existing dev-panel files touched:
- `src/components/dev-panel/dev-panel-provider.tsx` — add `focusedShaderId` state + setters + Cmd+[ / Cmd+] cycling
- `src/components/dev-panel/hooks/use-dev-controls.ts` — add `options: { enabled?, values? }` (backward-compatible)
- `src/components/dev-panel/tabs/controls-tab.tsx` — add focus chip header + reset buttons + "click a tile to focus" hint
- `src/components/dev-panel/types.ts` — export new types (`ShaderId` re-export point)
- `src/components/dev-panel/index.ts` — re-export new public API

### 6.2 Stable identifier

```ts
type ThemeId = "editorial" | "saas" | "bold" | "cyber"
type StyleOrdinal = 1 | 2 | 3
type Variant = "idle" | "interactive"
type ShaderId = `${ThemeId}.${StyleOrdinal}.${Variant}`
```

There are exactly 24. Style ordinals (1/2/3) are the stable contract — swapping the underlying `shaders.com` component at an ordinal keeps the ID stable; saved localStorage overrides survive.

### 6.3 ShaderDef shape

```ts
type ColorSlot =
  | { kind: "theme"; token: ThemeColorToken }   // resolves via getComputedStyle
  | { kind: "literal"; value: string }           // for shaders that need an exact #000

type ThemeColorToken =
  | "primary" | "accent" | "brand-accent"
  | "background" | "foreground" | "muted" | "muted-foreground"
  | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
  | "destructive" | "success" | "warning" | "info"

type ShaderDef = {
  id: ShaderId
  label: string                       // "Editorial · Letterpress · idle"
  paperName: string                   // "Ascii ← LinearGradient" — informational only
  themeId: ThemeId
  styleOrdinal: StyleOrdinal
  variant: Variant
  isAscii: boolean
  // Each variant declares its OWN slots — interactive variants commonly add slots the idle doesn't read.
  // Example: bold.3.idle uses {a,b}; bold.3.interactive uses {a,b,c} (smoke source color).
  slots: Record<string, ColorSlot>
  schema: DevControlSchema            // existing project type
  schemaVersion: number               // bump on incompatible schema change
  buildProps: (ctx: {
    colors: Record<string, string>
    controls: Record<string, unknown>
    perfMode: PerfMode
  }) => unknown
  renderTree: (props: unknown) => ReactNode      // returns shaders.com tree (inside <Shader>)
  fallbackBackground: string                     // CSS gradient string w/ {{a}}, {{b}}, ... placeholders
}

const SHADER_REGISTRY: Record<ShaderId, ShaderDef>     // 24 entries
const SHADER_IDS: readonly ShaderId[]                  // ordered for showcase
```

### 6.4 `definePair` helper

To enforce that `.idle` and `.interactive` share `slots`, `schemaVersion`, and the *base* of `schema`:

```ts
function definePair(spec: {
  baseId: `${ThemeId}.${StyleOrdinal}`
  label: string                           // e.g. "Bold · Aurora" (variant suffix is appended)
  paperName: string
  isAscii: boolean
  // Base slots shared by both variants. Each variant can extend with its own additions.
  slots: Record<string, ColorSlot>
  idleExtraSlots?: Record<string, ColorSlot>          // rare — slots only used by idle
  interactiveExtraSlots?: Record<string, ColorSlot>   // common — e.g. smoke colorA for bold.3.interactive
  baseSchema: DevControlSchema            // shared base
  interactiveSchema: DevControlSchema     // additions for .interactive (cursor radius, etc.)
  schemaVersion: number                   // shared
  buildIdle: BuildPropsFn
  renderIdle: RenderFn
  buildInteractive: BuildPropsFn
  renderInteractive: RenderFn
  fallbackBackground: string              // shared
}): [ShaderDef, ShaderDef]                // [idle, interactive]
```

Each `<theme>/<n>.<name>.tsx` file declares one `definePair(...)`. The registry is `Object.fromEntries(allPairs.flat().map(d => [d.id, d]))`.

### 6.5 `<ThemedShader />` entry point

```tsx
export function ThemedShader({
  id,
  className,
  style,
}: {
  id: ShaderId
  className?: string
  style?: CSSProperties
}) {
  const def = SHADER_REGISTRY[id]
  if (!def) throw new Error(`Unknown shader id: ${id}`)

  const ref = useRef<HTMLDivElement>(null)
  const colors = useResolvedColors(id, def.slots)
  const inView = useInView(ref, "200px")
  const perfMode = useShaderPerfMode(def.variant)
  const { focusedShaderId } = useDevPanel()
  const isActive = focusedShaderId === id || focusedShaderId === null
  const controls = useShaderControls(id, def.schema, isActive)

  const props = useMemo(
    () => def.buildProps({ colors, controls, perfMode }),
    [def, colors, controls, perfMode]
  )

  return (
    <div ref={ref} className={className} style={style} data-shader-id={id}>
      {perfMode === "fallback" ? (
        <ShaderFallback def={def} colors={colors} />
      ) : inView ? (
        <Shader className="absolute inset-0">
          {def.renderTree(props)}
        </Shader>
      ) : null /* off-screen: paused */}
    </div>
  )
}
```

## 7. The 12 shader recipes

Each theme has 3 styles. Each style has an `idle` and `interactive` variant — 24 total. Color slots reference theme tokens by default; users can override per slot.

### 7.1 Editorial — paper, print, restraint, one accent

ASCII font: **IBM Plex Mono** (matches theme's mono).

#### `editorial.1` Veil
**Composition:** `FlowingGradient` + `Paper` overlay.
**Slots:** a=`--background`, b=`--muted`, c=`--brand-accent`, d=`--muted-foreground`.
**Idle:** `FlowingGradient speed=0.4 distortion=0.6 colorSpace=oklch` + `Paper roughness=0.2 grainScale=1.2 displacement=0.08`.
**Interactive:** wrap `FlowingGradient` in `CursorRipples intensity=3 decay=12 radius=0.6 chromaticSplit=0`; Paper finish unchanged.
**Curated controls:** speed (0-2), distortion (0-2), paper roughness (0-0.5), gradient seed (0-100), `inheritTheme` (bool). Interactive adds: ripple intensity (0-20), ripple radius (0.1-1).
**Fallback CSS:**
```
radial-gradient(at 70% 30%, {{c}} 0%, transparent 55%),
linear-gradient(135deg, {{a}} 0%, {{b}} 100%)
```

#### `editorial.2` Letterpress  ✱ ASCII
**Composition:** `Ascii ← LinearGradient`.
**Slots:** a=`--background`, c=`--brand-accent`.
**Idle:**
```jsx
<Shader>
  <Ascii characters=" .:-=+" fontFamily="IBM Plex Mono" cellSize={45} spacing={0.95} gamma={1.2}>
    <LinearGradient colorA={a} colorB={c} angle={135} colorSpace="oklch" />
  </Ascii>
</Shader>
```
**Interactive:** wrap the inner `LinearGradient` in `GridDistortion intensity=0.4 decay=4 radius=1.2 gridSize=64`.
**Curated controls:** cellSize (24-80), gamma (0.5-2), charSet (preset select: `marks` `. : - = +`, `rule` `─ │ ┼`, `dots` `· : ∶`), gradient angle (0-360), slot color overrides, `inheritTheme`. Interactive adds: distortion intensity (0-2).
**Fallback CSS:** `linear-gradient(135deg, {{a}} 0%, {{c}} 100%)` (no ASCII in fallback — static gradient only).

#### `editorial.3` Marble
**Composition:** `Marble` + thin `FilmGrain`.
**Slots:** a=`--background`, b=`--muted-foreground`, c=`--brand-accent`.
**Idle:** `Marble scale=1.5 turbulence=8 speed=0.04 colorSpace=oklch` + `FilmGrain strength=<luminance-calibrated> bias=2`.
**Interactive:** wrap `Marble` in `Liquify intensity=4 stiffness=8 damping=4 radius=0.6`.
**FilmGrain `strength` auto-calibration:** read the resolved value of `--background` via `getComputedStyle`, parse the OKLCh `l` channel using the project's existing `src/lib/color.ts` helpers (the `--background` token is always an OKLCh string in this project). Strength = `0.32 - 0.27 * l` clamped to `[0.05, 0.32]`. Honors the pro-note rule (light bg → ~0.32, dark bg → ~0.05). Recomputes on theme/mode change since `useResolvedColors` already re-runs.
**Curated controls:** scale (0.5-3), turbulence (0-20), marble speed (0-0.1), grain strength override (0-0.4, defaults to auto-calibrated), 3 slot colors, `inheritTheme`. Interactive adds: liquify intensity (0-20), stiffness (1-30).
**Fallback CSS:**
```
radial-gradient(at 40% 60%, {{c}} 0%, transparent 35%),
linear-gradient(135deg, {{a}} 0%, {{b}} 100%)
```

### 7.2 SaaS — balanced, premium, gradient-forward

ASCII font: **Geist Mono**.

#### `saas.1` Mesh
**Composition:** `MultiPointGradient` (5 anchored points).
**Slots:** a=`--primary` (0.2,0.2), b=`--accent` (0.8,0.15), c=`--brand-accent` (0.85,0.85), d=`--chart-1` (0.15,0.85), e=`--background` (0.5,0.5).
**Idle:** `MultiPointGradient smoothness=2.5`.
**Interactive:** wrap in `CursorRipples intensity=6 decay=8 radius=0.5 chromaticSplit=0.6`.
**Curated controls:** smoothness (0-5), 5 position pickers (each `{ x: 0-1, y: 0-1 }`), 5 slot colors, `inheritTheme`. Interactive adds: ripple intensity, ripple radius.
**Fallback CSS:**
```
radial-gradient(at 20% 20%, {{a}}, transparent 50%),
radial-gradient(at 80% 15%, {{b}}, transparent 50%),
radial-gradient(at 85% 85%, {{c}}, transparent 50%),
radial-gradient(at 15% 85%, {{d}}, transparent 50%),
linear-gradient({{e}}, {{e}})
```

#### `saas.2` Flow
**Composition:** `FlowingGradient` (idle) / `ChromaFlow` (interactive). Same-family swap.
**Slots:** a=`--background`, b=`--primary`, c=`--accent`, d=`--brand-accent`.
**Idle:** `FlowingGradient speed=0.8 distortion=0.7 colorSpace=oklch`.
**Interactive:** replace base with `ChromaFlow baseColor=b upColor=c downColor=d leftColor=--chart-1 rightColor=--chart-2 intensity=1.0 radius=2.5 momentum=28`. Two extra theme tokens become slot overrides for the interactive variant only (left/right colors).
**Curated controls:** speed (0-2), distortion (0-2), 4 slot colors, `inheritTheme`. Interactive adds: intensity (0.5-1.5), radius (0-5), momentum (10-60).
**Fallback CSS:**
```
linear-gradient(135deg, {{a}}, {{b}} 40%, {{c}} 70%, {{d}})
```

#### `saas.3` Glyph Mesh  ✱ ASCII
**Composition:** `Ascii ← MultiPointGradient`.
**Slots:** same 5 as `saas.1`.
**Idle:**
```jsx
<Shader>
  <Ascii characters=". + × ▪ █" fontFamily="Geist Mono" cellSize={38} spacing={1} gamma={1.0}>
    <MultiPointGradient ... smoothness={2.5} />
  </Ascii>
</Shader>
```
**Interactive:** wrap the `Ascii` in `CursorRipples intensity=4 decay=10 radius=0.5 chromaticSplit=0`.
**Curated controls:** cellSize (24-60), smoothness (0-5), 5 position pickers, charSet (`data` `. + × ▪ █`, `dots` `· • ◦ ●`, `blocks` `░ ▒ ▓ █`), gamma (0.5-2), 5 slot colors, `inheritTheme`. Interactive adds: ripple intensity.
**Fallback CSS:** same as `saas.1`.

### 7.3 Bold — Vercel / Replit / Framer energy

ASCII font: **JetBrains Mono**.

#### `bold.1` Aurora
**Composition:** `Aurora`.
**Slots:** a=`--primary` (curtain base), b=`--accent` (core), c=`--brand-accent` (ray tips).
**Idle:** `Aurora intensity=85 curtainCount=4 speed=3.5 waviness=80 rayDensity=35 height=140 colorSpace=oklch`.
**Interactive:** wrap in `CursorRipples intensity=8 decay=6 radius=0.6 chromaticSplit=1.2`.
**Curated controls:** intensity (0-100), curtains (1-4), speed (-10 to 10), waviness (0-200), rayDensity (0-100), height (10-200), 3 slot colors, `inheritTheme`. Interactive adds: ripple intensity, ripple radius, chromatic split.
**Fallback CSS:**
```
radial-gradient(ellipse 80% 50% at 50% 100%, {{c}} 0%, transparent 50%),
radial-gradient(ellipse 60% 40% at 30% 80%, {{b}}, transparent 60%),
linear-gradient(180deg, {{a}} 0%, transparent 100%)
```

#### `bold.2` Ascii Plasma  ✱ ASCII
**Composition:** `Ascii ← Plasma`.
**Slots:** a=`--primary`, b=`--background`.
**Idle:**
```jsx
<Shader>
  <Ascii characters="█▓▒░ " fontFamily="JetBrains Mono" cellSize={26} spacing={1} gamma={1.4}>
    <Plasma colorA={a} colorB={b} density={2.5} speed={1.8} intensity={1.8} warp={0.5} contrast={1.4} balance={55} colorSpace="oklch" />
  </Ascii>
</Shader>
```
**Interactive:** wrap the `Ascii` in `Liquify intensity=6 stiffness=4 damping=3 radius=0.8 edges=mirror`.
**Curated controls:** cellSize (16-50), density (0-4), speed (0-5), warp (0-1), contrast (0-3), gamma (0.5-3), charSet (`blocks` `█ ▓ ▒ ░ `, `digits` `0123456789`, `letters` `MWHEX#-:.`), 2 slot colors, `inheritTheme`. Interactive adds: liquify intensity, stiffness, damping.
**Fallback CSS:**
```
radial-gradient(circle at 50% 50%, {{a}} 0%, transparent 60%),
linear-gradient(135deg, {{b}}, {{a}})
```

#### `bold.3` Swirl
**Composition:** `Swirl` + `Smoke` overlay (interactive only).
**Slots:** a=`--primary`, b=`--accent`, c=`--brand-accent` (smoke colorA).
**Idle:** `Swirl colorA=a colorB=b speed=1.4 detail=1.8 blend=50 colorSpace=oklch`.
**Interactive:** layer `Smoke colorA=c colorB=a emitFrom={0.5,1} direction=0 speed=15 intensity=0.5 mouseInfluence=0.8 mouseRadius=0.2 dissipation=0.3 detail=22` ON TOP of `Swirl`.
**Curated controls:** speed (0-5), detail (0-5), blend (0-100), 2 swirl slot colors, `inheritTheme`. Interactive adds: smoke color (c slot), smoke intensity (0-1), mouseInfluence (0-2), mouseRadius (0.02-0.5).
**Fallback CSS:**
```
radial-gradient(at 60% 40%, {{c}} 0%, transparent 40%),
conic-gradient(from 180deg at 50% 50%, {{a}}, {{b}}, {{a}})
```

### 7.4 Cyber — terminal, neon on near-black, CRT, glitch

All 3 styles are ASCII. ASCII fonts: **JetBrains Mono** (terrain, phosphor), **VT323** (code rain).

#### `cyber.1` Ascii Terrain  ✱ ASCII
**Composition:** `Ascii ← Voronoi`.
**Slots:** a=`--primary` (cell centers), b=`--accent` (cell edges), c=`--background` (cell borders).
**Idle:**
```jsx
<Shader>
  <Ascii characters="#@%*+-: " fontFamily="JetBrains Mono" cellSize={20} spacing={1} gamma={1.0}>
    <Voronoi colorA={a} colorB={b} colorBorder={c} scale={8} speed={0.4} edgeIntensity={0.6} edgeSoftness={0.04} colorSpace="oklch" />
  </Ascii>
</Shader>
```
**Interactive:** wrap the `Ascii` in `GridDistortion intensity=1.2 decay=2.5 radius=1.2 gridSize=48 edges=wrap`.
**Curated controls:** cellSize (12-36), voronoi scale (2-15), voronoi speed (0-2), gamma (0.5-2), charSet (`density` `#@%*+-: `, `sparse` `. : ;`, `blocks` `█ ▓ ▒ ░ `), 3 slot colors, `inheritTheme`. Interactive adds: distortion intensity, distortion radius.
**Fallback CSS:**
```
radial-gradient(at 30% 30%, {{a}}, transparent 40%),
radial-gradient(at 70% 70%, {{b}}, transparent 40%),
linear-gradient(180deg, {{c}}, #000)
```

#### `cyber.2` Code Rain  ✱ ASCII
**Composition:** `Ascii ← FallingLines`.
**Slots:** a=`--primary` (lead color); trail is `transparent`.
**Idle:**
```jsx
<Shader>
  <Ascii characters="01" fontFamily="VT323" cellSize={24} spacing={1} gamma={0.9}>
    <FallingLines colorA={a} colorB="transparent" angle={90} speed={0.8} speedVariance={0.5} density={28} trailLength={0.65} strokeWidth={0.7} rounding={0.2} colorSpace="oklch" />
  </Ascii>
</Shader>
```
**Interactive:** TWO simultaneous effects:
1. **Dynamic prop mapping:** bind `Ascii.gamma` to cursor distance — gamma drops to ~0.6 within cursor radius (brightens chars), returns to 0.9 outside. Use `shaders` library's `smoothing=0.2 momentum=0.2` defaults from the interactions pro-note.
2. Layer `Smoke colorA=--accent colorB=--primary emitFrom={cursor} mouseInfluence=0.5 mouseRadius=0.15 dissipation=0.4` ON TOP of the rain.

**Curated controls:** density (10-40, columns), speed (0-2), trailLength (0.2-1), strokeWidth (0.3-1), cellSize (16-40), gamma (0.5-2), charSet (`binary` `01`, `hex` `0123456789ABCDEF`, `katakana` `アイウエオカキクケコ`, `ascii-art` `#@%*+-: `), 1 slot color, `inheritTheme`. Interactive adds: smoke intensity, mouseRadius, gamma-cursor coupling strength.
**Fallback CSS:**
```
repeating-linear-gradient(180deg, transparent 0px, {{a}} 1px, transparent 4px),
linear-gradient(180deg, var(--background) 0%, #000 100%)
```

#### `cyber.3` Phosphor Console  ✱ ASCII
**Composition:** `CRTScreen ← Ascii ← FlowingGradient` (full vertical stack).
**Slots:** a=`--background`, b=`--primary`, c=`--accent`, d=`--brand-accent`.
**Idle:**
```jsx
<Shader>
  <CRTScreen pixelSize={120} colorShift={2.2} scanlineIntensity={0.55} scanlineFrequency={400} brightness={1.15} contrast={1.35} vignetteIntensity={0.7} vignetteRadius={0.4}>
    <Ascii characters="@█▓▒░ " fontFamily="JetBrains Mono" cellSize={22} spacing={1} gamma={1.1}>
      <FlowingGradient colorA={a} colorB={b} colorC={c} colorD={d} speed={1.0} distortion={0.8} colorSpace="oklch" />
    </Ascii>
  </CRTScreen>
</Shader>
```
**Interactive:** insert `CursorTrail colorA=d colorB=b radius=0.6 length=0.4 shrink=1 colorSpace=oklch` as a sibling of `FlowingGradient` (both inside `Ascii`). The trail's luminance gets sampled into glyphs, then runs through the CRT.
```jsx
<CRTScreen ...>
  <Ascii ...>
    <FlowingGradient .../>
    <CursorTrail .../>           {/* drawn over gradient, then ASCII'd, then CRT'd */}
  </Ascii>
</CRTScreen>
```
**Curated controls:** gradient speed (0-3), gradient distortion (0-2), cellSize (16-40), scanlineIntensity (0-1), colorShift (0-5), vignetteRadius (0-1), gamma (0.5-2), charSet (`phosphor` `@█▓▒░ `, `lo-fi` `█ ▒ ░ `, `stark` `█ `), 4 slot colors, `inheritTheme`. Interactive adds: trail color (d override), trail length (0.1-2), trail radius (0.5-2).
**Fallback CSS:**
```
radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%),
repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px),
linear-gradient(90deg, {{a}}, {{b}})
```

### 7.5 Curated control envelope (applies to all 24)

Every shader's schema follows this template, with shader-specific knobs filling the gaps:

```
┌─ Theme inheritance ──────────────────────────
│  inheritTheme: boolean (default true)
├─ Color slots (per recipe — 1-5 slots) ───────
│  for each slot {key}:
│    {key}Mode: "inherit" | "custom" (default inherit)
│    {key}Custom: color (only rendered when Mode === custom via Leva's `render` prop)
├─ Motion ─────────────────────────────────────
│  speed (recipe-specific range)
│  + recipe knobs: distortion / waviness / warp / intensity / density / etc.
├─ Density / form (1-3 recipe knobs) ──────────
│  scale / levels / dotSize / cells / cellSize / smoothness / etc.
├─ ASCII-only ─────────────────────────────────
│  charSet: select (3-4 curated ramps per shader, label shows glyph preview)
│  gamma: number
├─ Interactive variant only ───────────────────
│  + recipe knobs: ripple intensity / liquify stiffness / smoke radius / etc.
└─ Finish (where recipe uses one) ─────────────
   grainStrength (auto-calibrated, overridable)
```

## 8. Theme resolver + override hook

### 8.1 Resolver (pure, sync)

```ts
// src/components/shaders/themed/resolve-colors.ts

export const THEME_SENTINEL = "__theme__"
export type SlotOverrides = Record<string, string | typeof THEME_SENTINEL>

export function resolveSlotColors(
  slots: Record<string, ColorSlot>,
  overrides: SlotOverrides | undefined,
  computed: CSSStyleDeclaration
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, slot] of Object.entries(slots)) {
    const override = overrides?.[key]
    if (override && override !== THEME_SENTINEL) {
      out[key] = override
      continue
    }
    out[key] = slot.kind === "literal"
      ? slot.value
      : computed.getPropertyValue(`--${slot.token}`).trim() || defaultsFor(slot.token)
  }
  return out
}
```

`defaultsFor(token)` returns a fixed fallback (e.g. `--background` → `"#fafafa"`) so SSR markup is safe and renders correctly before hydration. Defaults mirror the `editorial` light-mode theme.

### 8.2 `useResolvedColors`

Subscribes to the existing theme provider context (NOT a `MutationObserver` — the theme provider already knows when CSS vars change):

```ts
export function useResolvedColors(
  shaderId: ShaderId,
  slots: Record<string, ColorSlot>
): Record<string, string> {
  const { themeId, resolvedMode, isOverridden } = useTheme()
  const [overrides] = useShaderOverrides(shaderId)

  return useMemo(() => {
    if (typeof window === "undefined") return Object.fromEntries(
      Object.entries(slots).map(([k, s]) => [k, s.kind === "literal" ? s.value : defaultsFor(s.token)])
    )
    const computed = getComputedStyle(document.documentElement)
    return resolveSlotColors(slots, overrides.colorSlots, computed)
  }, [slots, overrides.colorSlots, themeId, resolvedMode, isOverridden])
}
```

### 8.3 `useShaderOverrides`

Per-shader `localStorage` slice with schema-version invalidation:

```ts
type ShaderOverrides = {
  v: number                                  // schemaVersion at write time
  controls: Record<string, unknown>
  colorSlots: SlotOverrides
}

const STORAGE_PREFIX = "lookbook:shader:"

export function useShaderOverrides(
  shaderId: ShaderId
): [ShaderOverrides, (patch: Partial<ShaderOverrides>) => void, () => void] {
  const def = SHADER_REGISTRY[shaderId]
  const key = `${STORAGE_PREFIX}${shaderId}`

  const [state, setState] = useState<ShaderOverrides>(() => {
    if (typeof window === "undefined") return empty(def.schemaVersion)
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return empty(def.schemaVersion)
      const parsed = JSON.parse(raw) as ShaderOverrides
      if (parsed.v !== def.schemaVersion) return empty(def.schemaVersion)
      return parsed
    } catch {
      return empty(def.schemaVersion)
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* quota or private mode — silent */
    }
  }, [key, state])

  const patch = useCallback(
    (next: Partial<ShaderOverrides>) =>
      setState(prev => ({ ...prev, ...next, v: def.schemaVersion })),
    [def.schemaVersion]
  )
  const reset = useCallback(() => setState(empty(def.schemaVersion)), [def.schemaVersion])

  return [state, patch, reset]
}

function empty(v: number): ShaderOverrides {
  return { v, controls: {}, colorSlots: {} }
}
```

A coarser "Reset all 24 shaders" iterates `SHADER_IDS` and calls `localStorage.removeItem(STORAGE_PREFIX + id)`.

## 9. Performance + fallback

### 9.1 `useShaderPerfMode`

```ts
export type PerfMode = "full" | "reduced" | "fallback"

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

export function useShaderPerfMode(variant: Variant): PerfMode {
  const reducedMotion = useReducedMotion()        // existing project hook
  const forced = useDevPanel((s) => s.forceReducedMotion) // toggle on showcase
  const [hasGL2, setHasGL2] = useState(true)      // optimistic; corrected post-mount

  useEffect(() => { setHasGL2(detectWebGL2()) }, [])

  if (!hasGL2) return "fallback"
  if (reducedMotion || forced) return "reduced"
  return "full"
}
```

The `shaders` library handles WebGPU → WebGL2 fallback internally. Our `"fallback"` mode triggers ONLY when neither is available (i.e. very old devices, sandboxed iframes). Both `interactive` and `idle` variants degrade identically in reduced-motion (speed halved, ASCII cellSize doubled).

### 9.2 Reduced-motion contract in `buildProps`

Every shader's `buildProps` applies these multipliers when `perfMode === "reduced"`:
- All `speed` props × `0.5`
- All `cellSize` (ASCII) × `2`
- All `intensity` props × `0.7` (where the prop drives perceived motion, e.g. Aurora `intensity`, Plasma `intensity`)
- `interactive` variants effectively render as `idle` (the Interactive component is dropped from the tree)

The "drop the Interactive layer" rule is enforced inside each shader's `renderTree` — it checks `props.perfMode` and conditionally returns the idle subtree.

### 9.3 `useInView` — IntersectionObserver pause

```ts
export function useInView(ref: RefObject<Element>, rootMargin = "200px"): boolean {
  const [inView, setInView] = useState(true)     // SSR-safe default
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

When `inView === false`, `<ThemedShader />` renders an empty sized div (no Shader subtree mounted). The 200px rootMargin warms shaders one viewport before they scroll in.

### 9.4 `<ShaderFallback />`

```tsx
export function ShaderFallback({ def, colors }: { def: ShaderDef; colors: Record<string, string> }) {
  const css = useMemo(() => substituteVars(def.fallbackBackground, colors), [def, colors])
  return (
    <div aria-hidden className="absolute inset-0" style={{ background: css }} />
  )
}

function substituteVars(template: string, colors: Record<string, string>): string {
  return template.replace(/\{\{([a-e])\}\}/g, (_, key) => colors[key] ?? "transparent")
}
```

Fallbacks honor per-shader color overrides because `colors` already accounts for them.

## 10. Showcase route — `/examples/shaders`

Replaces the existing 2-block example page.

### 10.1 Layout

```
┌─────────────────────────────────────────────────────────────
│ Header (sticky)
│   /examples/shaders     [Theme chips: ●Editorial ○SaaS ○Bold ○Cyber]     [reduce motion ○]     [~]
├─────────────────────────────────────────────────────────────
│
│ Editorial                                  [idle ● interactive ○]
│ ┌─────────┬─────────┬─────────┐
│ │ E.1     │ E.2 ✱   │ E.3     │
│ │ Veil    │ Letter. │ Marble  │
│ └─────────┴─────────┴─────────┘
│
│ SaaS                                       [idle ● interactive ○]
│ ┌─────────┬─────────┬─────────┐
│ │ S.1     │ S.2     │ S.3 ✱   │
│ │ Mesh    │ Flow    │ Glyph M │
│ └─────────┴─────────┴─────────┘
│
│ Bold                                       [idle ● interactive ○]
│ ... 3 tiles
│
│ Cyber                                      [idle ● interactive ○]
│ ... 3 tiles — all ✱ ASCII
│
└─────────────────────────────────────────────────────────────
```

- **Per-band variant toggle** stored in URL state: `?editorial=interactive&cyber=idle`. Defaults to `idle` per band on load. Survives reloads, shareable.
- **Theme chips** in the header are equivalent to picking the theme in the Themes tab — they call `setThemeId`. Lets the showcase be used standalone.
- **Reduced-motion toggle** is showcase-local state mirrored into `useDevPanel().forceReducedMotion`. Useful for verifying the degraded behavior without OS toggling.
- **Tile aspect:** 16:10. Grid is 3 columns at `lg`, 2 at `md`, 1 at `sm`.

### 10.2 Tile component (`showcase-tile.tsx`)

```tsx
function ShaderTile({ id }: { id: ShaderId }) {
  const def = SHADER_REGISTRY[id]
  const { focusedShaderId, setFocusedShaderId, setOpen, setActiveTab } = useDevPanel()
  const isFocused = focusedShaderId === id

  return (
    <button
      type="button"
      data-focused={isFocused}
      onClick={() => {
        setFocusedShaderId(isFocused ? null : id)
        if (!isFocused) {
          setOpen(true)
          setActiveTab("controls")
        }
      }}
      className={cn(
        "group relative aspect-[16/10] overflow-hidden rounded-lg border border-border text-left transition-shadow cursor-pointer",
        "hover:shadow-[var(--shadow-raised)]",
        "data-[focused=true]:ring-2 data-[focused=true]:ring-ring data-[focused=true]:ring-offset-2 data-[focused=true]:ring-offset-background"
      )}
    >
      <ThemedShader id={id} className="absolute inset-0" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 font-mono text-[10px] text-white">
        <span>{id}</span>
        <span className="flex items-center gap-1">
          {def.isAscii && <span className="rounded bg-white/15 px-1 py-0.5 tracking-wider">ASCII</span>}
          <span>{def.paperName}</span>
        </span>
      </span>
    </button>
  )
}
```

### 10.3 Page component

```tsx
"use client"

export default function ShadersExamplePage() {
  const [variants, setVariants] = useUrlBandVariants() // 4 bands → "idle" | "interactive"
  return (
    <main>
      <ShowcaseHeader />
      {(["editorial","saas","bold","cyber"] as const).map(theme => (
        <ThemeBand
          key={theme}
          theme={theme}
          variant={variants[theme]}
          onVariantChange={v => setVariants({ ...variants, [theme]: v })}
        />
      ))}
    </main>
  )
}
```

URL state is encoded as a small search-params helper; `useUrlBandVariants` reads `useSearchParams()` and pushes to `next/navigation`'s `router.replace`.

## 11. Dev panel UX

### 11.1 New state in `DevPanelProvider`

```ts
type DevPanelContextValue = {
  // existing fields...
  focusedShaderId: ShaderId | null
  setFocusedShaderId: (id: ShaderId | null) => void
  cycleFocus: (dir: 1 | -1) => void          // Cmd+] / Cmd+[ (macOS) or Ctrl+]/[ elsewhere
  forceReducedMotion: boolean
  setForceReducedMotion: (v: boolean) => void
  // Mounted-shader registry (mirrors the existing dataProbes Map<string, DevDataEntry> pattern)
  mountedShaders: ReadonlySet<ShaderId>
  registerMountedShader: (id: ShaderId) => void
  unregisterMountedShader: (id: ShaderId) => void
}
```

`cycleFocus` iterates over `mountedShaders` in ID-sort order. Stepping past the end clears focus (returns to null). `<ThemedShader />` calls `registerMountedShader(id)` on mount and `unregisterMountedShader(id)` on unmount, mirroring the existing `registerData` / `unregisterData` pattern in the provider.

A small selector helper, `useMountedShaderCount()`, is exported from `dev-panel-provider.tsx`:
```ts
export function useMountedShaderCount(): number {
  return useDevPanel().mountedShaders.size
}
```

### 11.2 Modified `useDevControls`

Backward-compatible signature extension. Old calls keep working unchanged.

```ts
export function useDevControls<S extends DevControlSchema>(
  group: string,
  schema: S,
  options?: { enabled?: boolean; values?: Record<string, unknown> }
): DevControlValues<S> {
  const enabled = options?.enabled ?? true
  const externalValues = options?.values

  // Only build/register the folder when enabled
  const folderSchema = useMemo(() => {
    if (!enabled) return null
    /* existing folder-building logic */
  }, [enabled, group, schema])

  const levaValues = useControls(folderSchema as never, [enabled]) as Record<string, unknown> | undefined

  return useMemo(() => {
    if (!enabled || !levaValues) {
      return mergeDefaultsWithExternal(schema, externalValues ?? {})
    }
    /* existing values-mapping logic */
  }, [enabled, externalValues, schema, levaValues])
}
```

`mergeDefaultsWithExternal` is a small helper: starts from schema defaults, layers `externalValues` on top, applies `vec3` shape normalization.

### 11.3 `useShaderControls`

```ts
export function useShaderControls(
  shaderId: ShaderId,
  schema: DevControlSchema,
  isActive: boolean
): DevControlValues<typeof schema> {
  const [overrides, patch] = useShaderOverrides(shaderId)
  const def = SHADER_REGISTRY[shaderId]

  const values = useDevControls(`Shader · ${def.label}`, schema, {
    enabled: isActive,
    values: overrides.controls,
  })

  useEffect(() => {
    if (!isActive) return
    patch({ controls: values })
  }, [isActive, values, patch])

  return values
}
```

### 11.4 Color slot UI in Leva

For each color slot, the schema generates two Leva inputs that work together. Leva's `render` prop hides the custom input when in inherit mode:

```ts
// generated for each color slot {key}
const slotSchema = {
  [`${key}Mode`]: {
    type: "select",
    default: "inherit",
    options: ["inherit", "custom"] as const,
    label: `${slotLabel} · source`,
  },
  [`${key}Custom`]: {
    type: "color",
    default: "#000000",
    label: `${slotLabel} · color`,
    // render is passed through to Leva; the existing useDevControls hook
    // extension supports this passthrough for select-conditional rendering
  },
}
```

Resolver behavior in `useResolvedColors`:
- If `overrides.colorSlots[key]` is undefined OR equals `THEME_SENTINEL` → resolve from theme token
- If it's a hex string → use the hex

Sync from Leva: when `${key}Mode === "custom"`, the override write is `colorSlots[key] = controls[`${key}Custom`]`. When `inherit`, the override write is `colorSlots[key] = THEME_SENTINEL`.

`useDevControls` gains an additive `renderIf` field on `DevControlSpec` (string referencing another spec key + an equality target):

```ts
// types.ts extension — backward compatible
type DevControlSpec = (
  | { type: "number"; default: number; min?: number; max?: number; step?: number; label?: string }
  | { type: "boolean"; default: boolean; label?: string }
  | { type: "string"; default: string; label?: string }
  | { type: "color"; default: string; label?: string }
  | { type: "select"; default: string; options: readonly string[]; label?: string;
      // NEW (optional): label-overrides for each option value, shown in Leva
      optionsLabels?: Record<string, string> }
  | { type: "vec3"; default: [number, number, number]; label?: string }
) & {
  // NEW (optional): conditionally render this control based on another spec's current value
  renderIf?: { key: string; equals: string | number | boolean }
}
```

The mapper in `use-dev-controls.ts` translates `renderIf` into Leva's `render: (get) => get(otherKey) === equals` at the input level. Existing usages (no `renderIf`, no `optionsLabels`) compile unchanged.

### 11.5 Controls tab header — focus chip + reset affordances

`ResetShaderButton`, `ResetSlotMenu`, and `useMountedShaderCount` are small components/hooks defined in the same `controls-tab.tsx` file (or a `_components` sub-folder). Their contracts:

- `<ResetShaderButton id={ShaderId}/>` — calls the third item from `useShaderOverrides(id)` (the `reset` callback)
- `<ResetSlotMenu id={ShaderId}/>` — dropdown listing the shader's slots; selecting one writes `colorSlots[key] = THEME_SENTINEL` via `useShaderOverrides`
- `useMountedShaderCount()` — selector over `useDevPanel().mountedShaders.size`

Implementation sketch:

```tsx
function ControlsTab() {
  const { focusedShaderId, setFocusedShaderId } = useDevPanel()
  return (
    <div className="flex h-full flex-col">
      <FocusedShaderChip />
      <div className="leva-host relative flex-1 overflow-y-auto">
        <Leva {/* existing config */} />
        <ControlsEmptyState />
      </div>
    </div>
  )
}

function FocusedShaderChip() {
  const { focusedShaderId, setFocusedShaderId } = useDevPanel()
  const mountedCount = useMountedShaderCount()
  if (!focusedShaderId) {
    if (mountedCount === 0) return null
    return (
      <p className="px-2.5 py-1.5 text-[10px] text-muted-foreground">
        {mountedCount} shader{mountedCount === 1 ? "" : "s"} visible · click a tile to focus
      </p>
    )
  }
  const def = SHADER_REGISTRY[focusedShaderId]
  return (
    <div className="m-1.5 flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
      <div className="flex min-w-0 flex-col">
        <span className="font-mono text-[10px] text-muted-foreground">{focusedShaderId}</span>
        <span className="text-xs font-medium">{def.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <ResetShaderButton id={focusedShaderId} />
        <ResetSlotMenu id={focusedShaderId} />
        <button onClick={() => setFocusedShaderId(null)} className="grid size-5 place-items-center rounded hover:bg-muted">
          <X className="size-3" />
        </button>
      </div>
    </div>
  )
}
```

### 11.6 Keyboard

Extend the existing `keydown` handler in `DevPanelProvider`:
- `~` / `` ` ``: open/close panel (existing)
- `Escape`: close panel OR clear focus if panel open (extend existing)
- `Cmd+]` / `Cmd+[` on macOS, `Ctrl+]` / `Ctrl+[` on other platforms: cycle `focusedShaderId` forward/back across mounted shaders (new; dev-only, only when panel is open). Detected via `navigator.platform.toLowerCase().includes("mac")`.

### 11.6.5 Off-showcase shader focus

When a `<ThemedShader />` is used outside the showcase (e.g. embedded in a block someday), a small `[edit]` chip appears top-right of the shader **only in dev mode** when the dev panel is open. Clicking it sets `focusedShaderId`. The chip is added inside `themed-shader.tsx` and gated on `process.env.NODE_ENV === "development" && devPanel.open`. The chip does NOT appear in the showcase route (the whole tile is the click target there).

### 11.7 Themes tab additions

Add a "Reset all 24 shaders" button alongside the existing `Clear localStorage` button. Click iterates `SHADER_IDS` and removes the `lookbook:shader:<id>` entries.

## 12. Character-set previews in Leva

Each ASCII shader's `charSet` is a `select` with 3-4 named ramps. The dev panel's existing `select` mapping shows the option value; we extend it so the visible option label can be `"<name>  (<glyph preview>)"`.

Schema shape:
```ts
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
}
```

The mapping is then resolved through a `char-sets.ts` lookup at render time:

```ts
// char-sets.ts
export const CHAR_SETS = {
  "editorial.2": {
    marks: " .:-=+",
    rule: "─│┼",
    dots: "·:∶",
  },
  "saas.3": { ... },
  "bold.2": { ... },
  "cyber.1": { ... },
  "cyber.2": { binary: "01", hex: "0123456789ABCDEF", katakana: "アイウエオカキクケコ", asciiArt: "#@%*+-: " },
  "cyber.3": { ... },
} as const
```

`buildProps` reads `controls.charSet` and looks up the actual string in `CHAR_SETS[shaderId][controls.charSet]`. This means: schema/select stays small (1 control); the actual glyph strings are co-located with the shader.

The `useDevControls` extension to support `optionsLabels` is small: when `spec.type === "select"` and `spec.optionsLabels` is present, the Leva input is registered with `options: { [optionsLabels[k] ?? k]: k }` form. Backward-compatible.

## 13. Reduced-motion fallback contract

Across all 24:
- When `prefers-reduced-motion: reduce` OR `forceReducedMotion`:
  - `idle` variant: `speed × 0.5`, ASCII `cellSize × 2`, motion-driving `intensity × 0.7`
  - `interactive` variant: degrades to its `idle` subtree at the same reduced settings (no cursor coupling)
- When neither WebGPU nor WebGL2 is available:
  - Render `<ShaderFallback />`: static CSS gradient with substituted theme colors

The fallback gradient template is the visual "still photograph" of the shader — same color palette, no animation.

## 14. Open questions resolved

| Question (from prompt) | Answer |
|---|---|
| 18 vs 27 | Neither — 24 (4 themes × 3 styles × 2 variants) |
| Control schema | Existing `DevControlSchema` extended with `options.optionsLabels` and per-spec `levaMeta` for `render`. Uniforms map 1:1 to shaders.com props inside each shader's `buildProps`. |
| Theme → shader mapping | Brand triplet by default (`--primary` / `--accent` / `--brand-accent`); 4th slot `--chart-1`; 5th slot `--background`. Some shaders override (e.g., editorial uses background/muted-foreground pair). |
| Override persistence | `localStorage` per shader ID, schema-version-invalidated |
| Dev-bar grouping / presets / reset | One folder per shader inside Controls tab; focus chip scopes to one shader; per-shader and per-slot reset; "Reset all" in Themes tab |
| Perf target / fallback | 60fps on 2020+ laptop; shaders.com auto-fallback WebGPU→WebGL2; our static CSS fallback for no-WebGL2; reduced-motion halves speeds + doubles ASCII cellSize + drops interactive layer |
| Mouse interface | Native Interactive components from shaders.com (`CursorRipples`, `Liquify`, `CursorTrail`, `Smoke`, etc.). One use of dynamic prop mapping for `cyber.2` |
| Naming / IDs | `<theme>.<style>.<variant>`; style ordinal is stable contract; underlying component is metadata |
| Preset packs per mode | None in v1. File is the preset. Registry leaves room for a future `presets: Record<string, Partial<Schema>>` field per shader |

## 15. Versioning + migration

- `schemaVersion` is a `number` on each `ShaderDef`. Initial = `1` for all 24.
- When a shader's schema changes incompatibly (add/remove a control slot, change a slot's type), bump its `schemaVersion`.
- The `useShaderOverrides` hook compares stored `v` to current `schemaVersion`; mismatch → discard stored, return empty.
- Compatible changes (add control with sensible default, widen a `min`/`max`) do NOT bump version. The default-merge logic in `useShaderControls` handles missing keys.
- The stable ID (`editorial.2.idle`) is the contract. Swapping the underlying shaders.com component at a style ordinal keeps the ID; users keep their overrides (assuming the slot count is unchanged).

## 16. Out of scope / v2 notes

- **Multiple named presets per shader.** Add a `presets` field on `ShaderDef`, surface a preset picker above the control folder.
- **Cross-device override sync.** Add a server-action that writes overrides into a new section of `themes/registry.json` keyed by theme + shader, alongside the existing color tokens.
- **Migrating existing hero/CTA shaders** to the new library. The existing `MeshGradient`/`GrainGradient` wrappers work; migration is a separate PR.
- **Custom font loading for `Ascii.fontFamily`.** The library ships its own font loader; if we need to load a font the library doesn't bundle, that's a v2 feature.

## 17. Verification plan

After implementation:

1. `pnpm dev` — `/examples/shaders` renders 12 tiles (per default `idle` state on every band) at 60fps in Chrome on a 2020+ laptop.
2. Toggle every per-band `idle | interactive` — the corresponding tiles swap, IDs in tile footers update.
3. Cycle through all 4 themes via the chips. Every shader updates colors live (no reload).
4. Click each tile → dev panel opens to Controls tab, focus chip shows that shader's ID, the folder reveals the curated controls.
5. Override a color slot via Leva → page updates immediately; refresh → override persists; "Reset slot" → returns to theme value.
6. Toggle the showcase's reduced-motion control → every shader visibly slows; ASCII glyphs become larger; interactive variants stop responding to cursor.
7. In Chrome DevTools, set Device → "Low-end mobile" with WebGL2 disabled via `chrome://flags` (or simulate) → all tiles fall back to CSS gradients.
8. `pnpm build` succeeds with no `cacheComponents` regressions.
9. `pnpm check` passes (Biome + polish guards).
