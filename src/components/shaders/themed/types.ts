// src/components/shaders/themed/types.ts
import type { ReactNode } from "react"
import type { DevControlSchema } from "@/components/dev-panel/types"

export type ThemeId = "editorial" | "saas" | "bold" | "cyber"
export type StyleOrdinal = 1 | 2 | 3
export type Variant = "idle" | "interactive"
export type ShaderId = `${ThemeId}.${StyleOrdinal}.${Variant}`

export type ThemeColorToken =
  | "primary"
  | "accent"
  | "brand-accent"
  | "background"
  | "foreground"
  | "muted"
  | "muted-foreground"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "destructive"
  | "success"
  | "warning"
  | "info"

export type ColorSlot =
  | { kind: "theme"; token: ThemeColorToken }
  | { kind: "literal"; value: string }

export type PerfMode = "full" | "reduced" | "fallback"

export type BuildPropsContext = {
  colors: Record<string, string>
  controls: Record<string, unknown>
  perfMode: PerfMode
}

export type BuildPropsFn = (ctx: BuildPropsContext) => unknown
export type RenderFn = (props: unknown) => ReactNode

export type ShaderDef = {
  id: ShaderId
  label: string
  paperName: string
  themeId: ThemeId
  styleOrdinal: StyleOrdinal
  variant: Variant
  isAscii: boolean
  slots: Record<string, ColorSlot>
  schema: DevControlSchema
  schemaVersion: number
  buildProps: BuildPropsFn
  renderTree: RenderFn
  fallbackBackground: string
}

// localStorage shape — written by useShaderOverrides
export const THEME_SENTINEL = "__theme__" as const
export type SlotOverrides = Record<string, string | typeof THEME_SENTINEL>

export type ShaderOverrides = {
  v: number
  controls: Record<string, unknown>
  colorSlots: SlotOverrides
}
