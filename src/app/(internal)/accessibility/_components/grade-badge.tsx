import type { Grade } from "@/lib/contrast"
import { cn } from "@/lib/utils"

const STYLES: Record<Grade, string> = {
  AAA: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  AA: "bg-foreground/10 text-foreground/80",
  "AA-Large": "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  Fail: "bg-red-500/15 text-red-700 dark:text-red-300",
  Exempt: "bg-muted text-muted-foreground",
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[10px]",
        STYLES[grade]
      )}
    >
      {grade}
    </span>
  )
}
