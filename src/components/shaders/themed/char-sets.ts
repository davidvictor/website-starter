import type { ShaderId } from "./types"

const editorial2 = { marks: " .:-=+", rule: "─│┼", dots: "·:∶" } as const
const saas3 = { data: ".+×▪█", dots: "·•◦●", blocks: "░▒▓█" } as const
const bold2 = { blocks: "█▓▒░ ", digits: "0123456789", letters: "MWHEX#-:." } as const

/**
 * Per-shader curated glyph ramps. Each ASCII shader's preset names map to
 * the actual glyph strings used by the `Ascii` component. Non-ASCII shaders
 * do not appear in this map.
 */
export const CHAR_SETS: Partial<Record<ShaderId, Record<string, string>>> = {
  "editorial.2.idle": editorial2,
  "editorial.2.interactive": editorial2,
  "saas.3.idle": saas3,
  "saas.3.interactive": saas3,
  "bold.2.idle": bold2,
  "bold.2.interactive": bold2,
}

export function getCharSet(shaderId: ShaderId, preset: string): string {
  const map = CHAR_SETS[shaderId]
  if (!map) return " .:-=+"
  return map[preset] ?? Object.values(map)[0] ?? " .:-=+"
}
