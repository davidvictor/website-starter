import { FadeIn } from "@/components/motion/fade-in"
import type { FaqProps } from "../props"

export function FaqEditorial({ items }: FaqProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <div className="mb-12 flex items-center gap-4">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              06 — FAQ
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <FadeIn delay={0.05} className="md:col-span-4">
            <h2 className="font-heading text-3xl leading-tight font-medium tracking-tight md:text-4xl">
              Frequently asked,
              <br />
              actually answered.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              If your question isn&apos;t here, our team replies to email within
              a business day.
            </p>
          </FadeIn>

          <dl className="flex flex-col md:col-span-8">
            {items.map((item, i) => (
              <FadeIn
                key={item.question}
                delay={0.05 + (i % 3) * 0.04}
                className="flex flex-col gap-3 border-b border-border py-8 last:border-b-0"
              >
                <dt className="font-heading text-lg font-medium tracking-tight">
                  {item.question}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </dd>
              </FadeIn>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
