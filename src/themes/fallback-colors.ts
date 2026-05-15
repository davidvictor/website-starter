import type { ColorTokenKey } from "./types"

/**
 * Token fallback colors for places that can render before CSS variables are
 * available, such as root error boundaries and shader static fallbacks.
 * Hex values live in the theme layer so app/components never become a second
 * color source of truth.
 */
export const THEME_FALLBACK_COLORS = {
  primary: "#1a1a1a",
  accent: "#7c5cff",
  brandAccent: "#d35400",
  background: "#fafafa",
  foreground: "#181818",
  card: "#ffffff",
  cardForeground: "#181818",
  popover: "#ffffff",
  popoverForeground: "#181818",
  muted: "#ececec",
  mutedForeground: "#6e6e6e",
  border: "#d8d8d8",
  input: "#a8a8a8",
  ring: "#7c5cff",
  secondary: "#ececec",
  secondaryForeground: "#181818",
  destructive: "#ef4444",
  brandAccentForeground: "#ffffff",
  primaryForeground: "#ffffff",
  accentForeground: "#ffffff",
  chart1: "#3b82f6",
  chart2: "#10b981",
  chart3: "#f59e0b",
  chart4: "#ef4444",
  chart5: "#8b5cf6",
  sidebar: "#ffffff",
  sidebarForeground: "#181818",
  sidebarPrimary: "#1a1a1a",
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: "#ececec",
  sidebarAccentForeground: "#181818",
  sidebarBorder: "#d8d8d8",
  sidebarRing: "#7c5cff",
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
} as const satisfies Record<ColorTokenKey, string>

export const GLOBAL_ERROR_COLORS = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  actionBackground: "#fafafa",
  actionForeground: "#0a0a0a",
} as const
