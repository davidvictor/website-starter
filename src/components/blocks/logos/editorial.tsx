import { FadeIn } from "@/components/motion/fade-in"
import { customerLogos } from "@/lib/brand"

export function LogosEditorial() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                In production at
              </p>
              <p className="mt-3 font-heading text-2xl tracking-tight">
                180+ teams have shipped on Nimbus.
              </p>
            </div>
            <div className="md:col-span-8">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                {customerLogos.map((logo) => (
                  <li
                    key={logo.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="grid size-7 place-items-center rounded border border-border bg-muted/40 font-mono text-[10px] text-foreground">
                      {logo.initials}
                    </span>
                    <span className="truncate font-medium tracking-tight">
                      {logo.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
