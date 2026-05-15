/**
 * Theme type surface — re-exports the color token registry's types and
 * keeps radii/typography/shadow shapes.
 *
 * The canonical color tokens live in `tokens.ts`. Adding a token means
 * adding an entry there; this file's exports flow through unchanged.
 */

import type { FontKey } from "@/lib/fonts"

export {
  COLOR_TOKEN_KEYS,
  COLOR_TOKEN_TO_CSS_VAR,
  COLOR_TOKENS,
  type ColorTokenCategory,
  type ColorTokenKey,
  type ColorTokenSpec,
  type ColorTokens,
} from "./tokens"

export type RadiiTokens = {
  /** Root radius in rem (e.g. "0.5rem", "0.75rem"). */
  radius: string
}

/**
 * Polish shadow scale — see docs/adr/0003-surface-treatment.md.
 *
 * Three tokens cover the elevation range:
 * - `subtle` — card surfaces, raised tiles
 * - `raised` — popovers, dropdowns, menus, standard cards
 * - `overlay` — dialogs, sheets, drawers, modal-class surfaces
 *
 * Values are full CSS `box-shadow` strings. Dark themes typically use
 * higher opacity so shadows read against dark surfaces.
 */
export type ShadowTokens = {
  subtle: string
  raised: string
  overlay: string
}

export const DEFAULT_SHADOWS_LIGHT: ShadowTokens = {
  subtle: "0 1px 2px rgb(0 0 0 / 0.04)",
  raised: "0 4px 12px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04)",
  overlay: "0 12px 32px rgb(0 0 0 / 0.12), 0 4px 8px rgb(0 0 0 / 0.06)",
}

export const DEFAULT_SHADOWS_DARK: ShadowTokens = {
  subtle: "0 1px 2px rgb(0 0 0 / 0.3)",
  raised: "0 4px 12px rgb(0 0 0 / 0.35), 0 1px 2px rgb(0 0 0 / 0.25)",
  overlay: "0 12px 32px rgb(0 0 0 / 0.5), 0 4px 8px rgb(0 0 0 / 0.3)",
}

export const SHADOW_TOKEN_TO_CSS_VAR: Record<keyof ShadowTokens, string> = {
  subtle: "--shadow-subtle",
  raised: "--shadow-raised",
  overlay: "--shadow-overlay",
}

export type TypographyTokens = {
  sans: FontKey
  mono: FontKey
  heading: FontKey
}
