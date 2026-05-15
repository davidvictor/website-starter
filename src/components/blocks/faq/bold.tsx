import { FadeIn } from "@/components/motion/fade-in"
import type { FaqProps } from "../props"

export function FaqBold({ items }: FaqProps) {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <h2 className="font-heading mb-16 max-w-4xl text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] font-bold tracking-tighter">
            Things people ask.
            <br />
            <span className="text-muted-foreground">
              Things we answer plainly.
            </span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
          {items.map((item, i) => (
            <FadeIn
              key={item.question}
              delay={0.05 + (i % 3) * 0.04}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6 lg:p-8"
            >
              <span className="font-mono text-xs text-muted-foreground">
                Q.{String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-xl font-bold tracking-tight">
                {item.question}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
