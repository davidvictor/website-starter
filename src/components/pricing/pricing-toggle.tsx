"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState, useTransition } from "react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/**
 * Pricing toggle: monthly ↔ annual. Syncs to `?period=annual` URL param so
 * the choice is shareable.
 *
 * Reads the search param after mount (not during render) to avoid forcing
 * the page out of cache under Next.js Cache Components.
 */
export type PricingPeriod = "month" | "year"

const PRICING_PERIOD_EVENT = "website-starter:pricing-period-change"

function readPeriodFromLocation(): PricingPeriod {
  const url = new URL(window.location.href)
  return url.searchParams.get("period") === "annual" ? "year" : "month"
}

/**
 * Subscribe to the pricing period. Returns "month" during SSR / first render
 * and updates after hydration when the search param is read. Pricing blocks
 * then re-render with the actual period. The toggle emits a custom event
 * because `router.replace()` does not fire `popstate`.
 */
export function usePricingPeriod(): PricingPeriod {
  const [period, setPeriod] = useState<PricingPeriod>("month")

  useEffect(() => {
    const sync = () => setPeriod(readPeriodFromLocation())
    const syncFromToggle = (event: Event) => {
      const next = (event as CustomEvent<PricingPeriod>).detail
      if (next === "month" || next === "year") setPeriod(next)
    }
    sync()
    window.addEventListener("popstate", sync)
    window.addEventListener(PRICING_PERIOD_EVENT, syncFromToggle)
    return () => {
      window.removeEventListener("popstate", sync)
      window.removeEventListener(PRICING_PERIOD_EVENT, syncFromToggle)
    }
  }, [])

  return period
}

function PricingToggleInner({ className }: { className?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const isAnnual = params.get("period") === "annual"
  const [, startTransition] = useTransition()

  const onChange = (next: boolean) => {
    const nextPeriod: PricingPeriod = next ? "year" : "month"
    const url = new URL(window.location.href)
    if (next) {
      url.searchParams.set("period", "annual")
    } else {
      url.searchParams.delete("period")
    }
    window.dispatchEvent(
      new CustomEvent<PricingPeriod>(PRICING_PERIOD_EVENT, {
        detail: nextPeriod,
      })
    )
    startTransition(() => {
      router.replace(`${url.pathname}${url.search}`, { scroll: false })
    })
  }

  return (
    <div className={cn("inline-flex items-center gap-3 text-sm", className)}>
      <span className={cn(!isAnnual && "font-medium")}>Monthly</span>
      <Switch
        checked={isAnnual}
        onCheckedChange={onChange}
        aria-label="Toggle annual pricing"
      />
      <span
        className={cn(
          "inline-flex items-center gap-2",
          isAnnual && "font-medium"
        )}
      >
        Annual
        <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-[10px] font-medium text-brand-accent tabular">
          −20%
        </span>
      </span>
    </div>
  )
}

export function PricingToggle({ className }: { className?: string }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "inline-flex h-6 w-48 animate-pulse rounded-md bg-muted/40",
            "motion-reduce:animate-none",
            className
          )}
        />
      }
    >
      <PricingToggleInner className={className} />
    </Suspense>
  )
}
