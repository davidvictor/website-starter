import { Card, CardContent } from "@/components/ui/card"
import { Stagger } from "@/components/motion/stagger"
import { stats } from "@/lib/brand"

export function StatsSaas() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="flex flex-col gap-1 px-5 py-5">
                <span className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
