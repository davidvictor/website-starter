import { FadeIn } from "@/components/motion/fade-in"
import { features } from "@/lib/brand"

export function FeaturesEditorial() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <FadeIn>
          <div className="mb-12 flex items-center gap-4">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              02 — Capabilities
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-12">
            <h2 className="font-heading text-balance text-4xl leading-tight font-medium tracking-tight md:col-span-7 md:text-5xl">
              The cognitive primitives that ship.
            </h2>
            <p className="text-balance text-muted-foreground md:col-span-5 md:pt-3">
              We don&apos;t sell a model. We sell the small, well-engineered
              surface around the model: the layer that turns a probability
              distribution into a production system.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn
              key={feature.title}
              delay={0.05 + (i % 3) * 0.05}
              className="flex flex-col gap-3 border-l border-border pl-6"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-xl font-medium tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
