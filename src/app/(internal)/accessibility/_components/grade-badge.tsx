import type { Grade } from "@/lib/contrast"
import { cn } from "@/lib/utils"

const STYLES: Record<Grade, string> = {
  AAA: "bg-success/15 text-success",
  AA: "bg-foreground/10 text-foreground/80",
  "AA-Large": "bg-warning/15 text-warning",
  Fail: "bg-destructive/15 text-destructive",
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
