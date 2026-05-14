"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { devRoutes } from "@/lib/routes"
import { cn } from "@/lib/utils"

export function NavTab() {
  const pathname = usePathname()

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
      {Object.entries(grouped).map(([group, routes]) => (
        <section key={group} className="flex flex-col gap-1">
          <h3 className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            {group}
          </h3>
          <ul className="flex flex-col gap-px">
            {routes.map((route) => {
              const active = pathname === route.path
              return (
                <li key={route.path}>
                  <Link
                    href={route.path}
                    className={cn(
                      "flex items-center justify-between rounded px-2 py-1.5 text-xs transition-colors",
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
        </section>
      ))}
    </div>
  )
}
