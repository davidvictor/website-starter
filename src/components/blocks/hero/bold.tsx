import { MarketingButton } from "@/components/marketing/marketing-button"
import { FadeIn } from "@/components/motion/fade-in"
import { ThemedShader } from "@/components/shaders/themed/themed-shader"
import { TextEffect } from "@/components/typography/text-effect"
import type { HeroProps } from "../props"

export function HeroBold({
  eyebrow,
  headline,
  tagline,
  cta,
  stats,
}: HeroProps) {
  const displayStats = stats?.slice(0, 4) ?? []

  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <ThemedShader id="bold.1.idle" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/30 via-foreground/40 to-foreground/80" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-24 sm:px-6 sm:py-32 md:py-40 lg:px-8">
        <FadeIn className="flex items-center gap-3">
          <span className="size-2 animate-pulse rounded-full bg-background motion-reduce:animate-none" />
          <span className="font-mono text-xs tracking-widest uppercase">
            {eyebrow ?? "shipping now"}
          </span>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="font-heading max-w-5xl text-[clamp(3rem,11vw,8rem)] leading-[0.85] font-bold tracking-tighter">
            {headline.before}
            <br />
            <TextEffect
              as="span"
              effect="shimmer"
              className="font-heading italic"
            >
              {headline.emphasis}
            </TextEffect>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="max-w-xl text-lg leading-relaxed md:col-span-7 md:text-xl">
            {tagline}
          </p>
          <div className="flex flex-wrap items-end gap-3 md:col-span-5 md:justify-end">
            {cta && (
              <>
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
              </>
            )}
          </div>
        </FadeIn>

        <FadeIn
          delay={0.15}
          className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-background/20 pt-8 md:grid-cols-4"
        >
          {displayStats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-heading text-2xl font-bold tracking-tight tabular md:text-3xl">
                {stat.value}
              </span>
              <span className="text-xs text-background/70">{stat.label}</span>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  )
}
