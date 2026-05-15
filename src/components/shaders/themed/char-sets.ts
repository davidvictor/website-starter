import type { ShaderId } from "./types"

const editorial2 = { marks: " .:-=+", rule: "─│┼", dots: "·:∶" } as const

/**
 * Per-shader curated glyph ramps. Each ASCII shader's preset names map to
 * the actual glyph strings used by the `Ascii` component. Non-ASCII shaders
 * do not appear in this map.
 */
export const CHAR_SETS: Partial<Record<ShaderId, Record<string, string>>> = {
  "editorial.2.idle": editorial2,
  "editorial.2.interactive": editorial2,
}

export function getCharSet(shaderId: ShaderId, preset: string): string {
  const map = CHAR_SETS[shaderId]
  if (!map) return " .:-=+"
  return map[preset] ?? Object.values(map)[0] ?? " .:-=+"
}
