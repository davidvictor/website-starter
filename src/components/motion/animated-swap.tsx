"use client"

import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

import { SPRING_STANDARD } from "./springs"
import { useShouldReduceMacro } from "./use-should-reduce-macro"

type AnimatedSwapProps = {
  stateKey: string
  children: React.ReactNode
  className?: string
  offset?: number
}

/**
 * Reduced-motion-aware content swap for compact UI values such as prices.
 * Keeps blocks from hand-rolling direct `motion.span` logic.
 */
export function AnimatedSwap({
  stateKey,
  children,
  className,
  offset = 6,
}: AnimatedSwapProps) {
  const reduce = useShouldReduceMacro()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={stateKey}
        initial={reduce ? false : { opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -offset }}
        transition={reduce ? { duration: 0 } : SPRING_STANDARD}
        className={cn(className)}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  )
}
