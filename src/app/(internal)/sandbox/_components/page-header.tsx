"use client"

import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/providers/theme-provider"

export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  const { theme, resolvedMode } = useTheme()

  return (
    <header className="flex flex-col gap-2">
      <p className="text-xs tracking-wider text-muted-foreground uppercase">
        /sandbox
      </p>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-balance text-muted-foreground">{description}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">theme · {theme.id}</Badge>
        <Badge variant="secondary">mode · {resolvedMode}</Badge>
        <Badge variant="secondary">
          radius · <span className="font-mono">{theme.derivation.radius}</span>
        </Badge>
      </div>
    </header>
  )
}
