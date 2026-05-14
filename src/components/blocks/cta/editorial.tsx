import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/motion/fade-in"
import { Press } from "@/components/motion/press"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CtaEditorial() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <FadeIn>
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Closing notes
              </span>
              <h2 className="font-heading mt-4 max-w-2xl text-4xl leading-tight font-medium tracking-tight md:text-5xl">
                Build cognitive infrastructure that ships{" "}
                <em className="font-heading italic text-brand-accent">
                  this quarter.
                </em>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-3 md:col-span-5 md:items-end">
              <Press
                render={
                  <Link
                    href="/pricing"
                    className={cn(buttonVariants({ size: "lg" }))}
                  >
                    Start free
                    <ArrowUpRight className="size-4" />
                  </Link>
                }
              />
              <Link
                href="/contact"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Or speak to a human →
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
