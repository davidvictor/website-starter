"use client"

import { useReducedMotion } from "motion/react"

/**
 * Returns `true` when the user prefers reduced motion. Macro motion
 * primitives consume this and collapse to instant. Micro motion (hover,
 * press, focus) ignores it. See docs/adr/0011-reduced-motion.md.
 */
export function useShouldReduceMacro(): boolean {
  const reduced = useReducedMotion()
  return reduced === true
}
