import { MarketingButton } from "@/components/marketing/marketing-button"
import { FadeIn } from "@/components/motion/fade-in"
import { ThemedShader } from "@/components/shaders/themed/themed-shader"
import { TextEffect } from "@/components/typography/text-effect"
import type { CtaProps } from "../props"

export function CtaSaas({ headline, body, cta }: CtaProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 shadow-[var(--shadow-subtle)]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <ThemedShader id="saas.2.idle" className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
          </div>

          <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center sm:px-12 sm:py-20">
            <FadeIn>
              <h2 className="font-heading max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                {headline.before}{" "}
                {headline.emphasis && (
                  <TextEffect effect="gradient">{headline.emphasis}</TextEffect>
                )}
                {headline.after ? ` ${headline.after}` : null}
              </h2>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="max-w-xl text-balance text-muted-foreground">
                {body}
              </p>
            </FadeIn>
            {cta && (
              <FadeIn
                delay={0.1}
                className="flex flex-wrap items-center justify-center gap-3"
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
          </div>
        </div>
      </div>
    </section>
  )
}
