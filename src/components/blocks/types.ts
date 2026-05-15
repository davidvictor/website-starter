/**
 * Block kinds and variant registries.
 *
 * Each block kind (Hero, Features, Pricing, ...) ships one or more
 * variants. Variants are registered in a typed map per kind so the
 * composition system can look them up by id at runtime — no more
 * importing `HeroSaas` by name.
 *
 * The `BlockPropsByKind` map in `props.ts` defines what data each
 * kind's variants conceptually accept. Today most variants are
 * zero-arg and read `@/lib/brand` directly — they still satisfy
 * `ComponentType<P>` because TS allows ignoring extra props. When a
 * variant migrates to accept its kind's props, the type narrows
 * naturally.
 */

import type { ComponentType } from "react"
import type { BlockPropsByKind } from "./props"

export type BlockKind = keyof BlockPropsByKind

/**
 * A single variant entry. `id` is the lookup key used in composition
 * slot configs; `label` is for the dev panel.
 */
export type BlockVariant<P = Record<string, never>> = {
  id: string
  label?: string
  Component: ComponentType<P>
}

export type VariantRegistry<P = Record<string, never>> = Record<
  string,
  BlockVariant<P>
>

/** Variant registry typed by block kind. */
export type VariantRegistryFor<K extends BlockKind> = VariantRegistry<
  BlockPropsByKind[K]
>
