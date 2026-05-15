"use client"

import { AnimatePresence, motion, type Variants } from "motion/react"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { useTheme } from "@/providers/theme-provider"

import { useOptionalRouteTransitionContext } from "./route-transition-context"
import { SPRING_MACRO } from "./springs"
import { useShouldReduceMacro } from "./use-should-reduce-macro"

/**
 * Three route-transition modes for the marketing layout.
 * See docs/adr/0012-route-transition.md and docs/adr/0018-route-transition-coordination.md.
 *
 *   none               — instant swap (reference pages, dashboards)
 *   vertical-translate — fade + 16px upward translate on enter, 8px down on exit
 *   blur-scale-fade    — opacity + scale + blur (the canonical polish-kit feel)
 *
 * When no `mode` prop is provided, the mode is sourced from the active
 * theme's derivation (per-preset defaults). Reduced-motion forces `none`.
 *
 * If a parent `<RouteTransitionProvider>` is present, this component
 * reports `entering → idle` when the enter animation completes so
 * downstream consumers (`FadeIn`, `Stagger`) can defer their own
 * entrance animations until the macro transition has settled. Without
 * a provider, RouteTransition still works — it just doesn't coordinate.
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
  /**
   * Override the per-theme default. Omit to use
   * `theme.derivation.routeTransition`.
   */
  mode?: RouteTransitionMode
  children: ReactNode
}

export function RouteTransition({ mode, children }: RouteTransitionProps) {
  const pathname = usePathname()
  const reduce = useShouldReduceMacro()
  const { theme } = useTheme()
  const transitionCtx = useOptionalRouteTransitionContext()

  const themeMode = (theme.derivation.routeTransition ??
    "vertical-translate") as RouteTransitionMode
  const resolved = mode ?? themeMode
  const effective: RouteTransitionMode = reduce ? "none" : resolved

  if (effective === "none") {
    // No animation → no enter phase to report. If a provider is wired,
    // poke it to idle so consumers don't get stuck in `entering`.
    if (transitionCtx?.phase === "entering") {
      transitionCtx.reportEnterComplete()
    }
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
        onAnimationComplete={(definition) => {
          // Only flip phase on the "animate" (enter) completion; exit
          // completion is followed by mounting the next page.
          if (definition === "animate") {
            transitionCtx?.reportEnterComplete()
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
