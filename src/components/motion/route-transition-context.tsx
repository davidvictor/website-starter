"use client"

import { usePathname } from "next/navigation"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

/**
 * Route-transition state machine. See docs/adr/0018-route-transition-coordination.md.
 *
 *   idle      — no navigation in flight
 *   pending   — a Link click started a transition; React/Next is preparing
 *               the new route. Old UI is still mounted and visible.
 *   entering  — pathname has changed and the new content is mounted; the
 *               macro enter animation is running.
 *
 * `pending → entering` is gated by Next.js's transition (via React's
 * `useTransition` inside `<TransitionLink>`), so the new route is fully
 * resolved (including Suspense/streaming) before pathname flips. This is
 * the property that keeps the macro transition in sync with content.
 */
export type RouteTransitionPhase = "idle" | "pending" | "entering"

/**
 * Direction of the navigation. `back` covers the browser back/forward
 * stack (detected via `popstate`); everything else is `forward`.
 */
export type RouteTransitionDirection = "forward" | "back"

export type RouteTransitionScroll = "reset" | "preserve" | "smooth"

export type RouteTransitionConfig = {
  /** Whether to scroll-reset on a forward navigation. Default: "reset". */
  scroll: RouteTransitionScroll
  /**
   * Only trigger transitions when the pathname changes (default), or also
   * when search params change. Marketing routes usually want pathname-only
   * so filter/pagination links don't replay the macro animation.
   */
  triggerOn: "pathname" | "pathname+search"
}

const DEFAULT_CONFIG: RouteTransitionConfig = {
  scroll: "reset",
  triggerOn: "pathname",
}

type RouteTransitionContextValue = {
  phase: RouteTransitionPhase
  direction: RouteTransitionDirection
  config: RouteTransitionConfig
  /**
   * Called by `<TransitionLink>` when its underlying `useLinkStatus`
   * reports `pending=true`. The provider promotes phase to `pending`.
   */
  reportPending: () => void
  /**
   * Called by `<RouteTransition>` after the enter animation completes.
   * Resets phase to `idle`.
   */
  reportEnterComplete: () => void
}

const Ctx = createContext<RouteTransitionContextValue | null>(null)

type RouteTransitionProviderProps = {
  children: ReactNode
  config?: Partial<RouteTransitionConfig>
}

export function RouteTransitionProvider({
  children,
  config: configOverride,
}: RouteTransitionProviderProps) {
  const pathname = usePathname()
  const [phase, setPhase] = useState<RouteTransitionPhase>("idle")
  const [direction, setDirection] =
    useState<RouteTransitionDirection>("forward")
  const previousPathnameRef = useRef(pathname)
  const popstateRef = useRef(false)

  const config = useMemo<RouteTransitionConfig>(
    () => ({ ...DEFAULT_CONFIG, ...configOverride }),
    [configOverride]
  )

  // Detect browser back/forward — we want to flag direction before the
  // pathname change effect fires, so it lands on the same render.
  useEffect(() => {
    function onPopstate() {
      popstateRef.current = true
      setDirection("back")
    }
    window.addEventListener("popstate", onPopstate)
    return () => window.removeEventListener("popstate", onPopstate)
  }, [])

  // Advance the state machine when pathname changes.
  useEffect(() => {
    if (previousPathnameRef.current === pathname) return
    previousPathnameRef.current = pathname

    // Scroll choreography. Browser handles its own scroll restoration on
    // back/forward, so we never override that path.
    if (!popstateRef.current && config.scroll !== "preserve") {
      // Reset and smooth both go to top; the difference is animation.
      window.scrollTo({
        top: 0,
        behavior: config.scroll === "smooth" ? "smooth" : "instant",
      })
    }

    setPhase("entering")
    popstateRef.current = false
  }, [pathname, config.scroll])

  const reportPending = useCallback(() => {
    // Only promote from idle; if we're mid-enter, ignore.
    setPhase((current) => (current === "idle" ? "pending" : current))
    setDirection("forward")
  }, [])

  const reportEnterComplete = useCallback(() => {
    setPhase("idle")
  }, [])

  const value = useMemo<RouteTransitionContextValue>(
    () => ({
      phase,
      direction,
      config,
      reportPending,
      reportEnterComplete,
    }),
    [phase, direction, config, reportPending, reportEnterComplete]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/**
 * Read the current transition phase. Use this in entrance primitives
 * (`FadeIn`, `Stagger`) to defer their own animation while the macro
 * route transition is running — keeps the page from double-fading.
 */
export function useRouteTransitionPhase(): RouteTransitionPhase {
  const ctx = useContext(Ctx)
  // Outside the provider (e.g., admin/dashboard routes) we report idle so
  // primitives keep their default behavior.
  return ctx?.phase ?? "idle"
}

/**
 * Full context access — needed by `<RouteTransition>` and
 * `<TransitionLink>`. Components that only want the phase should prefer
 * `useRouteTransitionPhase()`.
 */
export function useRouteTransitionContext(): RouteTransitionContextValue {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error(
      "useRouteTransitionContext must be used inside <RouteTransitionProvider>"
    )
  }
  return ctx
}

export function useOptionalRouteTransitionContext(): RouteTransitionContextValue | null {
  return useContext(Ctx)
}
