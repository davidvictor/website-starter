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
| Scale on press | `<Press asChild>` or `Button` (both stack `translate-y-px` + `scale(0.98)`). |
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

| Token | Use |
| --- | --- |
| `var(--shadow-subtle)` | Card surfaces, raised tiles |
| `var(--shadow-raised)` | Standard popovers, dropdowns, menus |
| `var(--shadow-overlay)` | Dialogs, sheets, drawers, modal-class surfaces |

## Motion primitives

All live in [`src/components/motion/`](../src/components/motion):

| Primitive | Use |
| --- | --- |
| `FadeIn` | Scroll-in fade + 16px upward translate (tween, runs once) |
| `Stagger` | Stagger children with 80ms gap (tween) |
| `Press` | `asChild` wrapper; adds scale(0.98) + translate-y-px on active |
| `IconMorph` | Cross-fade two icons (opacity + scale + blur, micro spring) |
| `AnimatedNumber` | Count-up with `.tabular` baked in (respects reduced motion) |
| `RouteTransition` | Marketing route transition modes: `none` / `vertical-translate` / `blur-scale-fade` |
| `useConcentric` | Compute inner radius token from outer + padding |
| `useShouldReduceMacro` | Returns `true` when user prefers reduced motion (macro tier consumer hook) |

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `transition: all` / `transition-all` | List specific properties: `transition-[colors,opacity,scale]` |
| Same `rounded-*` on parent and direct child | Use the math: outer − padding = inner |
| Numbers cause layout shift | Add `className="tabular"` |
| `<img>` looks pasted-on | Add `className="image-outline"` |
| Animation plays on page load when it shouldn't | `AnimatePresence initial={false}` |
| Touch target too small on phone | `data-touch` on the control |
| Reduced-motion users see big slides | Wrap macro motion in `useShouldReduceMacro()` check, or set `data-motion="macro"` on the container |

## Where to look next

- [Architecture decision records](adr/) — the 12 decisions that ground every rule above.
- [`/sandbox/polish`](../src/app/sandbox/polish/page.tsx) — live reference renderings of every primitive and treatment.
