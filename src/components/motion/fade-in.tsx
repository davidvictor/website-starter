"use client"

import { type HTMLMotionProps, motion } from "motion/react"

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number
  y?: number
  duration?: number
}

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  duration = 0.55,
  ...rest
}: FadeInProps) {
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
