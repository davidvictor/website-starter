"use client"

import { Leva } from "leva"

import { Settings2 } from "lucide-react"

export function ControlsTab() {
  return (
    <div className="flex h-full flex-col">
      <div className="leva-host relative flex-1 overflow-y-auto">
        <Leva
          fill
          flat
          hideCopyButton
          titleBar={false}
          theme={{
            sizes: {
              rootWidth: "100%",
              controlWidth: "100px",
              numberInputMinWidth: "44px",
            },
            colors: {
              elevation1: "transparent",
              elevation2: "transparent",
              elevation3: "transparent",
            },
            radii: { sm: "4px", lg: "6px" },
          }}
        />
        <ControlsEmptyState />
      </div>
    </div>
  )
}

function ControlsEmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
      <Settings2 className="size-6 opacity-40" />
      <p className="text-xs">
        No controls registered. Call{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          useDevControls()
        </code>{" "}
        from a component to add one.
      </p>
    </div>
  )
}
