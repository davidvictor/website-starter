// src/components/shaders/themed/fallback.tsx
"use client"

import { useMemo } from "react"
import type { ShaderDef } from "./types"

export function substituteVars(
  template: string,
  colors: Record<string, string>
): string {
  return template.replace(/\{\{([a-e])\}\}/g, (_, key: string) => {
    return colors[key] ?? "transparent"
  })
}

export function ShaderFallback({
  def,
  colors,
}: {
  def: ShaderDef
  colors: Record<string, string>
}) {
  const css = useMemo(
    () => substituteVars(def.fallbackBackground, colors),
    [def.fallbackBackground, colors]
  )
  return (
    <div aria-hidden className="absolute inset-0" style={{ background: css }} />
  )
}
