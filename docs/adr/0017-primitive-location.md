# 0017 — Polish primitives live in `src/components/motion/`

**Status:** Accepted

## Decision

The polish primitives (`Press`, `IconMorph`, `AnimatedNumber`, `RouteTransition`, `useConcentric`, `useShouldReduceMacro`, springs) live in `src/components/motion/` alongside `FadeIn` and `Stagger`. Single import path: `@/components/motion`.

## Why

These primitives are all motion-adjacent — they either animate, react to motion preferences, or compose with motion. Putting them next to `FadeIn` / `Stagger` keeps the related concepts in one folder and the imports short. A separate `polish/` namespace would split related primitives across two homes; mixing into `ui/` would blur the line between shadcn primitives and custom motion ones.

## How to apply

- New polish primitives ship from `src/components/motion/`.
- Import via the barrel: `import { Press, IconMorph, … } from "@/components/motion"`.
- Don't put motion-adjacent helpers in `src/lib/` — those are for non-motion utilities.
