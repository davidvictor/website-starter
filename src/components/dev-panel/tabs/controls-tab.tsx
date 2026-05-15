"use client"

import { Leva } from "leva"
import { RotateCcw, Settings2, X } from "lucide-react"
import { getShaderDef } from "@/components/shaders/themed/registry"
import {
  type ShaderId,
  THEME_SENTINEL,
} from "@/components/shaders/themed/types"
import { useShaderOverrides } from "@/components/shaders/themed/use-shader-overrides"
import { cn } from "@/lib/utils"
import { useDevPanel, useMountedShaderCount } from "../dev-panel-provider"

export function ControlsTab() {
  return (
    <div className="flex h-full flex-col">
      <FocusChip />
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

function FocusChip() {
  const { focusedShaderId, setFocusedShaderId } = useDevPanel()
  const mountedCount = useMountedShaderCount()

  if (focusedShaderId === null) {
    if (mountedCount === 0) return null
    return (
      <p className="px-2.5 py-1.5 text-[10px] text-muted-foreground">
        {mountedCount} shader{mountedCount === 1 ? "" : "s"} visible · click a
        tile to focus
      </p>
    )
  }

  const def = getShaderDef(focusedShaderId)
  return (
    <div className="m-1.5 flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
      <div className="flex min-w-0 flex-col">
        <span className="font-mono text-[10px] text-muted-foreground">
          {focusedShaderId}
        </span>
        <span className="truncate text-xs font-medium">{def.label}</span>
      </div>
      <div className="flex items-center gap-1">
        <ResetShaderButton id={focusedShaderId} />
        <ResetSlotMenu id={focusedShaderId} />
        <button
          type="button"
          aria-label="Clear focus"
          onClick={() => setFocusedShaderId(null)}
          className="grid size-5 place-items-center rounded transition-colors cursor-pointer hover:bg-muted"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  )
}

function ResetShaderButton({ id }: { id: ShaderId }) {
  const [, , reset] = useShaderOverrides(id)
  return (
    <button
      type="button"
      onClick={reset}
      title="Reset all controls + slots to theme defaults"
      className="grid size-5 place-items-center rounded transition-colors cursor-pointer hover:bg-muted"
    >
      <RotateCcw className="size-3" />
    </button>
  )
}

function ResetSlotMenu({ id }: { id: ShaderId }) {
  const [overrides, patch] = useShaderOverrides(id)
  const def = getShaderDef(id)
  const slotKeys = Object.keys(def.slots)
  return (
    <select
      aria-label="Reset slot to theme"
      defaultValue=""
      onChange={(e) => {
        const key = e.target.value
        if (!key) return
        patch({
          colorSlots: { ...overrides.colorSlots, [key]: THEME_SENTINEL },
        })
        e.target.value = ""
      }}
      className={cn(
        "h-5 cursor-pointer rounded border border-border bg-card px-1 font-mono text-[9px] text-muted-foreground hover:bg-muted"
      )}
    >
      <option value="">↺ slot</option>
      {slotKeys.map((k) => {
        const slot = def.slots[k]
        const label =
          slot.kind === "theme" ? `${k} · ${slot.token}` : `${k} · literal`
        return (
          <option key={k} value={k}>
            {label}
          </option>
        )
      })}
    </select>
  )
}

function ControlsEmptyState() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
      <Settings2 className="size-6 opacity-40" />
      <p className="text-xs">
        No controls registered. Open{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          /examples/shaders
        </code>{" "}
        to focus a shader, or call{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          useDevControls()
        </code>{" "}
        from a component.
      </p>
    </div>
  )
}
