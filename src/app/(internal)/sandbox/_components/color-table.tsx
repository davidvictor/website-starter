"use client"

import { useTheme } from "@/providers/theme-provider"
import { resolveTokens } from "@/themes/registry"
import {
  COLOR_TOKEN_KEYS,
  COLOR_TOKEN_TO_CSS_VAR,
  type ColorTokens,
} from "@/themes/types"
import { CopyButton } from "./copy-button"

type ColorGroup = {
  label: string
  keys: (keyof ColorTokens)[]
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: "Surface",
    keys: [
      "background",
      "foreground",
      "card",
      "cardForeground",
      "popover",
      "popoverForeground",
      "muted",
      "mutedForeground",
      "secondary",
      "secondaryForeground",
    ],
  },
  {
    label: "Brand",
    keys: [
      "primary",
      "primaryForeground",
      "accent",
      "accentForeground",
      "brandAccent",
      "brandAccentForeground",
    ],
  },
  {
    label: "Borders & inputs",
    keys: ["border", "input", "ring"],
  },
  {
    label: "Semantic",
    keys: ["success", "warning", "info", "destructive"],
  },
  {
    label: "Chart",
    keys: ["chart1", "chart2", "chart3", "chart4", "chart5"],
  },
  {
    label: "Sidebar",
    keys: [
      "sidebar",
      "sidebarForeground",
      "sidebarPrimary",
      "sidebarPrimaryForeground",
      "sidebarAccent",
      "sidebarAccentForeground",
      "sidebarBorder",
      "sidebarRing",
    ],
  },
]

export function ColorTable() {
  const { theme, resolvedMode } = useTheme()
  const tokens = resolveTokens(theme, resolvedMode)

  const grouped = new Set(COLOR_GROUPS.flatMap((g) => g.keys as string[]))
  const otherKeys = (COLOR_TOKEN_KEYS as readonly (keyof ColorTokens)[]).filter(
    (k) => !grouped.has(k as string)
  )
  const groups: ColorGroup[] =
    otherKeys.length > 0
      ? [...COLOR_GROUPS, { label: "Other", keys: otherKeys }]
      : COLOR_GROUPS

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {groups.map((group, groupIdx) => (
        <div key={group.label}>
          <div
            className={
              groupIdx === 0
                ? "bg-muted/50 px-3 py-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
                : "border-t border-border bg-muted/50 px-3 py-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
            }
          >
            {group.label}
          </div>
          <div className="divide-y divide-border">
            {group.keys.map((key) => (
              <ColorRow
                key={key as string}
                cssVar={COLOR_TOKEN_TO_CSS_VAR[key]}
                value={tokens[key]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ColorRow({ cssVar, value }: { cssVar: string; value: string }) {
  return (
    <div className="group flex items-center gap-3 px-3 py-1.5 hover:bg-muted/40">
      <div
        aria-hidden
        className="size-5 shrink-0 rounded-sm border border-border"
        style={{ background: value }}
      />
      <span className="flex-1 truncate font-mono text-xs">{cssVar}</span>
      <span className="hidden truncate font-mono text-xs text-muted-foreground sm:inline">
        {value}
      </span>
      <CopyButton text={cssVar} label="Copy variable name" />
    </div>
  )
}
