import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"
import { GrainGradient } from "@/components/shaders/grain-gradient"
import { cn } from "@/lib/utils"

export function CtaSaas() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <GrainGradient
              colors={[
                "hsl(220 90% 56%)",
                "hsl(290 80% 60%)",
                "hsl(20 90% 60%)",
              ]}
              speed={0.3}
              intensity={0.5}
              noise={0.3}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
          </div>

          <div className="relative flex flex-col items-center gap-5 px-6 py-16 text-center sm:px-12 sm:py-20">
            <FadeIn>
              <h2 className="font-heading max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to ship reasoning to production?
              </h2>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="max-w-xl text-balance text-muted-foreground">
                Start free, scale with usage. Or talk to us about volume and
                custom deployments.
              </p>
            </FadeIn>
            <FadeIn
              delay={0.1}
              className="flex flex-wrap items-center justify-center gap-3"
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
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" })
                )}
              >
                Talk to sales
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
