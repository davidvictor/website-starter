# 0019 — Theme accessibility enforcement

**Status:** Accepted (2026-05-14)

## Decision

The theme derivation engine enforces **WCAG 2.2** contrast as a hard floor across all presets and modes:

| Pair type | Minimum contrast | Standard |
| --- | --- | --- |
| Text on background (any size used in body copy) | 4.5:1 | WCAG 2.2 AA (1.4.3) |
| UI components (focus rings, control borders, icons that carry meaning) | 3.0:1 | WCAG 2.2 AA (1.4.11) |
| Decorative borders, dividers, hairlines | exempt | not informational |

A standalone audit (`pnpm audit:a11y`) runs the entire pair catalog (see [`src/themes/a11y.ts`](../../src/themes/a11y.ts)) against every built-in preset in both light and dark mode. It is part of CI and exits non-zero on any failure.

## Why

Before this change there was no enforcement. Per-preset audits revealed that every default theme failed at least one text pair in at least one mode — `mutedForeground` on `muted`, brand text on `card`, or accent text on `background`. Hand-tuning each preset to compliance was fragile: any future input change (warmth, chromaBoost, contrast band) could silently regress.

The controller-driven system claims that every color is derived from the theme inputs. If accessibility requires hand-tuned overrides per preset, that claim breaks. Better to make the engine itself produce AA-compliant output by construction.

## How the engine guarantees the floor

Three mechanisms:

1. **`foregroundFor(bg)`** — picks foreground luminance by **measured** contrast against the background, not by a fixed L threshold. If white passes 4.5:1, use white; else black. This replaces `L > 0.5 → black` style heuristics that fail on chromatic backgrounds.
2. **`tuneBrandForMode(brand, bg, mode)`** — combined-constraint solver. For each brand color (primary, accent), it tones the L value until BOTH constraints hold: brand-vs-bg clears the UI floor (3.0) AND `foregroundFor(brand)` clears the text floor (4.5) against the brand itself. A brand color that can't be a button background isn't useful.
3. **Input border vs decorative border** — split into two tokens. The decorative border stays low-contrast for hairlines and dividers. The input/control border is auto-derived to clear 3.0:1 against its surface so form fields remain perceivable.

The pair catalog in `a11y.ts` is the contract: any new color token added to `tokens.ts` that is text-bearing or interactive must also be listed there, or the audit doesn't cover it.

## Consequences

- **Small visual drift in vivid presets.** Cyber-light's brand cyan is darkened to a deeper teal in light mode so 4.5:1 holds against white. Brand identity stays recognizable; the saturation reduction is bounded by the tuning solver, not arbitrary.
- **No per-preset hand-tuning needed.** New presets get AA for free as long as they go through the engine. Future custom themes saved from the dev panel are also covered.
- **Live indicator in the dev panel.** The Themes tab shows an amber chip when the active preset has any failing pair in the current mode, so authors see the regression while editing.
- **`/accessibility` overview page.** Renders the full matrix of preset × mode × pair → contrast ratio, with red rows for failures. The page is the single source of truth for "is the theme compliant right now".
- **CI gate.** `pnpm audit:a11y` runs after `pnpm test` and before `pnpm build`. A theme regression fails CI just like a test does.

## How to apply

- Adding a new text-bearing or interactive token → add an entry to the pair catalog in `src/themes/a11y.ts`.
- Adjusting brand color saturation or hue → run `pnpm audit:a11y` locally; the engine will tone for you, but the audit confirms.
- Adding a new preset → no special action. The engine handles it. The audit will catch any pair the engine can't solve.
- Decorative-only color (purely cosmetic hairline, never carries meaning) → omit from the pair catalog. Don't game the catalog by classing meaningful borders as "decorative".

## When to revisit

- WCAG 3.0 lands as a stable recommendation → consider migrating from sRGB contrast to APCA. The pair catalog stays; the math behind `contrastRatio` swaps.
- AAA gating becomes a project requirement → bump the floor to 7.0/4.5 in the audit. The engine likely needs a more aggressive `tuneBrandForMode` solver or accepts brand-color desaturation.
- A new preset family wants intentionally low-contrast aesthetics (e.g. "monotone") → make the audit per-pair severity-aware, not per-preset. Don't add per-preset exemptions.
