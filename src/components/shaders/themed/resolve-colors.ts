// src/components/shaders/themed/resolve-colors.ts

import { THEME_FALLBACK_COLORS } from "@/themes/fallback-colors"
import {
  type ColorSlot,
  type SlotOverrides,
  THEME_SENTINEL,
  type ThemeColorToken,
} from "./types"

const SHADER_TOKEN_TO_THEME_TOKEN = {
  primary: "primary",
  accent: "accent",
  "brand-accent": "brandAccent",
  background: "background",
  foreground: "foreground",
  muted: "muted",
  "muted-foreground": "mutedForeground",
  "chart-1": "chart1",
  "chart-2": "chart2",
  "chart-3": "chart3",
  "chart-4": "chart4",
  "chart-5": "chart5",
  destructive: "destructive",
  success: "success",
  warning: "warning",
  info: "info",
} as const satisfies Record<ThemeColorToken, keyof typeof THEME_FALLBACK_COLORS>

export function defaultsFor(token: ThemeColorToken): string {
  return THEME_FALLBACK_COLORS[SHADER_TOKEN_TO_THEME_TOKEN[token]]
}

export function resolveSlotColors(
  slots: Record<string, ColorSlot>,
  overrides: SlotOverrides | undefined,
  computed: CSSStyleDeclaration | null
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, slot] of Object.entries(slots)) {
    const override = overrides?.[key]
    if (override && override !== THEME_SENTINEL) {
      out[key] = override
      continue
    }
    if (slot.kind === "literal") {
      out[key] = slot.value
      continue
    }
    if (!computed) {
      out[key] = defaultsFor(slot.token)
      continue
    }
    const raw = computed.getPropertyValue(`--${slot.token}`).trim()
    out[key] = raw || defaultsFor(slot.token)
  }
  return out
}
