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
  const { themeId, resolvedMode, isOverridden } = useTheme()
  const [overrides] = useShaderOverrides(shaderId)

  // themeId / resolvedMode / isOverridden are intentional triggers — they're
  // not closed over, but switching theme changes CSS var values that
  // getComputedStyle reads inside the memo.
  // biome-ignore lint/correctness/useExhaustiveDependencies: explained above
  return useMemo(() => {
    const computed =
      typeof window === "undefined"
        ? null
        : getComputedStyle(document.documentElement)
    return resolveSlotColors(slots, overrides.colorSlots, computed)
  }, [slots, overrides.colorSlots, themeId, resolvedMode, isOverridden])
}
