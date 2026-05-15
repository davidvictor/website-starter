import Link from "next/link"

import { siteMetadata } from "@/lib/metadata"
import { auditAllPresets } from "@/themes/a11y"
import { baseThemes } from "@/themes/registry"

import { AuditMatrix } from "./_components/audit-matrix"
import { GradeBadge } from "./_components/grade-badge"
import { SampleStrip } from "./_components/sample-strip"
import { ThemePreviewCard } from "./_components/theme-preview-card"

export const metadata = siteMetadata({
  title: "Accessibility",
  description:
    "WCAG 2.2 contrast audit for every built-in theme, in both light and dark modes.",
  path: "/accessibility",
})

export default function AccessibilityPage() {
  const results = auditAllPresets(baseThemes)
  const totalFailures = results.reduce((n, r) => n + r.failures.length, 0)

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          /accessibility
        </p>
        <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Contrast audit
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground">
          WCAG 2.2 contrast ratios for every built-in theme, both light and
          dark. Pairs are categorized as body text (≥ 4.5 to pass AA), UI
          affordances (≥ 3.0 per 1.4.11), or decorative (exempt). Anything below
          the moderate baseline shows up in red.
        </p>
        <div className="flex flex-wrap items-baseline gap-3 pt-2 text-sm">
          <span className="font-mono text-muted-foreground">
            {results.length} cards · {totalFailures} failure
            {totalFailures === 1 ? "" : "s"}
          </span>
          {totalFailures === 0 && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 font-mono text-xs text-success">
              all defaults pass
            </span>
          )}
        </div>
      </header>

      {/* Threshold legend */}
      <section className="flex flex-wrap gap-3">
        <GradeBadge grade="AAA" />
        <GradeBadge grade="AA" />
        <GradeBadge grade="AA-Large" />
        <GradeBadge grade="Fail" />
        <GradeBadge grade="Exempt" />
      </section>

      {/* Per-preset matrix: light card next to dark card */}
      <div className="flex flex-col gap-12">
        {baseThemes.map((theme) => {
          const light = results.find(
            (r) => r.themeId === theme.id && r.mode === "light"
          )
          const dark = results.find(
            (r) => r.themeId === theme.id && r.mode === "dark"
          )
          if (!light || !dark) return null
          return (
            <section
              key={theme.id}
              id={`preset-${theme.id}`}
              className="scroll-mt-12 flex flex-col gap-4"
            >
              <header className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    {theme.name}
                  </h2>
                  <span className="font-mono text-xs text-muted-foreground">
                    {theme.id}
                  </span>
                </div>
                {(light.failures.length > 0 || dark.failures.length > 0) && (
                  <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-xs text-destructive">
                    {light.failures.length + dark.failures.length} failing
                  </span>
                )}
              </header>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ThemePreviewCard
                  theme={theme}
                  mode="light"
                  result={light}
                  anchorId={`preset-${theme.id}-light`}
                >
                  <SampleStrip />
                  <AuditMatrix result={light} />
                </ThemePreviewCard>
                <ThemePreviewCard
                  theme={theme}
                  mode="dark"
                  result={dark}
                  anchorId={`preset-${theme.id}-dark`}
                >
                  <SampleStrip />
                  <AuditMatrix result={dark} />
                </ThemePreviewCard>
              </div>
            </section>
          )
        })}
      </div>

      <footer className="flex flex-col gap-2 pt-8 text-sm text-muted-foreground">
        <p>
          Methodology: WCAG 2.x relative-luminance contrast computed against
          OKLCH values produced by the runtime derivation pipeline. See{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">
            src/themes/a11y.ts
          </code>{" "}
          for the pair catalog.
        </p>
        <p>
          Open the dev panel (
          <kbd className="rounded border border-border bg-muted px-1 font-mono">
            ~
          </kbd>
          ) to live-edit a theme; the indicator at the top of the Themes tab
          mirrors this page for the current selection.
        </p>
        <Link
          className="text-foreground underline-offset-4 hover:underline"
          href="/sandbox"
        >
          See the active theme on real components →
        </Link>
      </footer>
    </main>
  )
}
