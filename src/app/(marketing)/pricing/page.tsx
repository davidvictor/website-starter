import {
  CtaSaas,
  FaqSaas,
  FooterSaas,
  LogosSaas,
  PricingSaas,
  StatsSaas,
} from "@/components/blocks"
import { FadeIn } from "@/components/motion/fade-in"
import { getBlockProps } from "@/lib/brand-resolver"
import { siteMetadata } from "@/lib/metadata"

export const metadata = siteMetadata({
  title: "Pricing",
  description:
    'Three plans. Honest pricing. No "contact sales" until you want us to.',
  path: "/pricing",
})

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Pricing
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="font-heading mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
              Three plans. Honestly priced.
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              No surprise tiers, no rug-pulls, no &ldquo;contact sales&rdquo;
              unless you actually want to talk to a human. Start free, scale on
              usage, switch annually if it makes the math cleaner.
            </p>
          </FadeIn>
        </div>
      </section>

      <PricingSaas {...getBlockProps("pricing")} />
      <StatsSaas {...getBlockProps("stats")} />
      <LogosSaas {...getBlockProps("logos")} />
      <FaqSaas {...getBlockProps("faq")} />
      <CtaSaas {...getBlockProps("cta")} />
      <FooterSaas {...getBlockProps("footer")} />
    </>
  )
}
