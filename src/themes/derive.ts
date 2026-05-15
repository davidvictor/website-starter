/**
 * Engine entry points. Color tokens are driven by the registry in
 * `tokens.ts` — this module is now just the public alias + shadow
 * derivation.
 */

import type {
  ControllerInputs,
  ControllerTheme,
  DerivationProfile,
} from "./controller-types"
import { type ColorTokens, deriveColorTokens, type Mode } from "./tokens"
import {
  DEFAULT_SHADOWS_DARK,
  DEFAULT_SHADOWS_LIGHT,
  type ShadowTokens,
} from "./types"

/**
 * Resolve the full color token surface for a (theme inputs, derivation,
 * mode) triple. Thin alias for `deriveColorTokens` — kept for backward
 * compatibility with prior call sites.
 */
export function deriveTokens(
  inputs: ControllerInputs,
  derivation: DerivationProfile,
  mode: Mode
): ColorTokens {
  return deriveColorTokens(inputs, derivation, mode)
}

/**
 * Polish shadow tokens. Starts from the mode-defaults baked in the
 * polish system (ADR 0003) and layers any per-theme overrides on top.
 *
 * Pass a `ControllerTheme` to apply that theme's `surface.shadows`
 * overrides; omit (or pass `undefined`) for plain mode defaults.
 */
export function deriveShadows(
  mode: Mode,
  theme?: ControllerTheme
): ShadowTokens {
  const base = mode === "dark" ? DEFAULT_SHADOWS_DARK : DEFAULT_SHADOWS_LIGHT
  const override = theme?.surface?.shadows?.[mode]
  return override ? { ...base, ...override } : base
}
