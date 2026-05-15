import { CtaSaas, FooterSaas, StatsSaas } from "@/components/blocks"
import { FadeIn } from "@/components/motion/fade-in"
import { brand, teamCounts, valuesList } from "@/lib/brand"
import { getBlockProps } from "@/lib/brand-resolver"
import { formatMetric } from "@/lib/format"
import { siteMetadata } from "@/lib/metadata"

export const metadata = siteMetadata({
  title: "About",
  description: "Company-story scaffolding for the website starter.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <FadeIn className="md:col-span-7">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                About
              </p>
              <h1 className="font-heading mt-4 text-balance text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl md:text-7xl">
                We&apos;re building the cognitive layer.
              </h1>
              <p className="mt-8 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
                Nimbus was founded in {brand.founded} by a small group of
                infrastructure and research engineers who got tired of writing
                the same retry loop in seven languages. We started with the
                observation that the things between a model and a product —
                routing, fallbacks, evals, traces — were the actual product.
                Everything since has been an attempt to prove it.
              </p>
            </FadeIn>

            <FadeIn delay={0.1} className="md:col-span-5">
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-6 lg:p-8">
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Company snapshot
                </p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Founded</dt>
                  <dd className="tabular">{brand.founded}</dd>
                  <dt className="text-muted-foreground">Stage</dt>
                  <dd>{brand.funding.stage}</dd>
                  <dt className="text-muted-foreground">Valuation</dt>
                  <dd className="tabular">
                    ${formatMetric(brand.funding.valuation)}
                  </dd>
                  <dt className="text-muted-foreground">HQ</dt>
                  <dd>San Francisco</dd>
                  <dt className="text-muted-foreground">Headcount</dt>
                  <dd>
                    <span className="tabular">
                      {teamCounts.reduce((s, t) => s + t.value, 0)}
                    </span>{" "}
                    (and growing)
                  </dd>
                </dl>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <FadeIn>
            <div className="mb-12 flex items-center gap-4">
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Operating principles
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2">
            {valuesList.map((v, i) => (
              <FadeIn
                key={v.title}
                delay={0.05 + (i % 2) * 0.05}
                className="flex flex-col gap-3 border-l border-border pl-6"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-heading text-2xl font-medium tracking-tight">
                  {v.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <FadeIn>
            <h2 className="font-heading mb-12 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Team breakdown
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {teamCounts.map((t) => (
              <div
                key={t.label}
                className="flex flex-col gap-1 rounded-xl border border-border bg-muted/20 px-5 py-5"
              >
                <span className="font-heading text-3xl font-semibold tracking-tight tabular">
                  {t.value}
                </span>
                <span className="text-xs text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsSaas {...getBlockProps("stats")} />
      <CtaSaas {...getBlockProps("cta")} />
      <FooterSaas {...getBlockProps("footer")} />
    </>
  )
}
