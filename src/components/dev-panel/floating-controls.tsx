"use client"

import { ChevronDown, GripVertical } from "lucide-react"
import { type ReactNode, useState } from "react"

import { cn } from "@/lib/utils"

type FloatingControlsProps = {
  title?: string
  /** Where to dock. */
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right"
  /** Start collapsed. */
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * Lightweight floating HUD for page-scoped controls that benefit from
 * staying visible alongside the canvas — for example, shader sliders.
 * Different from the global dev panel: this is mounted by a single page,
 * shows a curated set of controls, and renders in production-friendly
 * markup so a prototype can demo it on a deployed preview.
 *
 * Use this for inline UX where the dev panel would be too far away from
 * what the user is tweaking.
 */
export function FloatingControls({
  title = "controls",
  position = "bottom-left",
  defaultOpen = true,
  children,
}: FloatingControlsProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <aside
      className={cn(
        "fixed z-40 flex w-[260px] flex-col rounded-lg border border-border bg-card/90 text-card-foreground shadow-[var(--shadow-overlay)] backdrop-blur-md",
        position === "bottom-left" && "bottom-4 left-4",
        position === "bottom-right" && "bottom-4 right-4",
        position === "top-left" && "top-4 left-4",
        position === "top-right" && "top-4 right-4"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-touch
        className="flex h-8 items-center justify-between gap-2 border-b border-border px-2.5 hover:bg-muted/50"
      >
        <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight">
          <GripVertical className="size-3 text-muted-foreground" />
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-2 px-2.5 py-2">{children}</div>
      )}
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Light-weight typed control primitives — useful inside FloatingControls
   when you don't want to register with the global dev panel.            */
/* ------------------------------------------------------------------ */

export function ControlNumber({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="flex items-center justify-between text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
      />
    </label>
  )
}

export function ControlColor({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-touch
          className="size-5 cursor-pointer rounded border border-border bg-transparent p-0"
        />
        <span className="font-mono text-[10px]">{value}</span>
      </span>
    </label>
  )
}

export function ControlBoolean({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        data-touch
        className="size-4 cursor-pointer accent-foreground"
      />
    </label>
  )
}
