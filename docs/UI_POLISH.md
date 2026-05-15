# UI polish system

This is the rule set that keeps lookbook feeling crafted. Every decision is captured as an ADR in [`docs/adr/`](adr/) — this doc is the operator's manual for applying them.

## Quick reference

| Principle | How |
| --- | --- |
| Concentric radius | `outerRadius = innerRadius + padding`. Use [`useConcentric`](../src/components/motion/use-concentric.ts) for dynamic cases. |
| Font smoothing | `antialiased` on root `<html>` (already applied in [layout.tsx](../src/app/layout.tsx)). |
| Tabular numbers | `<span className="tabular">{n}</span>` — see [ADR 0004](adr/0004-tabular-nums.md). |
| Text wrapping | Headings: `text-wrap: balance` (global). Body: `text-wrap: pretty` (global). |
| Image outlines | `className="image-outline"` — adapts to light/dark. |
| Scale on press | `<Press render={…} />` or `Button` (both stack `translate-y-px` + `scale(0.98)`). |
| Hit areas | `data-touch` on compact controls expands to 40×40 invisibly. |
| Interruptible animations | All motion via `motion/react` or CSS transitions on specific properties. Never `transition-all`. |
| Spring tiers | `SPRING_MICRO` / `SPRING_STANDARD` / `SPRING_MACRO` from [`@/components/motion/springs`](../src/components/motion/springs.ts). |
| Reduced motion | Macro motion respects `prefers-reduced-motion`; micro doesn't. See [ADR 0011](adr/0011-reduced-motion.md). |

## Surface treatment per variant

See [ADR 0003](adr/0003-surface-treatment.md).

| Variant | Card / surface |
| --- | --- |
| editorial | Minimal — no border, optional `border-b border-border/40` divider only |
| saas | `ring-1 ring-foreground/10` + `shadow-[var(--shadow-subtle)]` |
| bold | `border border-border` (1px hard edge) |

## Shadow tokens

Theme-driven shadow scale. See [ADR 0003](adr/0003-surface-treatment.md). Tokens emit from [src/themes/registry.ts](../src/themes/registry.ts) via `deriveShadows()`; the defaults live in [src/themes/types.ts](../src/themes/types.ts).

| Token | CSS var | Use |
| --- | --- | --- |
| `subtle` | `var(--shadow-subtle)` | Card tiles, raised list items |
| `raised` | `var(--shadow-raised)` | Card body, popovers, dropdowns, menus |
| `overlay` | `var(--shadow-overlay)` | Dialogs, sheets, drawers, modals |

## Motion primitives

All live in [`src/components/motion/`](../src/components/motion):

| Primitive | Use |
| --- | --- |
| `FadeIn` | Scroll-in fade + 16px upward translate (tween, runs once) |
| `Stagger` | Stagger children with 80ms gap (tween) |
| `Press` | base-ui `useRender` wrapper; adds scale(0.98) + translate-y-px on active |
| `IconMorph` | Cross-fade two icons (opacity + scale + blur, micro spring) |
| `AnimatedNumber` | Count-up with `.tabular` baked in (respects reduced motion) |
| `AnimatedSwap` | Reduced-motion-aware inline value swap for prices and compact state changes |
| `RouteTransition` | Marketing route transition modes: `none` / `vertical-translate` / `blur-scale-fade` |
| `useConcentric` | Compute inner radius token from outer + padding |
| `useShouldReduceMacro` | Returns `true` when user prefers reduced motion (macro tier consumer hook) |

## Micro-interaction baseline

These are system-level defaults layered through tokens, global `data-slot`
selectors, and motion primitives — not one-off component tricks.

| Pattern | Baseline |
| --- | --- |
| Directional button icons | Any trailing direct `svg` inside `buttonVariants()` gets a 2px hover/focus-visible drift. Icon-only buttons are excluded. |
| Inputs / textareas | Border, background, and ring changes transition on explicit properties (`color`, `background-color`, `border-color`, `box-shadow`). |
| Checkbox indicators | Check marks scale `0.25 → 1`, blur `4px → 0`, and fade `0 → 1` using the canonical micro curve. |
| Error states | Use `FieldError` (`role="alert"`) and connect controls with `aria-describedby`. Do not use raw spans for validation copy. |
| Loading / success states | Submit buttons use `Spinner`; success confirmation uses a semantic `success` token and `aria-live`/`role="status"` where state changes in place. |
| Text effects | Use `TextEffect` from `src/components/typography/text-effect.tsx` for `gradient`, `shimmer`, and `accent` treatments. Do not inline gradient recipes in blocks. |

## Worked examples

### Concentric radius math

