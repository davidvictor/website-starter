// src/components/shaders/themed/use-resolved-colors.ts
"use client"

import { useMemo } from "react"
import { useTheme } from "@/providers/theme-provider"
import { resolveSlotColors } from "./resolve-colors"
import { useShaderOverrides } from "./use-shader-overrides"
import type { ColorSlot, ShaderId } from "./types"

export function useResolvedColors(
  shaderId: ShaderId,
  slots: Record<string, ColorSlot>
): Record<string, string> {
  const { themeId, resolvedMode, isOverridden } = useTheme()
  const [overrides] = useShaderOverrides(shaderId)

  return useMemo(() => {
    const computed =
      typeof window === "undefined"
        ? null
        : getComputedStyle(document.documentElement)
    return resolveSlotColors(slots, overrides.colorSlots, computed)
    // re-run when theme/mode/overrides change
  }, [slots, overrides.colorSlots, themeId, resolvedMode, isOverridden])
}
