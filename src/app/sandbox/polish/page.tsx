"use client"

import { Bell, Moon, Sun } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

import { AnimatedNumber } from "@/components/motion/animated-number"
import { IconMorph } from "@/components/motion/icon-morph"
import { Press } from "@/components/motion/press"
import {
  SPRING_MACRO,
  SPRING_MICRO,
  SPRING_STANDARD,
} from "@/components/motion/springs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCompact, formatPercent } from "@/lib/format"

/**
 * Live reference for the polish system. Renders every motion primitive,
 * each surface treatment, the radius scale, tabular vs proportional nums,
 * the three spring tiers, and a reduced-motion preview toggle.
 * See docs/UI_POLISH.md.
 */
export default function PolishSandboxPage() {
  const [iconActive, setIconActive] = useState(false)
  const [springPlay, setSpringPlay] = useState(0)
  const [reducedPreview, setReducedPreview] = useState(false)

  return (
    <div
      // Preview reduced-motion locally by adding the `prefers-reduced-motion`
      // media via data-motion overrides on the inspected subtree.
      data-reduced-preview={reducedPreview || undefined}
      className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8"
    >
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Sandbox
        </p>
        <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Polish reference
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground">
          Every motion primitive, surface treatment, and typography rule that
          the polish system ships with. Use this page as the regression
          reference when sweeping the codebase.
        </p>
        <div className="mt-2 inline-flex items-center gap-2 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={reducedPreview}
              onChange={(e) => setReducedPreview(e.target.checked)}
              data-touch
              className="size-4 cursor-pointer accent-foreground"
            />
            <span className="text-muted-foreground">
              Preview reduced-motion (skips macro tier on this page)
            </span>
          </label>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Motion primitives
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Press</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Press render={<Button>Press me</Button>} />
              <Press
                render={
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm"
                  >
                    Press a custom element
                  </button>
                }
              />
              <p className="text-xs text-muted-foreground">
                Stacks translate-y-px + scale(0.98) on active. See ADR 0001.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IconMorph</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => setIconActive((v) => !v)}
              >
                <IconMorph from={Sun} to={Moon} active={iconActive} size={16} />
                {iconActive ? "Dark" : "Light"}
              </Button>
              <p className="text-xs text-muted-foreground">
                opacity + scale + blur, micro spring. See ADR 0007.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AnimatedNumber</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <span className="font-heading text-3xl font-semibold tracking-tight">
                <AnimatedNumber
                  value={9.2e12}
                  format={(v) => formatCompact(v, 1)}
                />
              </span>
              <span className="font-heading text-3xl font-semibold tracking-tight">
                <AnimatedNumber
                  value={0.99997}
                  format={(v) => formatPercent(v, 3)}
                />
              </span>
              <p className="text-xs text-muted-foreground">
                Count-up with .tabular baked in. Respects reduced motion.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Spring tiers (ADR 0007)
        </h2>
        <p className="text-sm text-muted-foreground">
          Press the play button to compare durations side-by-side. Each block
          slides 80px on the same trigger.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSpringPlay((n) => n + 1)}>
            Play
          </Button>
          <span className="text-xs text-muted-foreground">
            Replays whenever you press the button
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Micro · 0.2s</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                key={`micro-${springPlay}`}
                data-motion="macro"
                initial={{ x: 0 }}
                animate={{ x: 80 }}
                transition={SPRING_MICRO}
                className="h-8 w-8 rounded-md bg-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Press, hover-card, tooltip, icon morph.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Standard · 0.3s</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                key={`standard-${springPlay}`}
                data-motion="macro"
                initial={{ x: 0 }}
                animate={{ x: 80 }}
                transition={SPRING_STANDARD}
                className="h-8 w-8 rounded-md bg-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Popover, dropdown, select, menu, combobox.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Macro · 0.4s</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                key={`macro-${springPlay}`}
                data-motion="macro"
                initial={{ x: 0 }}
                animate={{ x: 80 }}
                transition={SPRING_MACRO}
                className="h-8 w-8 rounded-md bg-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Dialog, alert dialog, sheet, drawer, dev panel.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          Macro motion respects `prefers-reduced-motion`. Toggle the preview
          above (or your OS setting) to see motion collapse to instant.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Surface treatments (per ADR 0003)
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-5">
            <span className="text-xs font-medium">Editorial</span>
            <span className="text-xs text-muted-foreground">
              Minimal — no border, optional border-b divider.
            </span>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-card px-5 py-5 ring-1 ring-foreground/10 shadow-[var(--shadow-subtle)]">
            <span className="text-xs font-medium">SaaS</span>
            <span className="text-xs text-muted-foreground">
              ring-1 ring-foreground/10 + shadow-subtle.
            </span>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-5 py-5">
            <span className="text-xs font-medium">Bold</span>
            <span className="text-xs text-muted-foreground">
              border border-border, 1px hard edge.
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Shadow tokens
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl bg-background px-5 py-8 shadow-[var(--shadow-subtle)]">
            <span className="text-xs font-medium">subtle</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              shadow-[var(--shadow-subtle)]
            </span>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-background px-5 py-8 shadow-[var(--shadow-raised)]">
            <span className="text-xs font-medium">raised</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              shadow-[var(--shadow-raised)]
            </span>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-background px-5 py-8 shadow-[var(--shadow-overlay)]">
            <span className="text-xs font-medium">overlay</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              shadow-[var(--shadow-overlay)]
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Tabular vs proportional
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Proportional (default)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 font-mono text-sm">
                <span>$1,001</span>
                <span>$11,234</span>
                <span>$99,999</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tabular (.tabular)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 font-mono text-sm tabular">
                <span>$1,001</span>
                <span>$11,234</span>
                <span>$99,999</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Concentric radius
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-muted/30 p-4">
            <span className="mb-3 block text-xs font-medium">
              Correct — outer rounded-2xl + p-4 → inner rounded-md
            </span>
            <div className="rounded-md bg-background px-4 py-4 text-sm">
              Inner radius matches outer minus padding.
            </div>
          </div>
          <div className="rounded-2xl bg-muted/30 p-4">
            <span className="mb-3 block text-xs font-medium text-destructive">
              Wrong — outer rounded-2xl + inner rounded-2xl
            </span>
            <div className="rounded-2xl bg-background px-4 py-4 text-sm">
              The inner corner doesn&apos;t match the outer.
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Hit area opt-in
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Compact (no data-touch)</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Notifications"
              >
                <Bell />
              </Button>
              <span className="text-xs text-muted-foreground">
                28px visible · 28px hit area
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Compact + data-touch</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Notifications"
                data-touch
              >
                <Bell />
              </Button>
              <span className="text-xs text-muted-foreground">
                28px visible · 40×40 hit area
              </span>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
