# 0002 — Motion strategy: `motion/react` everywhere

**Status:** Accepted

## Decision

All interactive motion uses `motion/react` (`AnimatePresence`, `motion.div`, springs). Base UI's `data-starting-style` / `data-ending-style` CSS animations are replaced for popover-family primitives (popover, dropdown, select, dialog, sheet, drawer, etc.).

## Why

Two competing motion systems creates fragmentation: `motion/react` handles enter/exit + state, CSS handles popovers. Authors must remember which is which. Unifying gives one mental model, shared spring tiers, and a single reduced-motion policy.

## How to apply

- New components: reach for `<AnimatePresence>` + `motion.div` first.
- Springs from [`@/components/motion/springs`](../../src/components/motion/springs.ts): `SPRING_MICRO`, `SPRING_STANDARD`, `SPRING_MACRO`.
- For pure scroll entrances (no exit), `FadeIn` and `Stagger` remain (tween, not spring).

### Addendum: Base UI portal primitives

Base UI's popover-family primitives (Popover, Dropdown, Select, Dialog, Sheet, etc.) manage their own portal mount/unmount lifecycle. Wrapping their content in `AnimatePresence` doesn't compose cleanly because Base UI controls when children unmount.

**Pragmatic implementation:** keep Base UI's `data-open` / `data-closed` keyframe animations (from `tw-animate-css`) but tune the durations and easings to match our spring tiers:

| Tier | Tailwind classes |
| --- | --- |
| Micro (tooltip, hover-card) | `duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]` |
| Standard (popover, dropdown, select, menu, combobox) | `duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]` |
| Macro (dialog, alert-dialog, sheet, drawer) | `duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]` |

These cubic-bezier curves approximate `{ bounce: 0 }` springs visually. Use `motion/react` + `AnimatePresence` for surfaces we control directly: dev panel, route transitions, custom motion components, anything that's not wrapped in a Base UI portal.
