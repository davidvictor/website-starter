# 0001 — Press signal

**Status:** Accepted

## Decision

Interactive elements (Button, Press) signal press with **stacked** `active:translate-y-px` + `active:scale-[0.98]`.

## Why

The existing Button used `translate-y-px` as a deliberate brand signature. The polish principle calls for `scale(0.96)`. Either alone changes the project character — stacked, they reinforce each other: translate gives the press depth, scale gives the tactile compression. `0.98` is softer than the canonical `0.96` so the two don't fight.

## How to apply

- `Button` includes both classes in its base `cva`.
- `<Press asChild>` adds the same pair when wrapping anything else.
- Disable via `static` prop on `Press` when motion would be distracting (long-press menus, drag handles).
- Always restrict the transition to `[transform,scale,translate]` — never `transition-all`.
