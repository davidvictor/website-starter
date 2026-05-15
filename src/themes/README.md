# `src/themes/` — theme system handbook

> The controller-driven theme derivation engine. Sensitive code; read this before editing.

## Controller inputs

Every theme on this site is derived from a small controller surface:

- **Primary** — a hex color. The brand's primary hue.
- **Accent** — a hex color, OR an anchor relative to primary (`+30°` / `+120°` / `+180°` / `−60°`).
- **Warmth** — a number in `[-1, +1]`. Negative = cooler neutrals, positive = warmer neutrals.
- **Preset** — one of the configured presets. The preset chooses a `DerivationProfile` (chroma boost, contrast band, accent usage, radius, font choices).

The dev panel (toggle with `~`) is the runtime interface for these inputs.

## Files

| File | Role | Edit posture |
|---|---|---|
| `derive.ts` | Public derivation entry. `deriveTokens(inputs, derivation, mode) → ColorTokens` + `deriveShadows(...)` | Sensitive |
| `tokens.ts` | The canonical color token registry — adds/renames tokens flow through here | Sensitive |
| `derivation-axes.ts` | The discrete axes (`chromaBoost`, `contrast`, `semanticIntensity`, `accentUsage`, `radius`) | Sensitive |
| `registry.ts` | Loads `registry.json`, exposes `baseThemes`, `presetsById`, `findPreset`, `findTheme` | Sensitive |
| `registry.json` | The built-in presets + any custom themes copied back from the dev panel | Care |
| `types.ts` | Re-exports the `ColorTokens` contract + radii/shadow shapes | Sensitive |
| `controller-types.ts` | `ControllerInputs` + `DerivationProfile` + `ControllerTheme` shapes — drives dev panel typing | Sensitive |

## The pipeline

```
ControllerInputs (primary, accent, warmth)
        +
DerivationProfile (chromaBoost, contrast, semanticIntensity,
                   accentUsage, radius, fonts)
        |
        v
deriveTokens()      ← derive.ts
  - Resolves Primary OKLCH via vibrancy curve, applies chromaBoost
  - Resolves Accent — either free hue or anchored to primary
  - Computes neutral palette from warmth + contrast band (low/medium/high)
  - Generates semantic colors with fixed hues (success 145°, warning 70°,
    destructive 25°, info 215°), chroma scaled by semanticIntensity
  - Picks foregrounds via luminance, not hand-tuning
        |
        v
ColorTokens object → CSS variables on <html> → entire site rerenders
```

## Accessibility

Every preset is held to WCAG 2.2 AA on text pairs (≥ 4.5:1) and 1.4.11
on UI components (≥ 3.0:1). Anything below shows up:

- as a red row on [`/accessibility`](../app/(internal)/accessibility) — the overview page,
- as an amber chip at the top of the **Themes** tab in the dev panel.

The pair catalog lives in [`a11y.ts`](a11y.ts). Adding a new color
token to [`tokens.ts`](tokens.ts) is one entry there; if the token is
text-bearing or interactive, also add it to the catalog so it's audited.

Foreground colors for filled surfaces (`primaryForeground`,
`accentForeground`, etc.) are picked by **measured contrast** in
`foregroundFor(bg)` — there is no L threshold. Brand colors (`primary`,
`accent`) are tone-adjusted per mode via `tuneBrandForMode` so they
clear AA against the mode's background.

`pnpm audit:a11y` runs the runtime-backed audit suite from the command line; it
exits non-zero on any failure and is part of CI.

## What's safe to do

- **Tune an existing preset** — edit the matching entry in `registry.json`. Each `themes[]` entry has `inputs` (Primary hue+vibrancy, Accent hue+vibrancy+anchor, Warmth) and a `derivation` (`chromaBoost`, `contrast`, `semanticIntensity`, `accentUsage`, `radius`, `fonts`, `routeTransition`). Toggle values and reload.
- **Add a new preset** — append a new entry to `themes[]` in `registry.json`. Pick a unique `id` (e.g., `minimal`, `editorial-dark`). The dev panel surfaces it as a chip automatically.
- **Save a custom theme via the dev panel** — open `~`, tune inputs, then copy the JSON from the panel and commit it into `registry.json`. Runtime edits persist in localStorage only.
- **Add a new semantic color** — bracket case. If the brand needs (say) a `brand-tertiary` token, the cleanest path is: add it to the registry in `tokens.ts`, derive it in `derive.ts` / `deriveColorTokens`, and expose it as a CSS variable in `src/app/globals.css`.

