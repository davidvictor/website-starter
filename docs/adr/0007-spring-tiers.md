# 0007 — Three spring tiers

**Status:** Accepted

## Decision

Three named springs cover every interactive motion in the system:

| Tier | Config | Used for |
| --- | --- | --- |
| `SPRING_MICRO` | `{ duration: 0.2, bounce: 0 }` | Press, icon morph, tooltip, hover-card |
| `SPRING_STANDARD` | `{ duration: 0.3, bounce: 0 }` | Popover, dropdown, select, menubar, context menu, combobox |
| `SPRING_MACRO` | `{ duration: 0.4, bounce: 0 }` | Dialog, alert-dialog, sheet, drawer, dev panel, route transitions |

## Why

A single canonical spring doesn't fit motion of every magnitude — a 0.2s feel on a sheet looks rushed; a 0.4s feel on a press is sluggish. Two tiers wasn't enough to capture the gap between popovers and dialogs. Three is the smallest set that covers the size space cleanly.

## How to apply

- Match the tier to the motion's spatial magnitude, not the importance of the surface.
- All three use `bounce: 0` — the polish kit doesn't bounce. If a surface needs personality, give it a bigger tier, not bounce.
- Custom motion? Pick the closest tier rather than inventing a new spring.
