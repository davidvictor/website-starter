// src/app/examples/shaders/page.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

import { useDevPanel } from "@/components/dev-panel"
import { useTheme } from "@/providers/theme-provider"
import { ShaderTile } from "@/components/shaders/themed/showcase-tile"
import { SHADER_REGISTRY } from "@/components/shaders/themed/registry"
import type {
  ShaderId,
  ThemeId,
  Variant,
} from "@/components/shaders/themed/types"
import { cn } from "@/lib/utils"

const THEMES: readonly ThemeId[] = ["editorial", "saas", "bold", "cyber"]

function useBandVariants(): [
  Record<ThemeId, Variant>,
  (next: Record<ThemeId, Variant>) => void,
] {
  const router = useRouter()
  const params = useSearchParams()
  const state = useMemo<Record<ThemeId, Variant>>(
    () => ({
      editorial: (params.get("editorial") as Variant) ?? "idle",
      saas: (params.get("saas") as Variant) ?? "idle",
      bold: (params.get("bold") as Variant) ?? "idle",
      cyber: (params.get("cyber") as Variant) ?? "idle",
    }),
    [params]
  )
  const set = useCallback(
    (next: Record<ThemeId, Variant>) => {
      const sp = new URLSearchParams()
      for (const t of THEMES) {
        if (next[t] !== "idle") sp.set(t, next[t])
      }
      const qs = sp.toString()
      router.replace(qs ? `/examples/shaders?${qs}` : "/examples/shaders")
    },
    [router]
  )
  return [state, set]
}

export default function ShadersExamplePage() {
  const [variants, setVariants] = useBandVariants()
  const { themeId, setThemeId, themes } = useTheme()
  const { forceReducedMotion, setForceReducedMotion } = useDevPanel()

  const totalShaders = Object.keys(SHADER_REGISTRY).length

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="sticky top-0 z-10 -mx-6 mb-6 border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              /examples/shaders
            </h1>
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {totalShaders} shader{totalShaders === 1 ? "" : "s"} · theme:{" "}
              <span className="text-foreground">{themeId}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeChips
              themes={themes.map((t) => t.id as ThemeId)}
              active={themeId as ThemeId}
              onPick={setThemeId}
            />
            <button
              type="button"
              data-active={forceReducedMotion}
              onClick={() => setForceReducedMotion(!forceReducedMotion)}
              className={cn(
                "rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-muted cursor-pointer",
                "data-[active=true]:border-foreground/30 data-[active=true]:bg-muted data-[active=true]:text-foreground"
              )}
            >
              reduced motion {forceReducedMotion ? "●" : "○"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10">
        {THEMES.map((theme) => (
          <ThemeBand
            key={theme}
            theme={theme}
            variant={variants[theme]}
            onVariantChange={(v) =>
              setVariants({ ...variants, [theme]: v })
            }
          />
        ))}
      </div>
    </main>
  )
}

function ThemeChips({
  themes,
  active,
  onPick,
}: {
  themes: readonly ThemeId[]
  active: ThemeId
  onPick: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {themes.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onPick(id)}
          data-active={id === active}
          className={cn(
            "rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium capitalize transition-colors hover:bg-muted cursor-pointer",
            "data-[active=true]:border-foreground/30 data-[active=true]:bg-muted"
          )}
        >
          {id}
        </button>
      ))}
    </div>
  )
}

function ThemeBand({
  theme,
  variant,
  onVariantChange,
}: {
  theme: ThemeId
  variant: Variant
  onVariantChange: (v: Variant) => void
}) {
  const ids: ShaderId[] = (["1", "2", "3"] as const).map(
    (n) => `${theme}.${n}.${variant}` as ShaderId
  )
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-medium capitalize tracking-tight">
          {theme}
        </h2>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
          {(["idle", "interactive"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onVariantChange(v)}
              data-active={v === variant}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[10px] capitalize transition-colors cursor-pointer hover:bg-muted",
                "data-[active=true]:bg-foreground data-[active=true]:text-background"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) =>
          SHADER_REGISTRY[id] ? (
            <ShaderTile key={id} id={id} />
          ) : (
            <div
              key={id}
              className="grid aspect-[16/10] place-items-center rounded-lg border border-dashed border-border text-center font-mono text-[10px] text-muted-foreground/60"
            >
              {id}
              <br />
              (not yet implemented)
            </div>
          )
        )}
      </div>
    </section>
  )
}
