"use client"

import { Layers, type LucideIcon, Palette, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ACCENT_ANCHORS, oklchToHex, vibrancyToLC } from "@/lib/color"
import {
  COMPOSITIONS,
  findCompositionByPath,
  QUICK_COMBOS,
} from "@/lib/compositions"
import { devRoutes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/theme-provider"

const GROUP_ICONS: Record<string, LucideIcon> = {
  reference: Sparkles,
  playground: Sparkles,
  auth: Sparkles,
  app: Sparkles,
  other: Sparkles,
}

export function NavTab() {
  const pathname = usePathname()
  const { themes, theme, themeId, setThemeId } = useTheme()

  const activeComposition = findCompositionByPath(pathname)?.id ?? null

  const grouped = devRoutes.reduce<Record<string, typeof devRoutes>>(
    (acc, route) => {
      const group = route.group ?? "other"
      if (!acc[group]) acc[group] = [] as unknown as typeof devRoutes
      ;(acc[group] as unknown as Array<(typeof devRoutes)[number]>).push(route)
      return acc
    },
    {}
  )

  return (
    <div className="flex flex-col gap-4">
      {/* CURRENT COMBINATION — keeps the user oriented when both axes move */}
      <CombinationHeader
        themeLabel={theme.name}
        compositionLabel={
          activeComposition
            ? (COMPOSITIONS.find((c) => c.id === activeComposition)?.label ??
              null)
            : null
        }
      />

      {/* THEME — palette + typography. Doesn't navigate. */}
      <NavSection label="theme" sublabel="palette + typography" icon={Palette}>
        <div className="grid grid-cols-2 gap-1">
          {themes.map((t) => {
            const active = t.id === themeId
            const accentHex = oklchToHex({
              ...vibrancyToLC(t.inputs.accent.vibrancy),
              h:
                t.inputs.accent.anchor === "free"
                  ? t.inputs.accent.hue
                  : (((t.inputs.primary.hue +
                      (ACCENT_ANCHORS[t.inputs.accent.anchor] ?? 0)) %
                      360) +
                      360) %
                    360,
            })
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left transition-colors cursor-pointer",
                  active
                    ? "border-foreground/30 bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <span className="text-xs font-medium">{t.name}</span>
                <span
                  aria-hidden
                  className="size-2.5 rounded-full ring-1 ring-foreground/15"
                  style={{ background: accentHex }}
                />
              </button>
            )
          })}
        </div>
      </NavSection>

      {/* COMPOSITION — block layout. Navigates. */}
      <NavSection label="composition" sublabel="block layout" icon={Layers}>
        <div className="flex flex-col gap-1">
          {COMPOSITIONS.map((c) => {
            const active = activeComposition === c.id
            return (
              <Link
                key={c.id}
                href={c.path}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left transition-colors cursor-pointer",
                  active
                    ? "border-foreground/30 bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs font-medium leading-none">
                    {c.label}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {c.description}
                  </span>
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {c.path}
                </span>
              </Link>
            )
          })}
        </div>
      </NavSection>

      {/* QUICK COMBOS — opinionated theme × composition pairings */}
      <NavSection label="quick combos" sublabel="theme × composition">
        <div className="grid grid-cols-2 gap-1">
          {QUICK_COMBOS.map((combo) => {
            const comp = COMPOSITIONS.find((c) => c.id === combo.compositionId)
            if (!comp) return null
            const active =
              themeId === combo.themeId &&
              activeComposition === combo.compositionId
            return (
              <Link
                key={`${combo.themeId}-${combo.compositionId}`}
                href={comp.path}
                onClick={() => setThemeId(combo.themeId)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-md border px-2 py-1.5 transition-colors cursor-pointer",
                  active
                    ? "border-foreground/30 bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <span className="text-xs font-medium capitalize leading-none">
                  {combo.label ?? combo.themeId}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {combo.themeId} · {combo.compositionId}
                </span>
              </Link>
            )
          })}
        </div>
      </NavSection>

      {/* OTHER ROUTES */}
      {Object.entries(grouped).map(([group, routes]) => {
        const Icon = GROUP_ICONS[group] ?? Sparkles
        return (
          <NavSection key={group} label={group} icon={Icon}>
            <ul className="flex flex-col gap-px">
              {routes.map((route) => {
                const active = pathname === route.path
                return (
                  <li key={route.path}>
                    <Link
                      href={route.path}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            active ? "bg-foreground" : "bg-muted-foreground/40"
                          )}
                        />
                        {route.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {route.path}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </NavSection>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function CombinationHeader({
  themeLabel,
  compositionLabel,
}: {
  themeLabel: string
  compositionLabel: string | null
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-2">
      <span className="text-[9px] font-medium tracking-wider text-muted-foreground uppercase">
        current view
      </span>
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium">{themeLabel}</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            theme
          </span>
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">×</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium">{compositionLabel ?? "—"}</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            composition
          </span>
        </span>
      </div>
    </div>
  )
}

function NavSection({
  label,
  sublabel,
  icon: Icon,
  children,
}: {
  label: string
  sublabel?: string
  icon?: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="flex items-baseline gap-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {Icon && <Icon className="size-3" />}
        <span>{label}</span>
        {sublabel && (
          <span className="font-mono text-[9px] normal-case tracking-normal text-muted-foreground/60">
            {sublabel}
          </span>
        )}
      </h3>
      {children}
    </section>
  )
}
