"use client"

import { useEffect, useRef } from "react"
import { useDevControls } from "@/components/dev-panel/hooks/use-dev-controls"
import type { DevControlSchema, DevControlValues } from "@/components/dev-panel/types"
import { getShaderDef } from "./registry"
import { useShaderOverrides } from "./use-shader-overrides"
import type { ShaderId } from "./types"

export function useShaderControls<S extends DevControlSchema>(
  shaderId: ShaderId,
  schema: S,
  isActive: boolean
): DevControlValues<S> {
  const [overrides, patch] = useShaderOverrides(shaderId)
  const def = getShaderDef(shaderId)

  const values = useDevControls(`Shader · ${def.label}`, schema, {
    enabled: isActive,
    values: overrides.controls,
  })

  // Write-back guard: only persist when the serialized values actually change.
  // Without this guard, the cycle is:
  //   patch -> overrides.controls (new ref) -> useDevControls re-memo -> values (new ref) -> useEffect -> patch
  // which trips React's max-update-depth.
  const lastWrittenRef = useRef<string>("")
  useEffect(() => {
    if (!isActive) return
    const serialized = JSON.stringify(values)
    if (serialized === lastWrittenRef.current) return
    lastWrittenRef.current = serialized
    patch({ controls: values })
  }, [isActive, values, patch])

  return values
}
