"use client"

import type { LucideIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

import { SPRING_MICRO } from "./springs"
import { useShouldReduceMacro } from "./use-should-reduce-macro"

/**
 * Cross-fade between two icons with the canonical icon morph values:
 * opacity 0→1, scale 0.25→1, blur 4px→0. See the polish skill for the
 * exact recipe; matches the `motion/react` spring config from ADR 0007.
 *
 * @example
 *   <IconMorph from={Sun} to={Moon} active={isDark} />
 */
type IconMorphProps = {
  from: LucideIcon
  to: LucideIcon
  /** When true, render `to`; when false, render `from`. */
  active: boolean
  className?: string
  size?: number
}

const VARIANTS = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
}

export function IconMorph({
  from: From,
  to: To,
  active,
  className,
  size = 16,
}: IconMorphProps) {
  const reduce = useShouldReduceMacro()
  const Icon = active ? To : From
  const key = active ? "to" : "from"

  return (
    <span
      className={cn("relative inline-flex", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={key}
          className="absolute inset-0 inline-flex items-center justify-center"
          initial={reduce ? false : VARIANTS.initial}
          animate={VARIANTS.animate}
          exit={reduce ? VARIANTS.animate : VARIANTS.exit}
          transition={reduce ? { duration: 0 } : SPRING_MICRO}
        >
          <Icon size={size} />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
