"use client"

import { motion } from "motion/react"
import { useDevControls } from "@/components/dev-panel"
import { useDevData } from "@/components/dev-panel/hooks/use-dev-data"
import { FadeIn } from "@/components/motion/fade-in"
import { Stagger } from "@/components/motion/stagger"

export default function MotionExamplePage() {
  const { distance, duration, scale } = useDevControls("motion playground", {
    distance: {
      type: "number",
      default: 24,
      min: 0,
      max: 200,
      step: 1,
      label: "y distance",
    },
    duration: {
      type: "number",
      default: 0.55,
      min: 0.1,
      max: 3,
      step: 0.05,
    },
    scale: {
      type: "number",
      default: 1,
      min: 0.5,
      max: 2,
      step: 0.05,
    },
  })

  useDevData("scale", "current scale", scale, "motion")

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-24">
      <header className="flex flex-col gap-2">
        <p className="text-xs tracking-wider text-muted-foreground uppercase">
          example · motion
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Motion primitives
        </h1>
        <p className="text-muted-foreground">
          Open the dev panel (⌘.) and tweak knobs. Everything below reflects
          live state from the Controls tab.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium tracking-tight">
          FadeIn (live duration & distance)
        </h2>
        <FadeIn
          key={`${distance}-${duration}`}
          y={distance}
          duration={duration}
        >
          <div className="rounded-lg border border-border bg-card p-6">
            <p>Re-mounts when you change the dev controls.</p>
          </div>
        </FadeIn>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium tracking-tight">Stagger grid</h2>
        <Stagger className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-border bg-muted/40"
            />
          ))}
        </Stagger>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium tracking-tight">
          Scale spring (live)
        </h2>
        <motion.div
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="grid size-32 place-items-center rounded-xl border border-border bg-gradient-to-br from-foreground/5 to-foreground/15 font-mono text-sm"
        >
          {scale.toFixed(2)}
        </motion.div>
      </section>
    </main>
  )
}
