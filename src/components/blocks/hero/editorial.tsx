import Link from "next/link"
import { MarketingButton } from "@/components/marketing/marketing-button"
import { FadeIn } from "@/components/motion/fade-in"
import { TextEffect } from "@/components/typography/text-effect"
import type { HeroProps } from "../props"

export function HeroEditorial({
  brand,
  eyebrow,
  headline,
  tagline,
  cta,
  stats,
}: HeroProps) {
  const displayStats = stats?.slice(0, 4) ?? []

  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 sm:py-28 md:grid-cols-12 md:gap-8 md:py-32 lg:px-8 lg:py-40">
        <div className="md:col-span-7 md:pr-8">
          <FadeIn>
            <div className="mb-8 flex items-center gap-4">
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {eyebrow ?? "01 — Manifesto"}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="font-heading text-5xl leading-[0.95] font-medium tracking-tight sm:text-6xl md:text-7xl">
              {headline.before}{" "}
              <TextEffect
                as="em"
                effect="accent"
                className="font-heading italic"
              >
                {headline.emphasis}
              </TextEffect>
              {headline.after ? ` ${headline.after}` : null}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-8 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
              {tagline}
            </p>
          </FadeIn>
          {cta && (
            <FadeIn delay={0.15}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                <MarketingButton href={cta.primary.href} icon="arrow-up-right">
                  {cta.primary.label}
                </MarketingButton>
                {cta.secondary && (
                  <Link
                    href={cta.secondary.href}
                    className="text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    {cta.secondary.label}
                  </Link>
                )}
              </div>
            </FadeIn>
          )}
        </div>

        <FadeIn
          delay={0.2}
          className="md:col-span-5 md:border-l md:border-border md:pl-8"
        >
          <div className="flex flex-col gap-8">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              In production at
            </p>
            <div className="grid grid-cols-2 gap-y-6">
              {displayStats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1">
                  <span className="font-heading text-3xl font-medium tracking-tight tabular">
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t border-border pt-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                A research-led infrastructure company building the cognitive
                primitives behind tomorrow&apos;s reasoning systems. Founded{" "}
                {brand.founded}, headquartered in San Francisco.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
