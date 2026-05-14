import { ArrowUpRight } from "lucide-react"
import {
  CtaSaas,
  FooterSaas,
  LogosSaas,
  TestimonialsSaas,
} from "@/components/blocks"
import { FadeIn } from "@/components/motion/fade-in"
import { customers } from "@/lib/brand"
import { formatMetric } from "@/lib/format"

export const metadata = {
  title: "Customers · Nimbus",
}

export default function CustomersPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Customers
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="font-heading mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
              The teams shipping reasoning to production.
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Robotics labs, dev tools companies, fintech infra teams. Big
              companies you&apos;d recognize and small ones that will be on this
              page next year.
            </p>
          </FadeIn>
        </div>
      </section>

      <LogosSaas />

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="flex flex-col gap-16">
            {customers.map((c, i) => (
              <FadeIn
                key={c.name}
                delay={0.05 + (i % 3) * 0.05}
                className="grid grid-cols-1 gap-8 md:grid-cols-12"
              >
                <div className="md:col-span-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-xl border border-border bg-muted/40 font-mono text-sm">
                      {c.logo}
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-semibold tracking-tight">
                        {c.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {c.industry} · {c.size}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-1 rounded-xl border border-border bg-muted/20 p-4">
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      {c.metric.label}
                    </p>
                    <p className="font-heading text-3xl font-semibold tracking-tight tabular">
                      {formatMetric(c.metric.value)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-6 md:col-span-8">
                  <p className="font-heading text-balance text-2xl leading-snug font-medium tracking-tight md:text-3xl">
                    &ldquo;{c.quote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">
                      {c.contact}
                    </span>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      Read case study
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSaas />
      <CtaSaas />
      <FooterSaas />
    </>
  )
}
