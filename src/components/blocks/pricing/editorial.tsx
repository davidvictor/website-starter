"use client"

import { Check } from "lucide-react"
import { MarketingButton } from "@/components/marketing/marketing-button"
import { AnimatedSwap } from "@/components/motion/animated-swap"
import { FadeIn } from "@/components/motion/fade-in"
import {
  PricingToggle,
  usePricingPeriod,
} from "@/components/pricing/pricing-toggle"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PricingProps } from "../props"

export function PricingEditorial({ headline, subhead, tiers }: PricingProps) {
  const period = usePricingPeriod()

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
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-12">
            <h2 className="font-heading text-4xl leading-tight font-medium tracking-tight md:col-span-7 md:text-5xl">
              {headline ?? "Three brackets. No surprises."}
            </h2>
            <p className="text-balance text-muted-foreground md:col-span-5 md:pt-3">
              {subhead ??
                "We use usage-based pricing because we'd rather you pay less while you're still figuring it out. The pricing page is the pricing page. There's no second pricing page."}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-12 flex justify-end">
            <PricingToggle />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {tiers.map((tier, i) => {
            const activePrice =
              period === "year" ? tier.priceYearly : tier.price
            const formatted = activePrice ? formatPrice(activePrice) : null
            return (
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
                  <span className="font-mono text-xs text-muted-foreground tabular">
                    /0{i + 1}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tier.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <AnimatedSwap
                    stateKey={`${tier.id}-${period}`}
                    className="font-heading text-4xl font-medium tracking-tight tabular"
                  >
                    {formatted ? formatted.amount : "Talk to us"}
                  </AnimatedSwap>
                  {formatted?.cadence && (
                    <span className="text-sm text-muted-foreground tabular">
                      {formatted.cadence}
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
                <MarketingButton
                  href="/contact"
                  variant={tier.featured ? "default" : "outline"}
                  size="sm"
                  icon="none"
                  className="mt-auto"
                >
                  {tier.cta}
                </MarketingButton>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
