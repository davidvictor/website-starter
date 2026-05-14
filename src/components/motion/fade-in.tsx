"use client"

import { type HTMLMotionProps, motion } from "motion/react"

import { useRouteTransitionPhase } from "./route-transition-context"

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number
  y?: number
  duration?: number
}

/**
 * Viewport-triggered fade-up. When a `<RouteTransitionProvider>` is
 * active and the page is mid-transition (`pending` or `entering`),
 * `FadeIn` skips its own animation and renders at the resting state —
 * the macro route transition is already animating the wrapper, and a
 * second fade would compound visually.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 16,
  duration = 0.55,
  ...rest
}: FadeInProps) {
  const phase = useRouteTransitionPhase()
  const deferred = phase !== "idle"

  if (deferred) {
    return (
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }} {...rest}>
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
