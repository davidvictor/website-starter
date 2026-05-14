import { FadeIn } from "@/components/motion/fade-in"
import { testimonials } from "@/lib/brand"

export function TestimonialsEditorial() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <div className="mb-16 flex items-center gap-4">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              04 — Field notes
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-2">
          {testimonials.slice(0, 4).map((t, i) => (
            <FadeIn
              key={t.name}
              delay={0.05 + (i % 2) * 0.05}
              className="flex flex-col gap-6"
            >
              <p className="font-heading text-balance text-xl leading-snug tracking-tight md:text-2xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <span className="grid size-9 place-items-center rounded-full border border-border bg-muted/50 font-mono text-xs">
                  {t.avatar}
                </span>
                <div className="flex flex-col gap-0">
                  <span className="text-sm font-medium tracking-tight">
                    {t.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.title} · {t.company}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
