"use client"

import { FadeIn } from "@/components/motion/fade-in"
import type { StatsProps } from "../props"
import { StatValue } from "./stat-value"

export function StatsEditorial({ stats }: StatsProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <div className="mb-12 flex items-center gap-4">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              03 — Receipts
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="font-heading mb-12 max-w-3xl text-3xl leading-tight font-medium tracking-tight md:text-4xl">
            We measure what we ship.{" "}
            <span className="text-muted-foreground">
              And we ship what we measure.
            </span>
          </h2>
        </FadeIn>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-12 border-t border-border pt-12 md:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={0.05 + i * 0.04}>
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="font-heading mt-2 text-5xl leading-none font-medium tracking-tight">
                <StatValue stat={stat} />
              </dd>
            </FadeIn>
          ))}
        </dl>
      </div>
    </section>
  )
}
