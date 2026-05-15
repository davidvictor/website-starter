import { MarketingButton } from "@/components/marketing/marketing-button"
import { FadeIn } from "@/components/motion/fade-in"
import { ThemedShader } from "@/components/shaders/themed/themed-shader"
import { TextEffect } from "@/components/typography/text-effect"
import type { CtaProps } from "../props"

export function CtaBold({ eyebrow, headline, body, cta }: CtaProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <ThemedShader id="bold.3.idle" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/30 via-foreground/50 to-foreground/80" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-24 sm:px-6 sm:py-32 md:py-40 lg:px-8">
        <FadeIn>
          <span className="font-mono text-xs tracking-widest uppercase">
            {eyebrow ?? "One last thing"}
          </span>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2 className="font-heading max-w-4xl text-[clamp(2.5rem,9vw,7rem)] leading-[0.9] font-bold tracking-tighter">
            {headline.before}
            {headline.emphasis && (
              <>
                <br />
                <TextEffect effect="shimmer">{headline.emphasis}</TextEffect>
              </>
            )}
            {headline.after ? ` ${headline.after}` : null}
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="max-w-xl text-lg leading-relaxed">{body}</p>
        </FadeIn>
        {cta && (
          <FadeIn delay={0.15} className="flex flex-wrap items-center gap-3">
            <MarketingButton
              href={cta.primary.href}
              className="border-background bg-background text-foreground hover:bg-background/90"
            >
              {cta.primary.label}
            </MarketingButton>
            {cta.secondary && (
              <MarketingButton
                href={cta.secondary.href}
                variant="outline"
                icon="none"
                className="border-background/40 bg-transparent text-background hover:bg-background/10"
              >
                {cta.secondary.label}
              </MarketingButton>
            )}
          </FadeIn>
        )}
      </div>
    </section>
  )
}
