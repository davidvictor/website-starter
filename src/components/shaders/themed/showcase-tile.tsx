// src/components/shaders/themed/showcase-tile.tsx
"use client"

import { useDevPanel } from "@/components/dev-panel"
import { cn } from "@/lib/utils"
import { getShaderDef } from "./registry"
import { ThemedShader } from "./themed-shader"
import type { ShaderId } from "./types"

export function ShaderTile({ id }: { id: ShaderId }) {
  const def = getShaderDef(id)
  const { focusedShaderId, setFocusedShaderId, setOpen, setActiveTab } =
    useDevPanel()
  const isFocused = focusedShaderId === id

  return (
    <button
      type="button"
      data-focused={isFocused}
      onClick={() => {
        const next = isFocused ? null : id
        setFocusedShaderId(next)
        if (next !== null) {
          setOpen(true)
          setActiveTab("controls")
        }
      }}
      className={cn(
        "group relative aspect-[16/10] overflow-hidden rounded-lg border border-border text-left cursor-pointer",
        "transition-shadow hover:shadow-[var(--shadow-raised)]",
        "data-[focused=true]:ring-2 data-[focused=true]:ring-ring data-[focused=true]:ring-offset-2 data-[focused=true]:ring-offset-background"
      )}
    >
      <ThemedShader id={id} className="absolute inset-0" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 font-mono text-[10px] text-white">
        <span>{id}</span>
        <span className="flex items-center gap-1">
          {def.isAscii && (
            <span className="rounded bg-white/15 px-1 py-0.5 tracking-wider">
              ASCII
            </span>
          )}
          <span className="opacity-80">{def.paperName}</span>
        </span>
      </span>
    </button>
  )
}
