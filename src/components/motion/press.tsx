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
 * Press detects when its `render` target is a Button (`data-slot="button"`)
 * and **skips** adding the press classes — Button already has them inline,
 * so re-applying creates redundant Tailwind classes that biome flags. This
 * keeps `<Press render={<Button>…</Button>} />` a graceful no-op rather
 * than a code smell.
 *
 * @example
 *   <Press render={<a href="/x">…</a>} />
 *   <Press static>Drag handle</Press>  // disable feedback
 */
type PressProps = useRender.ComponentProps<"span"> & {
  /** Disable the press feedback (drag handles, long-press targets). */
  static?: boolean
}

const PRESS_CLASSES =
  "transition-[scale,translate] duration-150 ease-out active:translate-y-px active:scale-[0.98]"

/**
 * Returns true if the render prop is a Button primitive
 * (`data-slot="button"`). Used by Press to skip double-application.
 */
function isButtonElement(node: PressProps["render"]): boolean {
  if (!node || typeof node === "function") return false
  if (!React.isValidElement(node)) return false
  const props = node.props as Record<string, unknown> | undefined
  return props?.["data-slot"] === "button"
}

function Press({
  className,
  static: isStatic = false,
  render,
  ...props
}: PressProps) {
  const isButton = isButtonElement(render)
  const skipClasses = isStatic || isButton

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(!skipClasses && PRESS_CLASSES, className),
      },
      props
    ),
    render,
    state: { slot: "press" },
  })
}

export { PRESS_CLASSES, Press }
