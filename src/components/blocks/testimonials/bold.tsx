import { Quote } from "lucide-react"

import { FadeIn } from "@/components/motion/fade-in"
import { testimonials } from "@/lib/brand"

export function TestimonialsBold() {
  const featured = testimonials[0]
  const rest = testimonials.slice(1, 5)
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <h2 className="font-heading mb-16 max-w-3xl text-balance text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] font-bold tracking-tighter">
            Don&apos;t take it from us.
            <br />
            <span className="text-muted-foreground">
              Take it from these people.
            </span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Big featured quote */}
          <FadeIn
            delay={0.05}
            className="relative flex flex-col gap-6 rounded-2xl border border-border bg-foreground p-8 text-background lg:col-span-7 lg:p-12"
          >
            <Quote className="size-8 opacity-30" />
            <p className="font-heading text-balance text-2xl leading-snug font-medium tracking-tight md:text-3xl">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <div className="mt-auto flex items-center gap-3 border-t border-background/15 pt-5">
              <span className="grid size-10 place-items-center rounded-full border border-background/40 font-mono text-xs">
                {featured.avatar}
              </span>
              <div>
                <p className="text-sm font-medium tracking-tight">
                  {featured.name}
                </p>
                <p className="text-xs text-background/70">
                  {featured.title} · {featured.company}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Sidebar grid */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-5 lg:grid-cols-1 lg:grid-rows-2">
            {rest.slice(0, 2).map((t, i) => (
              <FadeIn
                key={t.name}
                delay={0.1 + i * 0.05}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-background p-6"
              >
                <p className="text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="grid size-7 place-items-center rounded-full border border-border bg-muted/40 font-mono text-[10px]">
                    {t.avatar}
                  </span>
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">· {t.company}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
