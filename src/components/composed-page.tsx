import { Fragment } from "react"
import {
  BLOCK_ORDER,
  BLOCK_REGISTRY,
  type BlockKind,
} from "@/components/blocks"
import { getBlockProps } from "@/lib/brand-resolver"
import { type CompositionId, findComposition } from "@/lib/compositions"

/**
 * Render a full marketing page from a composition id. Walks the
 * canonical block order, looks up each kind's slot in the composition,
 * pulls default props from `getBlockProps(kind)`, layers any per-slot
 * prop overrides, and renders the variant.
 *
 * Compositions can mix variants per block: `slots: { hero: "editorial",
 * pricing: "bold" }` is fully valid — every block is independent. Slots
 * can also use `{ variantId, props: { tagline: "Custom" } }` to layer
 * per-instance prop overrides on top of the default brand data.
 */
export function ComposedPage({
  compositionId,
}: {
  compositionId: CompositionId
}) {
  const comp = findComposition(compositionId)
  if (!comp) return null

  return (
    <>
      {BLOCK_ORDER.map((kind) => {
        const slot = comp.slots[kind]
        const registry = BLOCK_REGISTRY[kind]

        const variantId =
          typeof slot === "string"
            ? slot
            : (slot?.variantId ?? Object.keys(registry)[0])
        if (!variantId) return null

        const variant = registry[variantId]
        if (!variant) return null

        // Default props from brand + per-slot overrides.
        const defaults = getBlockProps(kind as BlockKind)
        const overrides = typeof slot === "object" ? slot.props : undefined
        const props = overrides ? { ...defaults, ...overrides } : defaults

        const Component = variant.Component as React.ComponentType<typeof props>
        return (
          <Fragment key={`${kind}-${variantId}`}>
            <Component {...props} />
          </Fragment>
        )
      })}
    </>
  )
}
