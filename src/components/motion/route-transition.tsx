"use client"

import { AnimatePresence, motion, type Variants } from "motion/react"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { SPRING_MACRO } from "./springs"
import { useShouldReduceMacro } from "./use-should-reduce-macro"

/**
 * Three route-transition modes for the marketing layout.
 * See docs/adr/0012-route-transition.md.
 *
 *   none               — instant swap (reference pages, dashboards)
 *   vertical-translate — fade + 16px upward translate on enter, 8px down on exit
 *   blur-scale-fade    — opacity + scale + blur (the canonical polish-kit feel)
 */
export type RouteTransitionMode =
  | "none"
  | "vertical-translate"
  | "blur-scale-fade"

const TRANSLATE_VARIANTS: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const BLUR_SCALE_VARIANTS: Variants = {
  initial: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 1.02, filter: "blur(4px)" },
}

type RouteTransitionProps = {
  mode?: RouteTransitionMode
  children: ReactNode
}

export function RouteTransition({
  mode = "vertical-translate",
  children,
}: RouteTransitionProps) {
  const pathname = usePathname()
  const reduce = useShouldReduceMacro()

  const effective: RouteTransitionMode = reduce ? "none" : mode

  if (effective === "none") {
    return <>{children}</>
  }

  const variants =
    effective === "blur-scale-fade" ? BLUR_SCALE_VARIANTS : TRANSLATE_VARIANTS

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        data-motion="macro"
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={SPRING_MACRO}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
