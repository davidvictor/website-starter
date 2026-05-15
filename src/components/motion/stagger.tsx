"use client"

import { type HTMLMotionProps, motion } from "motion/react"
import type { ReactNode } from "react"
import { Children, isValidElement } from "react"

import { useRouteTransitionPhase } from "./route-transition-context"
import { useShouldReduceMacro } from "./use-should-reduce-macro"

type StaggerProps = HTMLMotionProps<"div"> & {
  delay?: number
  gap?: number
  children: ReactNode
}

/**
 * Viewport-triggered staggered fade-up. Like `<FadeIn>`, this defers to
 * the macro route transition while a page change is in flight — items
 * render at their resting state instead of replaying their entrance.
 */
export function Stagger({
  children,
  delay = 0,
  gap = 0.08,
  ...rest
}: StaggerProps) {
  const items = Children.toArray(children)
  const phase = useRouteTransitionPhase()
  const reduce = useShouldReduceMacro()
  const deferred = phase !== "idle"

  if (deferred || reduce) {
    return (
      <motion.div initial={false} {...rest}>
        {items.map((child) => (
          <motion.div
            key={
              isValidElement(child) && child.key != null
                ? child.key
                : String(child)
            }
            initial={false}
            animate={{ opacity: 1, y: 0 }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: gap, delayChildren: delay },
        },
      }}
      {...rest}
    >
      {items.map((child) => (
        <motion.div
          key={
            isValidElement(child) && child.key != null
              ? child.key
              : String(child)
          }
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
