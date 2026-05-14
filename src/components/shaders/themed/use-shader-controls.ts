"use client"

import { useEffect } from "react"
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

  useEffect(() => {
    if (!isActive) return
    patch({ controls: values })
    // intentionally exhaustive: write back any change while active
  }, [isActive, values, patch])

  return values
}
