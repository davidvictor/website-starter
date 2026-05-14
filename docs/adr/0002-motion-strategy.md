# 0002 — Motion strategy: hybrid `motion/react` + tuned CSS

**Status:** Accepted (revised)

## Decision

Motion is split by **who owns the mount lifecycle**:

| Surface | Animation system |
| --- | --- |
| Dialog, AlertDialog, Sheet, Drawer | `motion/react` + `AnimatePresence` |
| Popover, Hover-card, Tooltip, Dropdown, Menubar, Context-menu, Select, Combobox | CSS keyframes (`data-open` / `data-closed`) with tier-matched durations and easings |
| Dev panel, route transitions, custom motion components, marketing animation | `motion/react` |
| Scroll entrances (`FadeIn`, `Stagger`) | `motion/react` with tween (see ADR 0006) |

## Why

The original locked decision was "unify on `motion/react` everywhere." Base UI's portal-managed primitives (popover, dropdown, select, menu, combobox, hover-card, tooltip) control their own mount/unmount through React portals. Wrapping their content in `AnimatePresence` from outside fights the portal teardown — `AnimatePresence` needs the child to stay mounted during exit, but Base UI yanks it via the portal.

For dialog, alert-dialog, sheet, and drawer the wrapping works cleanly because the surface itself is the mount target. For the rest, fighting the framework costs more than it pays. We keep the CSS keyframe approach for that group but tune the durations and easings to match our spring tiers visually.

## How to apply

- **Dialog-family surfaces** use `motion/react`: `<AnimatePresence>` wrapping a `motion.div` with `SPRING_MACRO`.
- **Popover-family surfaces** use Tailwind's `animate-in` / `animate-out` keyframes with these tier-matched classes:

  | Tier | Tailwind classes |
  | --- | --- |
  | Micro (tooltip, hover-card) | `duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]` |
  | Standard (popover, dropdown, select, menu, combobox) | `duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]` |
  | Macro (legacy — should be migrated to motion/react) | `duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]` |

  The cubic-bezier visually approximates `{ bounce: 0 }` springs.

- For new components we control end-to-end, reach for `motion/react` first. Springs from [`@/components/motion/springs`](../../src/components/motion/springs.ts).