The radius scale in [globals.css](../src/app/globals.css) is `calc()`-based:

| Class | Token | Default (radius=0.625rem) |
| --- | --- | --- |
| `rounded-sm` | `radius × 0.6` | 6px |
| `rounded-md` | `radius × 0.8` | 8px |
| `rounded-lg` | `radius` | 10px |
| `rounded-xl` | `radius × 1.4` | 14px |
| `rounded-2xl` | `radius × 1.8` | 18px |
| `rounded-3xl` | `radius × 2.2` | 22px |
| `rounded-4xl` | `radius × 2.6` | 26px |

Worked examples (with default radius):

- Outer `rounded-2xl` (18px) + `p-4` (16px) → inner ≈ 2px → **`rounded-sm`** (6px) is closest single token; or use `rounded-[2px]` for an exact match.
- Outer `rounded-xl` (14px) + `p-3` (12px) → inner = 2px → **`rounded-sm`**.
- Outer `rounded-3xl` (22px) + `p-6` (24px) → inner = -2px (negative) → **`rounded-none`**.
- Outer `rounded-xl` (14px) + `p-2` (8px) → inner = 6px → **`rounded-sm`** (exact).

For runtime/dynamic cases, call `useConcentric(outerClass, paddingPx)` and it returns the closest token:

```tsx
import { useConcentric } from "@/components/motion"

function Tile({ paddingPx }: { paddingPx: number }) {
  const inner = useConcentric("rounded-2xl", paddingPx)
  return (
    <div className="rounded-2xl p-4">
      <div className={cn(inner, "bg-muted")}>…</div>
    </div>
  )
}
```

### Numeric values

Bad — proportional digits, layout shifts when value changes:

```tsx
<span className="text-3xl font-semibold">{count}</span>
```

Good — tabular digits, locked column widths:

```tsx
<span className="tabular text-3xl font-semibold">{count}</span>
```

For animated values, `AnimatedNumber` bakes `.tabular` in:

```tsx
<AnimatedNumber value={9.2e12} format={(v) => formatCompact(v, 1)} />
```

### Text effects

Expressive text treatments are reusable primitives, not block-local recipes:

```tsx
import { TextEffect } from "@/components/typography/text-effect"

<h1 className="font-heading text-6xl">
  Ship with <TextEffect effect="shimmer">small delights</TextEffect>
</h1>
```

`shimmer` respects `prefers-reduced-motion`; `gradient` and `accent` are static
theme-token treatments. Keep them for display text, badges, and hero/CTA
emphasis, not long body copy.

### Press feedback

```tsx
// Wrap any non-Button interactive element. Button has Press behavior inline.
<Press render={<Link href="/pricing">See pricing</Link>} />

// Disable press feedback (drag handles, long-press targets).
<Press static>Drag handle</Press>
```

### Hit areas on compact controls

```tsx
// 28px visible, 28px hit area — desktop-only is fine
<Button size="icon-sm"><Bell /></Button>

// 28px visible, 40×40 hit area via invisible pseudo-element
<Button size="icon-sm" data-touch><Bell /></Button>
```

Compact Button variants (`xs`, `sm`, `icon-xs`, `icon-sm`) expose
`data-compact` for inspection, but hit-area expansion is still an explicit
call-site choice. Add `data-touch` when the control appears in a touch context
and its expanded 40×40 area will not overlap a neighbor.

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `transition: all` / `transition-all` | List specific properties: `transition-[color,background-color,border-color,box-shadow]` |
| Same `rounded-*` on parent and direct child | Use the math: outer − padding = inner. `useConcentric` for dynamic cases. |
| Numbers cause layout shift | Add `className="tabular"` |
| `<img>` looks pasted-on | Add `className="image-outline"` |
| Animation plays on page load when it shouldn't | `AnimatePresence initial={false}` |
| Touch target too small on phone | `data-touch` on the control |
| Reduced-motion users see big slides | Wrap macro motion in `useShouldReduceMacro()` check, or set `data-motion="macro"` on the container |
| Hardcoded `shadow-md`/`-lg`/`-xl` | Use `shadow-[var(--shadow-subtle\|raised\|overlay)]` |
| Press feedback double-applied | Don't wrap Button in `<Press>` — Button already has press classes inline |

## Where to look next

- [Architecture decision records](adr/) — the 17 decisions that ground every rule above.
- [`/sandbox/polish`](../src/app/(internal)/sandbox/polish/page.tsx) — live reference renderings of every primitive and treatment.
- [`scripts/check-polish.mjs`](../scripts/check-polish.mjs) — warn-only guardrail. Run via `pnpm check:polish`.
