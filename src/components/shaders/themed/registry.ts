import { editorialLetterpressPair } from "./editorial/2.letterpress"
import { editorialVeilPair } from "./editorial/1.veil"
import type { ShaderDef, ShaderId } from "./types"

const allPairs: ReadonlyArray<readonly [ShaderDef, ShaderDef]> = [
  editorialVeilPair,
  editorialLetterpressPair,
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
