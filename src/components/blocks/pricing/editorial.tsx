import Link from "next/link"
import { Check } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"
import { pricingTiers } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function PricingEditorial() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <div className="mb-12 flex items-center gap-4">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              05 — Pricing
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-12">
            <h2 className="font-heading text-balance text-4xl leading-tight font-medium tracking-tight md:col-span-7 md:text-5xl">
              Three brackets. No surprises.
            </h2>
            <p className="text-balance text-muted-foreground md:col-span-5 md:pt-3">
              We use usage-based pricing because we&apos;d rather you pay less
              while you&apos;re still figuring it out. The pricing page is the
              pricing page. There&apos;s no second pricing page.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {pricingTiers.map((tier, i) => (
            <FadeIn
              key={tier.id}
              delay={0.05 + i * 0.05}
              className="flex flex-col gap-6 px-8 py-10"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3
                  className={cn(
                    "font-heading text-2xl font-medium tracking-tight",
                    tier.featured && "text-brand-accent"
                  )}
                >
                  {tier.name}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  /0{i + 1}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tier.description}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-4xl font-medium tracking-tight">
                  {tier.price}
                </span>
                {tier.cadence && (
                  <span className="text-sm text-muted-foreground">
                    {tier.cadence}
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-foreground/60" />
                    <span className="text-foreground/85">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({
                    variant: tier.featured ? "default" : "outline",
                    size: "sm",
                  }),
                  "mt-auto"
                )}
              >
                {tier.cta}
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
