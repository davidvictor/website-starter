// src/components/shaders/themed/char-sets.ts
import type { ShaderId } from "./types"

/**
 * Per-shader curated glyph ramps. Each ASCII shader's preset names map to
 * the actual glyph strings used by the `Ascii` component. Non-ASCII shaders
 * do not appear in this map.
 *
 * Filled in incrementally as each ASCII shader lands (Phase 8). Initial entries
 * are added with the editorial.2 Letterpress shader.
 */
export const CHAR_SETS: Partial<Record<ShaderId, Record<string, string>>> = {}

export function getCharSet(shaderId: ShaderId, preset: string): string {
  const map = CHAR_SETS[shaderId]
  if (!map) return " .:-=+" // safe fallback — any Ascii input renders
  return map[preset] ?? Object.values(map)[0] ?? " .:-=+"
}
