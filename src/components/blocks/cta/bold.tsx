import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/motion/fade-in"
import { MeshGradient } from "@/components/shaders/mesh-gradient"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CtaBold() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <MeshGradient
          colors={[
            "hsl(280 100% 60%)",
            "hsl(330 100% 60%)",
            "hsl(20 100% 60%)",
            "hsl(50 100% 60%)",
          ]}
          speed={0.3}
          distortion={1.2}
          swirl={0.5}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/30 via-foreground/50 to-foreground/80" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-24 sm:px-6 sm:py-32 md:py-40 lg:px-8">
        <FadeIn>
          <span className="font-mono text-xs tracking-widest uppercase">
            One last thing
          </span>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h2 className="font-heading max-w-4xl text-balance text-[clamp(2.5rem,9vw,7rem)] leading-[0.9] font-bold tracking-tighter">
            Stop integrating.
            <br />
            Start shipping.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="max-w-xl text-lg leading-relaxed">
            Nimbus replaces the entire AI plumbing layer with a single,
            well-typed surface. You have something better to do with the next
            six weeks. Probably.
          </p>
        </FadeIn>
        <FadeIn delay={0.15} className="flex flex-wrap items-center gap-3">
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "lg" }),
              "border-background bg-background text-foreground hover:bg-background/90"
            )}
          >
            Start free
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/customers"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "border-background/40 bg-transparent text-background hover:bg-background/10"
            )}
          >
            Read customer stories
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
