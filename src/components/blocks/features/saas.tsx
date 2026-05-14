import { Beaker, Brain, Receipt, ShieldCheck, Wrench, Zap } from "lucide-react"
import { Stagger } from "@/components/motion/stagger"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { features } from "@/lib/brand"

const ICONS = {
  Brain,
  Zap,
  Wrench,
  Beaker,
  ShieldCheck,
  Receipt,
} as const

export function FeaturesSaas() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Capabilities
          </p>
          <h2 className="font-heading max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to ship reasoning to production.
          </h2>
          <p className="max-w-xl text-balance text-muted-foreground">
            Built by a team that&apos;s been on-call for AI in production. Yes,
            during the bad weeks. Especially during the bad weeks.
          </p>
        </div>

        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = ICONS[feature.icon as keyof typeof ICONS] ?? Brain
            return (
              <Card key={feature.title}>
                <CardHeader className="gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/60">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.body}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
