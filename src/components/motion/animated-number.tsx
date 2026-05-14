"use client"

import { animate, useInView } from "motion/react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { useShouldReduceMacro } from "./use-should-reduce-macro"

/**
 * Count-up display for numeric values with `tabular-nums` baked in.
 * Respects `prefers-reduced-motion` (macro tier) — when reduced, jumps
 * straight to the final value. See docs/adr/0011-reduced-motion.md.
 *
 * @example
 *   <AnimatedNumber value={9.2e12} format={(v) => formatCompact(v, 1)} />
 */
type AnimatedNumberProps = {
  value: number
  format?: (value: number) => string
  /** When the animation should run. Default: in-view (once). */
  playOn?: "mount" | "in-view" | "manual"
  className?: string
  /** Duration in seconds. Default: 1.4. */
  duration?: number
}

export function AnimatedNumber({
  value,
  format = (v) => String(Math.round(v)),
  playOn = "in-view",
  className,
  duration = 1.4,
}: AnimatedNumberProps) {
  const reduce = useShouldReduceMacro()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10%" })
  const [display, setDisplay] = useState(() =>
    playOn === "manual" || reduce ? format(value) : format(0)
  )

  useEffect(() => {
    if (reduce) {
      setDisplay(format(value))
      return
    }

    if (playOn === "in-view" && !inView) return
    if (playOn === "manual") {
      setDisplay(format(value))
      return
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(format(latest)),
    })
    return () => controls.stop()
    // value, format, duration are stable enough for marketing usage; rerunning
    // on every render would restart the count-up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, playOn, reduce, value])

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {display}
    </span>
  )
}
