// src/components/shaders/themed/resolve-colors.ts
import {
  type ColorSlot,
  type SlotOverrides,
  THEME_SENTINEL,
  type ThemeColorToken,
} from "./types"

// Fallback values used during SSR and when a CSS var hasn't been applied yet.
// Mirrors the editorial light-mode tokens — neutral defaults.
const DEFAULTS: Record<ThemeColorToken, string> = {
  primary: "#1a1a1a",
  accent: "#7c5cff",
  "brand-accent": "#d35400",
  background: "#fafafa",
  foreground: "#181818",
  muted: "#ececec",
  "muted-foreground": "#6e6e6e",
  "chart-1": "#3b82f6",
  "chart-2": "#10b981",
  "chart-3": "#f59e0b",
  "chart-4": "#ef4444",
  "chart-5": "#8b5cf6",
  destructive: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
}

export function defaultsFor(token: ThemeColorToken): string {
  return DEFAULTS[token]
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
