import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { DevPanel, DevPanelProvider } from "@/components/dev-panel"
import { ALL_FONT_VARS } from "@/lib/fonts"
import { siteMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/providers/theme-provider"
import { ThemeScript } from "@/providers/theme-script"

import "./globals.css"

export const metadata = siteMetadata()

/**
 * Only the next/font *variable* classes go on <html> — they inject
 * `--font-geist-sans`, `--font-ibm-plex-sans`, etc. The active typeface
 * is decided by the theme system via `--font-sans` / `--font-mono` /
 * `--font-heading` on <html>, so we deliberately do NOT also stamp
 * `geistSans.className` here (that would lock html to Geist at class-level
 * specificity, beating `html { @apply font-sans; }` in globals.css).
 */
const HTML_CLASSES = cn("h-full antialiased", ...ALL_FONT_VARS)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={HTML_CLASSES}>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ThemeProvider>
          <DevPanelProvider>
            {children}
            <DevPanel />
          </DevPanelProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
