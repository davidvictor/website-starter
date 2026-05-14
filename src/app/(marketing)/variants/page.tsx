import Link from "next/link"

import {
  CtaBold,
  CtaEditorial,
  CtaSaas,
  FaqBold,
  FaqEditorial,
  FaqSaas,
  FeaturesBold,
  FeaturesEditorial,
  FeaturesSaas,
  FooterBold,
  FooterEditorial,
  FooterSaas,
  HeroBold,
  HeroEditorial,
  HeroSaas,
  LogosBold,
  LogosEditorial,
  LogosSaas,
  PricingBold,
  PricingEditorial,
  PricingSaas,
  StatsBold,
  StatsEditorial,
  StatsSaas,
  TestimonialsBold,
  TestimonialsEditorial,
  TestimonialsSaas,
} from "@/components/blocks"

export const metadata = {
  title: "Variants · Nimbus",
  description:
    "Every marketing block in three styles — editorial, SaaS, bold. The design-system reference for composing pages.",
}

const blocks = [
  {
    id: "hero",
    label: "Hero",
    Editorial: HeroEditorial,
    Saas: HeroSaas,
    Bold: HeroBold,
  },
  {
    id: "logos",
    label: "Logos / social proof",
    Editorial: LogosEditorial,
    Saas: LogosSaas,
    Bold: LogosBold,
  },
  {
    id: "features",
    label: "Features",
    Editorial: FeaturesEditorial,
    Saas: FeaturesSaas,
    Bold: FeaturesBold,
  },
  {
    id: "stats",
    label: "Stats",
    Editorial: StatsEditorial,
    Saas: StatsSaas,
    Bold: StatsBold,
  },
  {
    id: "testimonials",
    label: "Testimonials",
    Editorial: TestimonialsEditorial,
    Saas: TestimonialsSaas,
    Bold: TestimonialsBold,
  },
  {
    id: "pricing",
    label: "Pricing",
    Editorial: PricingEditorial,
    Saas: PricingSaas,
    Bold: PricingBold,
  },
  {
    id: "faq",
    label: "FAQ",
    Editorial: FaqEditorial,
    Saas: FaqSaas,
    Bold: FaqBold,
  },
  {
    id: "cta",
    label: "CTA",
    Editorial: CtaEditorial,
    Saas: CtaSaas,
    Bold: CtaBold,
  },
  {
    id: "footer",
    label: "Footer",
    Editorial: FooterEditorial,
    Saas: FooterSaas,
    Bold: FooterBold,
  },
] as const

const VARIANTS = ["Editorial", "Saas", "Bold"] as const

export default function VariantsGalleryPage() {
  return (
    <div className="flex flex-col">
      {/* Sticky table of contents */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              /variants
            </p>
            <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Every block × every composition.
            </h1>
            <p className="max-w-2xl text-balance text-muted-foreground">
              Each marketing block ships in three compositions — editorial,
              saas, and bold. Compositions are the block layout; the theme
              (palette + typography) is independent. Switch themes from the dev
              panel to see this page under each.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2 border-t border-border pt-6">
            {blocks.map((b) => (
              <Link
                key={b.id}
                href={`#${b.id}`}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {b.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex flex-col">
        {blocks.map((block) => (
          <section
            key={block.id}
            id={block.id}
            className="scroll-mt-20 border-b border-border"
          >
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
              <div className="mb-8 flex items-baseline justify-between gap-4">
                <h2 className="font-heading text-3xl font-semibold tracking-tight">
                  {block.label}
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  3 compositions
                </span>
              </div>
            </div>

            {VARIANTS.map((v) => {
              const Component = block[v]
              return (
                <div key={v} className="border-t border-border bg-muted/10">
                  <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                    <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-background uppercase">
                      {v.toLowerCase()}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {`<${block.label.replace(/[^a-z]/gi, "")}${v} />`}
                    </span>
                  </div>
                  <Component />
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
