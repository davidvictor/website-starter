import type { ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

type TextEffect = "accent" | "gradient" | "shimmer"

type TextEffectProps<T extends ElementType = "span"> = {
  as?: T
  effect?: TextEffect
  className?: string
  children: ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">

const EFFECT_CLASSES: Record<TextEffect, string> = {
  accent: "text-brand-accent",
  gradient: "text-effect-gradient",
  shimmer: "text-effect-shimmer",
}

/**
 * Reusable premium text treatments. Keep effects here rather than inlining
 * gradient/shimmer recipes in block files so themes, reduced motion, and
 * future client clones have one place to tune expressive typography.
 */
export function TextEffect<T extends ElementType = "span">({
  as,
  effect = "gradient",
  className,
  children,
  ...props
}: TextEffectProps<T>) {
  const Component = as ?? "span"

  return (
    <Component
      data-text-effect={effect}
      className={cn(EFFECT_CLASSES[effect], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
