"use client"

import { useEffect } from "react"
import { GLOBAL_ERROR_COLORS } from "@/themes/fallback-colors"

/**
 * Root-level error boundary. Renders when the root layout itself
 * throws — at which point neither the layout's <html>/<body> nor any
 * provider has mounted. We provide the html shell here, per Next.js
 * convention, and keep the markup minimal (no theme tokens — they
 * may be the thing that failed to load).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: GLOBAL_ERROR_COLORS.background,
          color: GLOBAL_ERROR_COLORS.foreground,
        }}
      >
        <main style={{ maxWidth: 480, padding: 32, textAlign: "center" }}>
          <p
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.55,
              margin: 0,
            }}
          >
            Critical error
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              margin: "16px 0 12px",
            }}
          >
            The page failed to load.
          </h1>
          <p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 24px" }}>
            Reload to try again, or try a different route.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
                opacity: 0.45,
                margin: "0 0 24px",
              }}
            >
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: GLOBAL_ERROR_COLORS.actionBackground,
              color: GLOBAL_ERROR_COLORS.actionForeground,
              border: "none",
              padding: "10px 20px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
