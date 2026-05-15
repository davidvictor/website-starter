import Link from "next/link"
import { MarketingButton } from "@/components/marketing/marketing-button"
import { FadeIn } from "@/components/motion/fade-in"
import { TextEffect } from "@/components/typography/text-effect"
import type { CtaProps } from "../props"

export function CtaEditorial({ eyebrow, headline, cta }: CtaProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <FadeIn>
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {eyebrow ?? "Closing notes"}
              </span>
              <h2 className="font-heading mt-4 max-w-2xl text-4xl leading-tight font-medium tracking-tight md:text-5xl">
                {headline.before}{" "}
                {headline.emphasis && (
                  <TextEffect
                    as="em"
                    effect="accent"
                    className="font-heading italic"
                  >
                    {headline.emphasis}
                  </TextEffect>
                )}
                {headline.after ? ` ${headline.after}` : null}
              </h2>
            </div>
            <div className="flex flex-col items-start gap-3 md:col-span-5 md:items-end">
              {cta && (
                <>
                  <MarketingButton
                    href={cta.primary.href}
                    icon="arrow-up-right"
                  >
                    {cta.primary.label}
                  </MarketingButton>
                  {cta.secondary && (
                    <Link
                      href={cta.secondary.href}
                      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {cta.secondary.label}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
