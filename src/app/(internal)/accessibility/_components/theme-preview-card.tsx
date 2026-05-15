import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import type { AuditResult } from "@/themes/a11y"
import type { ControllerTheme } from "@/themes/controller-types"
import { deriveShadows } from "@/themes/derive"
import { resolveTokens, tokensToCssVars } from "@/themes/registry"
import type { Mode } from "@/themes/tokens"

export function ThemePreviewCard({
  theme,
  mode,
  result,
  anchorId,
  children,
}: {
  theme: ControllerTheme
  mode: Mode
  result: AuditResult
  anchorId: string
  children: React.ReactNode
}) {
  const tokens = resolveTokens(theme, mode)
  const shadows = deriveShadows(mode, theme)
  const varsRecord = tokensToCssVars(tokens, shadows, theme)
  const style = varsRecord as unknown as CSSProperties

  return (
    <article
      id={anchorId}
      style={style}
      className={cn(
        // The `.dark` class enables Tailwind's `dark:` variants
        // for descendants when needed.
        mode === "dark" && "dark",
        "scroll-mt-12 flex flex-col gap-3 rounded-lg border border-border bg-background p-4 text-foreground"
      )}
    >
      <header className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          {mode}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px]",
            result.failures.length === 0
              ? "bg-success/15 text-success"
              : "bg-destructive/15 text-destructive"
          )}
        >
          {result.failures.length === 0
            ? "pass"
            : `${result.failures.length} fail`}
        </span>
      </header>
      {children}
    </article>
  )
}
