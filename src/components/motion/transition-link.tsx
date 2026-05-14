"use client"

import Link, { type LinkProps, useLinkStatus } from "next/link"
import { type AnchorHTMLAttributes, type ReactNode, useEffect } from "react"

import { useOptionalRouteTransitionContext } from "./route-transition-context"

/**
 * Drop-in replacement for `next/link` that participates in the
 * `<RouteTransitionProvider>` state machine. While the underlying Link is
 * navigating, the provider's phase advances to `pending`, which lets the
 * macro route transition coordinate exit/enter timing with content
 * readiness.
 *
 * Outside the provider (e.g., on admin or dashboard routes), this falls
 * back to `next/link` behavior — safe to use anywhere.
 */
export type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode
  }

export function TransitionLink({
  children,
  ...linkProps
}: TransitionLinkProps) {
  return (
    <Link {...linkProps}>
      <LinkStatusBridge />
      {children}
    </Link>
  )
}

/**
 * Reads `useLinkStatus()` from inside the Link's context and forwards
 * pending state to the route-transition provider. Renders nothing.
 *
 * Must live inside `<Link>` because `useLinkStatus` is scoped to the
 * link's children — that's how Next.js disambiguates which link is
 * pending when multiple are on the page.
 */
function LinkStatusBridge() {
  const { pending } = useLinkStatus()
  const ctx = useOptionalRouteTransitionContext()
  const reportPending = ctx?.reportPending

  useEffect(() => {
    if (pending && reportPending) {
      reportPending()
    }
  }, [pending, reportPending])

  return null
}
