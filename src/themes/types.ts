import type { FontKey } from "@/lib/fonts"

/**
 * Color token surface — matches shadcn/ui's CSS variable schema.
 * All values are CSS color strings (oklch, hsl, hex, etc.). Stored as-is.
 */
export type ColorTokens = {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  border: string
  input: string
  ring: string
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  sidebar: string
  sidebarForeground: string
  sidebarPrimary: string
  sidebarPrimaryForeground: string
  sidebarAccent: string
  sidebarAccentForeground: string
  sidebarBorder: string
  sidebarRing: string
  /** User-facing accent (the controller's Accent input).
   *  Distinct from shadcn's `accent` (hover surface).
   *  Surfaces in featured pricing tiers, emphasis spans, shader endpoints, etc. */
  brandAccent: string
  brandAccentForeground: string
  /** Semantic colors derived from the preset's intensity. */
  success: string
  warning: string
  info: string
}

export type RadiiTokens = {
  /** Root radius in rem (e.g. "0.5rem", "0.75rem"). */
  radius: string
}

export type TypographyTokens = {
  sans: FontKey
  mono: FontKey
  heading: FontKey
}

export type Theme = {
  id: string
  name: string
  description?: string
  /** Light-mode color tokens. */
  light: ColorTokens
  /** Dark-mode color tokens. */
  dark: ColorTokens
  radii: RadiiTokens
  typography: TypographyTokens
}

/** Persisted shape on disk (in `src/themes/registry.json`). */
export type ThemeRegistry = {
  defaultThemeId: string
  themes: Theme[]
}

/** Maps a Theme's color keys to their CSS variable names. */
export const COLOR_TOKEN_TO_CSS_VAR: Record<keyof ColorTokens, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  border: "--border",
  input: "--input",
  ring: "--ring",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
  brandAccent: "--brand-accent",
  brandAccentForeground: "--brand-accent-foreground",
  success: "--success",
  warning: "--warning",
  info: "--info",
}

export const COLOR_TOKEN_KEYS = Object.keys(
  COLOR_TOKEN_TO_CSS_VAR
) as readonly (keyof ColorTokens)[]
