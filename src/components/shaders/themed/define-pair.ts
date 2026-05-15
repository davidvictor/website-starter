// src/components/shaders/themed/define-pair.ts
import type { DevControlSchema } from "@/components/dev-panel/types"
import type {
  BuildPropsFn,
  ColorSlot,
  RenderFn,
  ShaderDef,
  ShaderId,
  StyleOrdinal,
  ThemeId,
} from "./types"

type DefinePairSpec = {
  baseId: `${ThemeId}.${StyleOrdinal}`
  label: string
  paperName: string
  isAscii: boolean
  slots: Record<string, ColorSlot>
  idleExtraSlots?: Record<string, ColorSlot>
  interactiveExtraSlots?: Record<string, ColorSlot>
  baseSchema: DevControlSchema
  interactiveSchema: DevControlSchema
  schemaVersion: number
  buildIdle: BuildPropsFn
  renderIdle: RenderFn
  buildInteractive: BuildPropsFn
  renderInteractive: RenderFn
  fallbackBackground: string
}

export function definePair(spec: DefinePairSpec): [ShaderDef, ShaderDef] {
  const [theme, ordinal] = spec.baseId.split(".") as [ThemeId, string]
  const styleOrdinal = Number(ordinal) as StyleOrdinal

  const idle: ShaderDef = {
    id: `${spec.baseId}.idle` as ShaderId,
    label: `${spec.label} · idle`,
    paperName: spec.paperName,
    themeId: theme,
    styleOrdinal,
    variant: "idle",
    isAscii: spec.isAscii,
    slots: { ...spec.slots, ...(spec.idleExtraSlots ?? {}) },
    schema: spec.baseSchema,
    schemaVersion: spec.schemaVersion,
    buildProps: spec.buildIdle,
    renderTree: spec.renderIdle,
    fallbackBackground: spec.fallbackBackground,
  }

  const interactive: ShaderDef = {
    id: `${spec.baseId}.interactive` as ShaderId,
    label: `${spec.label} · interactive`,
    paperName: spec.paperName,
    themeId: theme,
    styleOrdinal,
    variant: "interactive",
    isAscii: spec.isAscii,
    slots: { ...spec.slots, ...(spec.interactiveExtraSlots ?? {}) },
    schema: { ...spec.baseSchema, ...spec.interactiveSchema },
    schemaVersion: spec.schemaVersion,
    buildProps: spec.buildInteractive,
    renderTree: spec.renderInteractive,
    fallbackBackground: spec.fallbackBackground,
  }

  return [idle, interactive]
}
