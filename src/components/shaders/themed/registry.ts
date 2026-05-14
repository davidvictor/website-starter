// src/components/shaders/themed/registry.ts
import type { ShaderDef, ShaderId } from "./types"

/**
 * Populated by importing each pair file and spreading the [idle, interactive]
 * tuples it returns. Filled incrementally — Phase 6 wires the first pair;
 * Phase 8 wires the remaining eleven.
 */
export const SHADER_REGISTRY: Partial<Record<ShaderId, ShaderDef>> = {}

export const SHADER_IDS: readonly ShaderId[] = Object.keys(
  SHADER_REGISTRY
) as ShaderId[]

export function getShaderDef(id: ShaderId): ShaderDef {
  const def = SHADER_REGISTRY[id]
  if (!def) throw new Error(`Unknown shader id: ${id}`)
  return def
}
