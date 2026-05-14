import { FadeIn } from "@/components/motion/fade-in"
import { stats } from "@/lib/brand"

export function StatsBold() {
  return (
    <section className="border-b border-border bg-foreground py-20 text-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="mb-12 font-mono text-xs tracking-widest uppercase">
            Last quarter, by the numbers
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 divide-y divide-background/15 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn
              key={stat.label}
              delay={0.05 + i * 0.05}
              className="flex flex-col gap-3 px-2 py-6 md:py-2"
            >
              <span className="font-heading text-[clamp(3rem,8vw,6rem)] leading-none font-bold tracking-tighter">
                {stat.value}
              </span>
              <span className="text-sm leading-relaxed text-background/70">
                {stat.label}
              </span>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
