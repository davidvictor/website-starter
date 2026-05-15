import { cn } from "@/lib/utils"
import type { AuditResult, PairResult } from "@/themes/a11y"

import { GradeBadge } from "./grade-badge"

export function AuditMatrix({ result }: { result: AuditResult }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-card/30 font-mono text-[11px]">
      {result.pairs.map((p) => (
        <PairRow key={p.pair.id} pr={p} />
      ))}
    </div>
  )
}

function PairRow({ pr }: { pr: PairResult }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-1.5",
        pr.fails && "bg-red-500/5"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm border border-foreground/10"
          style={{ background: pr.bgCss }}
        />
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm border border-foreground/10"
          style={{ background: pr.fgCss }}
        />
        <span className="truncate">{pr.pair.label}</span>
      </div>
      <span className="tabular text-foreground/80">
        {pr.ratio.toFixed(2)}:1
      </span>
      <GradeBadge grade={pr.grade} />
    </div>
  )
}
