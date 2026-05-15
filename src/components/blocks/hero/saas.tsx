import { Sparkles } from "lucide-react"
import { MarketingButton } from "@/components/marketing/marketing-button"
import { FadeIn } from "@/components/motion/fade-in"
import { ThemedShader } from "@/components/shaders/themed/themed-shader"
import { TextEffect } from "@/components/typography/text-effect"
import { Badge } from "@/components/ui/badge"
import type { HeroProps } from "../props"

export function HeroSaas({
  eyebrow,
  headline,
  tagline,
  cta,
  proof,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <ThemedShader id="saas.1.idle" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 sm:py-32 md:py-40 lg:px-8">
        <FadeIn>
          <Badge variant="secondary" className="gap-1.5 backdrop-blur">
            <Sparkles className="size-3" />
            {eyebrow}
          </Badge>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="font-heading max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            {headline.before}{" "}
            <TextEffect effect="shimmer">{headline.emphasis}</TextEffect>
            {headline.after ? ` ${headline.after}` : null}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {tagline}
          </p>
        </FadeIn>

        {cta && (
          <FadeIn
            delay={0.15}
            className="mt-4 flex flex-wrap items-center justify-center gap-3"
          >
            <MarketingButton href={cta.primary.href}>
              {cta.primary.label}
            </MarketingButton>
            {cta.secondary && (
              <MarketingButton
                href={cta.secondary.href}
                variant="outline"
                icon="none"
              >
                {cta.secondary.label}
              </MarketingButton>
            )}
          </FadeIn>
        )}

        {proof && (
          <FadeIn delay={0.2}>
            <p className="mt-2 text-xs text-muted-foreground">{proof}</p>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
