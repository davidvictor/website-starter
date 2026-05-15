"use client"

import { Check } from "lucide-react"
import { MarketingButton } from "@/components/marketing/marketing-button"
import { AnimatedSwap } from "@/components/motion/animated-swap"
import { Stagger } from "@/components/motion/stagger"
import {
  PricingToggle,
  usePricingPeriod,
} from "@/components/pricing/pricing-toggle"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { PricingProps } from "../props"

export function PricingSaas({ headline, subhead, tiers }: PricingProps) {
  const period = usePricingPeriod()

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Pricing
          </p>
          <h2 className="font-heading max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {headline ?? "Start free. Scale honestly."}
          </h2>
          <p className="max-w-xl text-balance text-muted-foreground">
            {subhead ??
              "All plans include unlimited workspaces, SOC2 by default, and a real human you can email."}
          </p>
          <PricingToggle className="mt-2" />
        </div>

        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiers.map((tier) => {
            const activePrice =
              period === "year" ? tier.priceYearly : tier.price
            const formatted = activePrice ? formatPrice(activePrice) : null
            return (
              <Card
                key={tier.id}
                className={cn(
                  "relative flex flex-col",
                  tier.featured &&
                    "ring-2 ring-brand-accent/40 shadow-[var(--shadow-raised)]"
                )}
              >
                {tier.featured && (
                  <Badge className="absolute -top-3 left-6 bg-brand-accent text-brand-accent-foreground">
                    Most popular
                  </Badge>
                )}
                <CardHeader className="gap-2">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <div className="flex items-baseline gap-1">
                    <AnimatedSwap
                      stateKey={`${tier.id}-${period}`}
                      className="font-heading text-4xl font-semibold tracking-tight tabular"
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
                        <Check className="mt-0.5 size-4 shrink-0 text-foreground/70" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <MarketingButton
                    href="/contact"
                    variant={tier.featured ? "default" : "outline"}
                    icon="none"
                    className="w-full"
                  >
                    {tier.cta}
                  </MarketingButton>
                </CardFooter>
              </Card>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
