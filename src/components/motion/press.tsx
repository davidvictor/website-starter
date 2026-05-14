"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Wraps an interactive element with tactile press feedback.
 * Stacks `translate-y-px` + `scale(0.98)` on active state.
 * See docs/adr/0001-press-signal.md and docs/adr/0009-press-api.md.
 *
 * Composes via base-ui's `useRender` (equivalent to Radix `asChild`).
 *
 * @example
 *   <Press render={<a href="/x">…</a>}>…</Press>
 *   <Press static>Drag handle</Press>  // disable feedback
 */
type PressProps = useRender.ComponentProps<"span"> & {
  /** Disable the press feedback (drag handles, long-press targets). */
  static?: boolean
}

const PRESS_CLASSES =
  "transition-[scale,translate] duration-150 ease-out active:translate-y-px active:scale-[0.98]"

function Press({
  className,
  static: isStatic = false,
  render,
  ...props
}: PressProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(!isStatic && PRESS_CLASSES, className),
      },
      props
    ),
    render,
    state: { slot: "press" },
  })
}

export { PRESS_CLASSES, Press }
