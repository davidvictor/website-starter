"use client"

import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/theme-provider"
import { auditTheme } from "@/themes/a11y"

export function A11yIndicator() {
  const { theme, resolvedMode } = useTheme()
  const [open, setOpen] = useState(false)

  const result = useMemo(
    () => auditTheme(theme, resolvedMode),
    [theme, resolvedMode]
  )

  const failing = result.failures.length > 0
  const anchor = `/accessibility#preset-${theme.id}-${resolvedMode}`

  return (
    <section className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px]",
          failing
            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            : "border-border bg-muted/40 text-muted-foreground"
        )}
      >
        {failing ? (
          <AlertTriangle className="size-3.5" aria-hidden />
        ) : (
          <CheckCircle2
            className="size-3.5 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
        )}
        <span className="flex-1 truncate">
          {failing
            ? `${result.failures.length} a11y issue${result.failures.length === 1 ? "" : "s"} · worst ${result.worstRatio.toFixed(2)}:1`
            : `A11y passes · worst ${result.worstRatio.toFixed(2)}:1`}
        </span>
        <a
          href={anchor}
          target="_blank"
          rel="noreferrer"
          aria-label="Open accessibility overview for this theme"
          className={cn(
            "inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono text-[10px] underline-offset-4 transition-colors cursor-pointer hover:bg-foreground/5",
            failing && "text-amber-800 dark:text-amber-200"
          )}
        >
          overview
          <ExternalLink className="size-3" />
        </a>
        {failing && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded px-1 py-0.5 font-mono text-[10px] transition-colors cursor-pointer hover:bg-foreground/5"
            aria-expanded={open}
            aria-controls="a11y-indicator-details"
          >
            {open ? "hide" : "details"}
          </button>
        )}
      </div>
      {failing && open && (
        <ul
          id="a11y-indicator-details"
          className="flex flex-col gap-1 rounded-md border border-border bg-muted/20 p-2 font-mono text-[10px] text-muted-foreground"
        >
          {result.pairs
            .filter((p) => p.fails)
            .map((p) => (
              <li key={p.pair.id} className="flex items-center justify-between">
                <span className="truncate">{p.pair.label}</span>
                <span className="tabular shrink-0 pl-2 text-amber-700 dark:text-amber-300">
                  {p.ratio.toFixed(2)}:1
                </span>
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}
