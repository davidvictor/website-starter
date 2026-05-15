// src/components/shaders/themed/themed-shader.tsx
"use client"

import { type CSSProperties, useEffect, useMemo, useRef } from "react"
import { Shader } from "shaders/react"

import { useDevPanel } from "@/components/dev-panel"
import { cn } from "@/lib/utils"

import { ShaderFallback } from "./fallback"
import { getShaderDef } from "./registry"
import { useInView } from "./use-in-view"
import { useResolvedColors } from "./use-resolved-colors"
import { useShaderControls } from "./use-shader-controls"
import { useShaderPerfMode } from "./use-shader-perf-mode"
import type { ShaderId } from "./types"

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
      className={cn("relative", className)}
      style={style}
    >
      {perfMode === "fallback" ? (
        <ShaderFallback def={def} colors={colors} />
      ) : inView ? (
        <Shader className="absolute inset-0">{def.renderTree(props)}</Shader>
      ) : null /* paused: off-screen */}
    </div>
  )
}
