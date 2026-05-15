import Link from "next/link"
import { BLOCK_ORDER, BLOCK_REGISTRY } from "@/components/blocks"

export const metadata = {
  title: "Variants · Nimbus",
  description:
    "Every marketing block in every composition variant — the design-system reference for composing pages.",
}

/** Friendly labels per block kind. Add a kind → add a label. */
const KIND_LABELS: Record<string, string> = {
  hero: "Hero",
  logos: "Logos / social proof",
  features: "Features",
  stats: "Stats",
  testimonials: "Testimonials",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "CTA",
  footer: "Footer",
}

export default function VariantsGalleryPage() {
  return (
    <div className="flex flex-col">
      {/* Sticky table of contents */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              /variants
            </p>
            <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Every block × every composition.
            </h1>
            <p className="max-w-2xl text-balance text-muted-foreground">
              Each marketing block ships with one or more compositions. The
              theme (palette + typography) is independent — switch from the dev
              panel to see this page under each.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-border pt-6">
            {BLOCK_ORDER.map((kind) => (
              <Link
                key={kind}
                href={`#${kind}`}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {KIND_LABELS[kind] ?? kind}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex flex-col">
        {BLOCK_ORDER.map((kind) => {
          const variants = Object.values(BLOCK_REGISTRY[kind])
          const label = KIND_LABELS[kind] ?? kind
          return (
            <section
              key={kind}
              id={kind}
              className="scroll-mt-20 border-b border-border"
            >
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <div className="mb-8 flex items-baseline justify-between gap-4">
                  <h2 className="font-heading text-3xl font-semibold tracking-tight">
                    {label}
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground">
                    {variants.length} composition
                    {variants.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {variants.map((variant) => {
                const Component = variant.Component
                return (
                  <div
                    key={variant.id}
                    className="border-t border-border bg-muted/10"
                  >
                    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                      <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-background uppercase">
                        {variant.label ?? variant.id}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {kind}/{variant.id}
                      </span>
                    </div>
                    <Component />
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
