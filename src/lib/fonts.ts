import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google"

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
})

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

/** All font CSS variable classes — apply to <html>. */
export const ALL_FONT_VARS = [
  geistSans.variable,
  geistMono.variable,
  ibmPlexSans.variable,
  ibmPlexMono.variable,
  instrumentSerif.variable,
  jetbrainsMono.variable,
] as const

/** Font registry: name → CSS variable. */
export const FONTS = {
  "geist-sans": "var(--font-geist-sans)",
  "geist-mono": "var(--font-geist-mono)",
  "ibm-plex-sans": "var(--font-ibm-plex-sans)",
  "ibm-plex-mono": "var(--font-ibm-plex-mono)",
  "instrument-serif": "var(--font-instrument-serif)",
  "jetbrains-mono": "var(--font-jetbrains-mono)",
  system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
} as const

export type FontKey = keyof typeof FONTS

export const SANS_FONTS: readonly FontKey[] = [
  "geist-sans",
  "ibm-plex-sans",
  "instrument-serif",
  "system",
]

export const MONO_FONTS: readonly FontKey[] = [
  "geist-mono",
  "ibm-plex-mono",
  "jetbrains-mono",
]
