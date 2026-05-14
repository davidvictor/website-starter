/**
 * Canonical spring tiers for state-change motion.
 * See docs/adr/0007-spring-tiers.md.
 *
 * All springs use `bounce: 0` — the polish kit doesn't bounce. If a surface
 * needs more personality, pick the next tier up, not a higher bounce value.
 */

import type { Transition } from "motion/react"

/** Press, icon morph, tooltip, hover-card — small, fast. */
export const SPRING_MICRO: Transition = {
  type: "spring",
  duration: 0.2,
  bounce: 0,
}

/** Popover, dropdown, select, menubar, context menu, combobox. */
export const SPRING_STANDARD: Transition = {
  type: "spring",
  duration: 0.3,
  bounce: 0,
}

/** Dialog, alert dialog, sheet, drawer, dev panel, route transitions. */
export const SPRING_MACRO: Transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0,
}

/** Tween for scroll entrances (`FadeIn`, `Stagger`). See ADR 0006. */
export const TWEEN_ENTRANCE: Transition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
}
