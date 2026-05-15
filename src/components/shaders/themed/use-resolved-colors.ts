// src/components/shaders/themed/use-resolved-colors.ts
"use client"

import { useMemo } from "react"
import { useTheme } from "@/providers/theme-provider"
import { resolveSlotColors } from "./resolve-colors"
import type { ColorSlot, ShaderId } from "./types"
import { useShaderOverrides } from "./use-shader-overrides"

export function useResolvedColors(
  shaderId: ShaderId,
  slots: Record<string, ColorSlot>
): Record<string, string> {
  const { theme, resolvedMode } = useTheme()
  const [overrides] = useShaderOverrides(shaderId)

  // `theme` is an intentional trigger: live edits keep the same theme id after
  // the first override, but CSS vars still change and shader slots must refresh.
  // biome-ignore lint/correctness/useExhaustiveDependencies: explained above
  return useMemo(() => {
    const computed =
      typeof window === "undefined"
        ? null
        : getComputedStyle(document.documentElement)
    return resolveSlotColors(slots, overrides.colorSlots, computed)
  }, [slots, overrides.colorSlots, theme, resolvedMode])
}