## What requires careful change

- **`derive.ts`** is **pure** and consumed by every rendered surface. Changes here need:
  - A unit test in `src/themes/__tests__/derive.test.ts` covering the new behavior.
  - A manual sanity check at `/sandbox` (the design-system reference) and `/variants` (every block × every style, both under the noindexed internal route group).
  - Verification that the built-in presets still produce distinct, sensible token output.
- **`types.ts`** and **`controller-types.ts`** are the contract. Renaming or removing fields breaks both the dev panel and every CSS variable consumer (which is everything). Avoid; if unavoidable, do it in one PR with the rename rippling through every consumer.

## How to add a new built-in preset

Append a new entry to `themes[]` in `src/themes/registry.json`:

```json
{
  "id": "minimal",
  "name": "Minimal",
  "description": "Stripped-back, single-accent, generous whitespace.",
  "presetId": "minimal",
  "inputs": {
    "primary": { "hue": 210, "vibrancy": 35 },
    "accent": { "hue": 210, "vibrancy": 70, "anchor": "free" },
    "warmth": 0.1
  },
  "derivation": {
    "chromaBoost": 0.6,
    "contrast": "high",
    "semanticIntensity": 0.7,
    "accentUsage": "rare",
    "radius": "0.25rem",
    "fonts": {
      "sans": "geist-sans",
      "mono": "geist-mono",
      "heading": "instrument-serif"
    },
    "routeTransition": "none"
  }
}
```

The dev panel picks this up automatically; the new preset appears as a chip on next reload.

## How to retune an existing preset

Open the dev panel (`~`), pick the preset, adjust Primary / Accent / Warmth / Advanced inputs until it looks right, then copy the resolved JSON from the panel into `registry.json`. The panel persists runtime edits to localStorage so you can keep tuning locally, but source-control persistence is still a code edit.

When tuning a built-in preset that should ship for **every** project cloning this base, commit the change to `registry.json`. When tuning for **this project only**, do the same - but be aware that future merges from the upstream starter may conflict with your project-specific edits.

## Invariants for the theme system

- **No hex literals outside this folder + `src/lib/color.ts`.** Component code reads CSS variables (`var(--primary)` or `bg-primary`).
- **No `if (theme === ...)` branches in components.** If a component needs to look different in `bold` vs `editorial`, it's a sign the *variant* should be different — not the component's internal logic.
- **The OKLCH math is the source of truth.** Don't manually pre-compute hex colors for "performance"; the engine is already fast enough that the cost is invisible.

## Testing the theme system

Two layers:

- **Unit tests** in `__tests__/derive.test.ts`. Cover: determinism, range, preset stamping, warmth swing, hex round-trip stability.
- **Visual smoke** at `/variants` and `/sandbox` after any change. The block gallery and built-in presets give a wide visual surface that catches regressions you'd otherwise miss; these routes are reference surfaces, not sitemap entries.

## Common pitfalls

- **Tweaking `derive.ts` to fix a single block's color.** That's almost always a sign the block should consume a different token, not that the derivation is wrong.
- **Adding a "manual override" path that bypasses derivation.** The whole point is that every color comes from the controller inputs. Overrides defeat the contract.
- **Adding more inputs to make tuning easier.** Resist. The system's power is in *fewer* inputs that combine in interesting ways, not more inputs with more knobs.

## See also

- The README has the high-level starter overview and setup flow.
- `docs/UI_POLISH.md` documents the polish primitives (motion, surfaces, etc.) that consume these tokens.
- ADRs in `docs/adr/` capture the design decisions behind the system.
