import { Beaker, Brain, Receipt, ShieldCheck, Wrench, Zap } from "lucide-react"

import { FadeIn } from "@/components/motion/fade-in"
import { features } from "@/lib/brand"
import { cn } from "@/lib/utils"

const ICONS = {
  Brain,
  Zap,
  Wrench,
  Beaker,
  ShieldCheck,
  Receipt,
} as const

export function FeaturesBold() {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <div className="mb-16 flex flex-col gap-4">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Capabilities
            </span>
            <h2 className="font-heading max-w-3xl text-balance text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] font-bold tracking-tighter">
              Six primitives.
              <br />
              <span className="text-muted-foreground">Zero ceremony.</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = ICONS[feature.icon as keyof typeof ICONS] ?? Brain
            return (
              <FadeIn
                key={feature.title}
                delay={0.05 + (i % 3) * 0.05}
                className={cn(
                  "group relative flex flex-col gap-5 border-border bg-background p-8 transition-colors hover:bg-muted/30",
                  // Build a tight grid with shared borders
                  "border-b border-l",
                  i < 3 && "lg:border-t",
                  i % 2 === 0 && "md:border-r lg:border-r-0",
                  i % 3 === 2 && "lg:border-r",
                  i % 3 === 0 && "lg:border-r"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="grid size-12 place-items-center rounded-lg bg-foreground text-background">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    /{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
