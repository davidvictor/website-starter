// src/components/shaders/themed/themed-shader.tsx
"use client"

import { type CSSProperties, useEffect, useMemo, useRef } from "react"
import { Shader } from "shaders/react"

import { useDevPanel } from "@/components/dev-panel"
import { runtime } from "@/config/runtime"
import { cn } from "@/lib/utils"

import { ShaderFallback } from "./fallback"
import { getShaderDef } from "./registry"
import type { ShaderId } from "./types"
import { useInView } from "./use-in-view"
import { useResolvedColors } from "./use-resolved-colors"
import { useShaderControls } from "./use-shader-controls"
import { useShaderPerfMode } from "./use-shader-perf-mode"

export function ThemedShader({
  id,
  className,
  style,
}: {
  id: ShaderId
  className?: string
  style?: CSSProperties
}) {
  const def = getShaderDef(id)
  const ref = useRef<HTMLDivElement>(null)
  const colors = useResolvedColors(id, def.slots)
  const inView = useInView(ref, "200px")
  const perfMode = useShaderPerfMode(def.variant)
  const {
    open: panelOpen,
    activeTab,
    focusedShaderId,
    setFocusedShaderId,
    setOpen,
    setActiveTab,
    registerMountedShader,
    unregisterMountedShader,
  } = useDevPanel()
  // Register controls only when the user could actually see them. Without this gate,
  // Leva renders its default floating GUI on every page since controls would be
  // registered but no <Leva> host is in the tree to absorb them.
  const isActive =
    panelOpen &&
    activeTab === "controls" &&
    (focusedShaderId === null || focusedShaderId === id)
  const controls = useShaderControls(id, def.schema, isActive)

  useEffect(() => {
    registerMountedShader(id)
    return () => unregisterMountedShader(id)
  }, [id, registerMountedShader, unregisterMountedShader])

  const props = useMemo(
    () => def.buildProps({ colors, controls, perfMode }),
    [def, colors, controls, perfMode]
  )

  return (
    <div
      ref={ref}
      data-shader-id={id}
      className={cn("group/themed-shader relative", className)}
      style={style}
    >
      {
        perfMode === "fallback" ? (
          <ShaderFallback def={def} colors={colors} />
        ) : inView ? (
          <Shader className="absolute inset-0">{def.renderTree(props)}</Shader>
        ) : null /* paused: off-screen */
      }
      {runtime.isDevelopment && panelOpen && focusedShaderId !== id && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setFocusedShaderId(id)
            setOpen(true)
            setActiveTab("controls")
          }}
          className="absolute top-1.5 right-1.5 z-10 rounded bg-foreground/70 px-1.5 py-0.5 font-mono text-[9px] text-background opacity-0 transition-opacity hover:bg-foreground/85 group-hover/themed-shader:opacity-100"
        >
          [edit]
        </button>
      )}
    </div>
  )
}
