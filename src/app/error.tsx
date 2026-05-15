"use client"

import { useEffect } from "react"

/**
 * Per-route error boundary. Renders when a Server Component or Client
 * Component throws below the root layout. The Reset button re-renders
 * the segment.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Vercel captures unhandled errors automatically; this log lands in
    // the runtime log stream for the deploy.
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-md space-y-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          We hit an unexpected error.
        </h1>
        <p className="text-sm text-muted-foreground">
          The page failed to render. Try again, or head back to the homepage.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  )
}
