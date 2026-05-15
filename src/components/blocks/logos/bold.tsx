import type { LogosProps } from "../props"

function logoInitials(logo: LogosProps["logos"][number]) {
  return logo.initials ?? logo.name.slice(0, 2).toUpperCase()
}

export function LogosBold({ logos }: LogosProps) {
  const loop = [...logos, ...logos]
  return (
    <section className="overflow-hidden border-y border-border bg-foreground py-6 text-background">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 will-change-transform motion-reduce:animate-none">
        {loop.map((logo, i) => (
          <div
            key={`${logo.name}-${i < logos.length ? "primary" : "duplicate"}`}
            aria-hidden={i >= logos.length}
            className="flex shrink-0 items-center gap-3 px-2"
          >
            <span className="grid size-8 place-items-center rounded-md border border-background/40 font-mono text-[10px]">
              {logoInitials(logo)}
            </span>
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              {logo.name}
            </span>
            <span className="ml-12 size-1 rounded-full bg-background/30" />
          </div>
        ))}
      </div>

      <style>
        {`@keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }`}
      </style>
    </section>
  )
}
