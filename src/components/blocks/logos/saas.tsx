import { FadeIn } from "@/components/motion/fade-in"
import { customerLogos } from "@/lib/brand"

export function LogosSaas() {
  return (
    <section className="border-b border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="mb-8 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Trusted by teams shipping reasoning to production
          </p>
        </FadeIn>
        <FadeIn delay={0.05}>
          <ul className="grid grid-cols-2 items-center justify-items-center gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
            {customerLogos.map((logo) => (
              <li
                key={logo.name}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="grid size-7 place-items-center rounded-md border border-border bg-background font-mono text-[10px]">
                  {logo.initials}
                </span>
                <span className="truncate text-sm font-medium tracking-tight">
                  {logo.name}
                </span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  )
}
