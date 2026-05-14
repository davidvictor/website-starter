import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"
import { MeshGradient } from "@/components/shaders/mesh-gradient"
import { taglines } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function HeroSaas() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <MeshGradient
          colors={[
            "hsl(220 80% 60%)",
            "hsl(270 70% 60%)",
            "hsl(310 75% 60%)",
            "hsl(30 90% 60%)",
          ]}
          speed={0.2}
          distortion={0.9}
          swirl={0.35}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 sm:py-32 md:py-40 lg:px-8">
        <FadeIn>
          <Badge variant="secondary" className="gap-1.5 backdrop-blur">
            <Sparkles className="size-3" />
            Series B · led by Sequoia
          </Badge>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="font-heading max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            Computers that finally{" "}
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              get the assignment.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {taglines.secondary}
          </p>
        </FadeIn>

        <FadeIn
          delay={0.15}
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/pricing"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Start free
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Talk to sales
          </Link>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-2 text-xs text-muted-foreground">
            No credit card. SOC2 by default.{" "}
            <span className="underline-offset-2 hover:underline">
              5-minute install
            </span>
            .
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
