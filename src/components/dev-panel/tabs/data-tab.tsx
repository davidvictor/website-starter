"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { useTheme } from "@/providers/theme-provider"

import { useDevPanel } from "../dev-panel-provider"
import type { DevDataValue } from "../types"

function formatValue(value: DevDataValue): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">—</span>
  }
  if (typeof value === "boolean") {
    return <span className="font-mono">{value ? "true" : "false"}</span>
  }
  if (typeof value === "number" || typeof value === "string") {
    return <span className="font-mono">{String(value)}</span>
  }
  return <>{value}</>
}

export function DataTab() {
  const { dataProbes } = useDevPanel()
  const pathname = usePathname()
  const { theme, resolvedMode } = useTheme()
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(
    null
  )
  const [now, setNow] = useState<string>("")
  const [, setTick] = useState(0)

  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date().toLocaleTimeString())
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const userProbes = Array.from(dataProbes.values())
  const userGroups = userProbes.reduce<Record<string, typeof userProbes>>(
    (acc, probe) => {
      const group = probe.group ?? "misc"
      if (!acc[group]) acc[group] = []
      acc[group].push(probe)
      return acc
    },
    {}
  )

  return (
    <div className="flex flex-col gap-4">
      <DataGroup label="environment">
        <DataRow label="env" value={process.env.NODE_ENV} />
        <DataRow label="route" value={pathname} />
        <DataRow label="theme" value={theme.name} />
        <DataRow label="mode" value={resolvedMode} />
        <DataRow
          label="viewport"
          value={viewport ? `${viewport.w}×${viewport.h}` : "—"}
        />
        <DataRow label="time" value={now || "—"} />
      </DataGroup>

      {Object.entries(userGroups).map(([group, probes]) => (
        <DataGroup key={group} label={group}>
          {probes.map((probe) => (
            <DataRow
              key={`${probe.group ?? "misc"}:${probe.key}`}
              label={probe.label}
              value={formatValue(probe.read())}
            />
          ))}
        </DataGroup>
      ))}
    </div>
  )
}

function DataGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </h3>
      <dl className="flex flex-col gap-px rounded border bg-muted/40 px-2 py-1.5">
        {children}
      </dl>
    </section>
  )
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5 text-xs">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="truncate text-right text-foreground">{value}</dd>
    </div>
  )
}
