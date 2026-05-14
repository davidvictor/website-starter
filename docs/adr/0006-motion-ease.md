# 0006 — Tween entrances, spring state changes

**Status:** Accepted

## Decision

Two motion regimes:

| Regime | Ease | Used for |
| --- | --- | --- |
| Tween (cubic-bezier `[0.22, 1, 0.36, 1]`) | Time-based, predictable | Scroll-in entrances (`FadeIn`, `Stagger`) |
| Spring (`bounce: 0`) | Friction-based | Press, icon morph, popover/dialog/sheet open & close, route transitions |

## Why

Scroll entrances run once and want a filmic, predictable curve — a spring's "settle" feel is unnecessary. State changes (pressing, opening, dismissing) feel more natural with friction-based motion that follows the user's gesture timing. Different jobs, different curves.

## How to apply

- Entering on scroll? Use `FadeIn` / `Stagger` — tween, no override needed.
- Reacting to user input or component state? Use one of the `SPRING_*` constants from [`@/components/motion/springs`](../../src/components/motion/springs.ts).
- Don't mix: a spring on a scroll entrance reads as "browser stutter"; a tween on a popover open reads as "PowerPoint."
