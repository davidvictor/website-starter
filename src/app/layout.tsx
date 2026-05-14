import type { Metadata } from "next"

import { DevPanel, DevPanelProvider } from "@/components/dev-panel"
import { ALL_FONT_VARS, geistSans } from "@/lib/fonts"
import { ThemeProvider } from "@/providers/theme-provider"
import { ThemeScript } from "@/providers/theme-script"
import { cn } from "@/lib/utils"

import "./globals.css"

export const metadata: Metadata = {
  title: "Lookbook",
  description:
    "A Next.js base for moving from design direction to clickable page in one sitting.",
}

const HTML_CLASSES = cn(
  "h-full antialiased",
  geistSans.className,
  ...ALL_FONT_VARS
)

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
      </body>
    </html>
  )
}
