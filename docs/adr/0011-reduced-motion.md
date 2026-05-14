# 0011 — Pragmatic reduced-motion policy

**Status:** Accepted

## Decision

Two-tier reduced-motion handling:

| Motion class | Respects `prefers-reduced-motion` |
| --- | --- |
| Macro (panels, dialogs, route transitions, AnimatedNumber count-up) | Yes — collapses to instant or 1-frame fade |
| Micro (hover, focus ring, press scale, color transitions) | No — these are functional feedback, not decoration |

The line: ≥40px translate, full-surface opacity transitions, scale > 1.05, or filter/blur changes count as macro.

## Why

Blanket `prefers-reduced-motion` disables every transition site-wide, including the micro-feedback that helps a11y users perceive interaction. A pragmatic split preserves functional motion (you pressed something, it confirmed) while removing decorative motion (panel sliding in dramatically).

## How to apply

- Macro motion primitives wrap their animation in `useShouldReduceMacro()` (from `@/components/motion`) and skip the transition when the user prefers reduced motion.
- Micro motion uses CSS `transition` properties that stay on at all times.
- `<RouteTransition mode="…">` collapses to `mode="none"` automatically when reduced-motion is on.
