import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"
import { pricingTiers } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function PricingBold() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <h2 className="font-heading mb-16 max-w-4xl text-balance text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] font-bold tracking-tighter">
            Pick a tier.
            <br />
            <span className="text-muted-foreground">
              Outgrow it later.
            </span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => {
            const featured = tier.featured
            return (
              <FadeIn
                key={tier.id}
                delay={0.05 + i * 0.05}
                className={cn(
                  "group flex flex-col gap-6 rounded-3xl border p-8 transition-colors",
                  featured
                    ? "border-brand-accent bg-brand-accent text-brand-accent-foreground"
                    : "border-border bg-muted/20 hover:bg-muted/40"
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-3xl font-bold tracking-tight">
                    {tier.name}
                  </h3>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      featured
                        ? "text-brand-accent-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    /0{i + 1}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    featured
                      ? "text-brand-accent-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {tier.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-5xl font-bold tracking-tighter md:text-6xl">
                    {tier.price}
                  </span>
                  {tier.cadence && (
                    <span
                      className={cn(
                        "text-sm",
                        featured
                          ? "text-brand-accent-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {tier.cadence}
                    </span>
                  )}
                </div>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          featured
                            ? "text-brand-accent-foreground"
                            : "text-foreground/70"
                        )}
                      />
                      <span
                        className={
                          featured
                            ? "text-brand-accent-foreground/90"
                            : undefined
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-auto",
                    featured
                      ? "border-brand-accent-foreground bg-brand-accent-foreground text-brand-accent hover:bg-brand-accent-foreground/90"
                      : ""
                  )}
                >
                  {tier.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
