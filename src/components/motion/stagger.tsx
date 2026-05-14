"use client"

import { motion, type HTMLMotionProps } from "motion/react"
import type { ReactNode } from "react"
import { Children } from "react"

type StaggerProps = HTMLMotionProps<"div"> & {
  delay?: number
  gap?: number
  children: ReactNode
}

export function Stagger({
  children,
  delay = 0,
  gap = 0.08,
  ...rest
}: StaggerProps) {
  const items = Children.toArray(children)
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
      {items.map((child, i) => (
        <motion.div
          key={i}
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
