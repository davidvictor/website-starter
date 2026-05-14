import {
  BUILT_IN_FONTS,
  type BuiltInFontKey,
  type FontKey,
  loadFontIfRemote,
  resolveFontFamily,
} from "@/lib/fonts"

import type { ControllerRegistry, ControllerTheme } from "./controller-types"
import { deriveTokens } from "./derive"
import registryJson from "./registry.json"
import { COLOR_TOKEN_TO_CSS_VAR, type ColorTokens } from "./types"

export const baseRegistry = registryJson as ControllerRegistry

export const baseThemes: readonly ControllerTheme[] = baseRegistry.themes
export const defaultThemeId = baseRegistry.defaultThemeId

export function findTheme(
  themes: readonly ControllerTheme[],
  id: string
): ControllerTheme | undefined {
  return themes.find((t) => t.id === id)
}

/**
 * Derive resolved color tokens for a theme + mode. Returns a fresh
 * ColorTokens object with semantic, surface, and brand tokens filled in.
 * Per-token overrides on the theme are applied on top.
 */
export function resolveTokens(
  theme: ControllerTheme,
  mode: "light" | "dark"
): ColorTokens {
  const derived = deriveTokens(theme.inputs, theme.derivation, mode)
  const overrides = theme.overrides?.[mode]
  return overrides ? { ...derived, ...overrides } : derived
}

/**
 * Convert resolved tokens into CSS variable assignments. Same shape as
 * before so applyTheme() can keep its contract.
 */
export function tokensToCssVars(
  tokens: ColorTokens,
  theme: ControllerTheme
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of Object.keys(tokens) as (keyof ColorTokens)[]) {
    out[COLOR_TOKEN_TO_CSS_VAR[key]] = tokens[key]
  }
  out["--radius"] = theme.derivation.radius
  out["--font-sans"] = resolveFontFamily(theme.derivation.fonts.sans)
  out["--font-mono"] = resolveFontFamily(theme.derivation.fonts.mono)
  out["--font-heading"] = resolveFontFamily(theme.derivation.fonts.heading)
  return out
}

/**
 * Apply a theme to a target element. Sets CSS variables, data-theme,
 * data-accent-usage, and toggles `.dark`.
 *
 * Side effect: loads any remote (Google) fonts referenced by the theme.
 */
export function applyTheme(
  el: HTMLElement,
  theme: ControllerTheme,
  mode: "light" | "dark"
) {
  // Kick off async font loading before applying — the variable points to
  // the family name with a fallback stack, so layout doesn't block.
  loadFontIfRemote(theme.derivation.fonts.sans)
  loadFontIfRemote(theme.derivation.fonts.mono)
  loadFontIfRemote(theme.derivation.fonts.heading)

  const tokens = resolveTokens(theme, mode)
  const vars = tokensToCssVars(tokens, theme)
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value)
  }
  el.dataset.theme = theme.id
  el.dataset.accentUsage = theme.derivation.accentUsage
  el.dataset.contrast = theme.derivation.contrast
  if (mode === "dark") {
    el.classList.add("dark")
  } else {
    el.classList.remove("dark")
  }
}

export const FONT_KEYS = Object.keys(BUILT_IN_FONTS) as BuiltInFontKey[]

export type { FontKey }
