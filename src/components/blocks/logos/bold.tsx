import { customerLogos } from "@/lib/brand"

// Doubled for seamless marquee loop.
const LOOP = [...customerLogos, ...customerLogos]

export function LogosBold() {
  return (
    <section className="overflow-hidden border-y border-border bg-foreground py-6 text-background">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 will-change-transform">
        {LOOP.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex shrink-0 items-center gap-3 px-2"
          >
            <span className="grid size-8 place-items-center rounded-md border border-background/40 font-mono text-[10px]">
              {logo.initials}
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
