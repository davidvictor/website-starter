import { editorialLetterpressPair } from "./editorial/2.letterpress"
import { editorialMarblePair } from "./editorial/3.marble"
import { editorialVeilPair } from "./editorial/1.veil"
import { saasFlowPair } from "./saas/2.flow"
import { saasGlyphMeshPair } from "./saas/3.glyph-mesh"
import { saasMeshPair } from "./saas/1.mesh"
import type { ShaderDef, ShaderId } from "./types"

const allPairs: ReadonlyArray<readonly [ShaderDef, ShaderDef]> = [
  editorialVeilPair,
  editorialLetterpressPair,
  editorialMarblePair,
  saasMeshPair,
  saasFlowPair,
  saasGlyphMeshPair,
]

export const SHADER_REGISTRY: Partial<Record<ShaderId, ShaderDef>> =
  Object.fromEntries(
    allPairs.flat().map((d) => [d.id, d] as const)
  ) as Partial<Record<ShaderId, ShaderDef>>

export const SHADER_IDS: readonly ShaderId[] = (
  Object.keys(SHADER_REGISTRY) as ShaderId[]
).sort()

export function getShaderDef(id: ShaderId): ShaderDef {
  const def = SHADER_REGISTRY[id]
  if (!def) throw new Error(`Unknown shader id: ${id}`)
  return def
}
