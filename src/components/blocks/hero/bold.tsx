import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/motion/fade-in"
import { GrainGradient } from "@/components/shaders/grain-gradient"
import { buttonVariants } from "@/components/ui/button"
import { taglines } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function HeroBold() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <GrainGradient
          colors={[
            "hsl(280 100% 60%)",
            "hsl(330 100% 60%)",
            "hsl(20 100% 60%)",
            "hsl(50 100% 60%)",
          ]}
          speed={0.4}
          intensity={0.8}
          noise={0.5}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/30 via-foreground/40 to-foreground/80" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-24 sm:px-6 sm:py-32 md:py-40 lg:px-8">
        <FadeIn className="flex items-center gap-3">
          <span className="size-2 animate-pulse rounded-full bg-background" />
          <span className="font-mono text-xs tracking-widest uppercase">
            shipping now · v0.42
          </span>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="font-heading max-w-5xl text-balance text-[clamp(3rem,11vw,8rem)] leading-[0.85] font-bold tracking-tighter">
            Computers
            <br />
            that finally
            <br />
            <span className="italic">get the assignment.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1} className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="max-w-xl text-lg leading-relaxed md:col-span-7 md:text-xl">
            {taglines.secondary}
          </p>
          <div className="flex flex-wrap items-end gap-3 md:col-span-5 md:justify-end">
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ size: "lg" }),
                "border-background bg-background text-foreground hover:bg-background/90"
              )}
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/customers"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-background/40 bg-transparent text-background hover:bg-background/10"
              )}
            >
              See it in production
            </Link>
          </div>
        </FadeIn>

        <FadeIn
          delay={0.15}
          className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-background/20 pt-8 md:grid-cols-4"
        >
          {[
            { label: "Tokens this quarter", value: "9.2T" },
            { label: "P50 streaming latency", value: "67ms" },
            { label: "Uptime since June", value: "99.997%" },
            { label: "Engineering team", value: "57" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="font-heading text-2xl font-bold tracking-tight tabular md:text-3xl">
                {stat.value}
              </span>
              <span className="text-xs text-background/70">{stat.label}</span>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  )
}
