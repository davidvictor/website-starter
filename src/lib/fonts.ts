import {
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google"

/* ------------------------------------------------------------------ */
/* Pre-loaded fonts (next/font, build-time)                            */
/* ------------------------------------------------------------------ */

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

/**
 * Built-in fonts loaded eagerly via next/font. The value is the CSS
 * font-family stack to use (resolving the variable injected by next/font).
 */
export const BUILT_IN_FONTS = {
  "geist-sans": "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  "geist-mono": "var(--font-geist-mono), ui-monospace, monospace",
  "ibm-plex-sans":
    "var(--font-ibm-plex-sans), ui-sans-serif, system-ui, sans-serif",
  "ibm-plex-mono": "var(--font-ibm-plex-mono), ui-monospace, monospace",
  "instrument-serif": "var(--font-instrument-serif), ui-serif, Georgia, serif",
  "jetbrains-mono": "var(--font-jetbrains-mono), ui-monospace, monospace",
  system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  "system-mono": "ui-monospace, SFMono-Regular, Menlo, monospace",
  "system-serif": "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
} as const

export type BuiltInFontKey = keyof typeof BUILT_IN_FONTS

/** A font identifier — either a built-in key or `google:Family Name`. */
export type FontKey = BuiltInFontKey | `google:${string}`

/* ------------------------------------------------------------------ */
/* Google Fonts catalog                                                */
/* ------------------------------------------------------------------ */

export type FontCategory = "sans" | "serif" | "display" | "mono" | "handwriting"

export type GoogleFontMeta = {
  family: string
  category: FontCategory
  weights: readonly number[]
  /** Whether this font is editorial-leaning (serif/display) or workhorse (sans/mono). */
  vibe?: "editorial" | "saas" | "bold" | "cyber" | "neutral"
}

/**
 * Curated Google Fonts catalog. Hand-picked top-tier families across
 * categories so the picker has substance without shipping all ~1500 fonts.
 * Add more as needed.
 */
export const GOOGLE_FONTS: readonly GoogleFontMeta[] = [
  // ── Sans-serif workhorses ──────────────────────────────────────────
  {
    family: "Inter",
    category: "sans",
    weights: [300, 400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Manrope",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
    vibe: "saas",
  },
  {
    family: "DM Sans",
    category: "sans",
    weights: [400, 500, 700],
    vibe: "saas",
  },
  {
    family: "Plus Jakarta Sans",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Outfit",
    category: "sans",
    weights: [300, 400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Be Vietnam Pro",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Public Sans",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Albert Sans",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Sora",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Work Sans",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "saas",
  },
  {
    family: "Nunito",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "neutral",
  },
  {
    family: "Open Sans",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "neutral",
  },
  { family: "Lato", category: "sans", weights: [400, 700], vibe: "neutral" },
  {
    family: "Poppins",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "neutral",
  },
  {
    family: "Montserrat",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "neutral",
  },
  {
    family: "Roboto",
    category: "sans",
    weights: [400, 500, 700],
    vibe: "neutral",
  },
  {
    family: "Source Sans 3",
    category: "sans",
    weights: [400, 600, 700],
    vibe: "neutral",
  },

  // ── Display / bold ─────────────────────────────────────────────────
  {
    family: "Space Grotesk",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "bold",
  },
  {
    family: "Bricolage Grotesque",
    category: "display",
    weights: [400, 500, 600, 700, 800],
    vibe: "bold",
  },
  {
    family: "Anybody",
    category: "display",
    weights: [400, 600, 700, 800],
    vibe: "bold",
  },
  {
    family: "Big Shoulders Display",
    category: "display",
    weights: [400, 600, 800, 900],
    vibe: "bold",
  },
  {
    family: "Archivo Black",
    category: "display",
    weights: [400],
    vibe: "bold",
  },
  { family: "Boldonse", category: "display", weights: [400], vibe: "bold" },
  {
    family: "Unbounded",
    category: "display",
    weights: [400, 500, 600, 700, 800],
    vibe: "bold",
  },
  {
    family: "Syne",
    category: "sans",
    weights: [400, 500, 600, 700, 800],
    vibe: "bold",
  },
  {
    family: "Chakra Petch",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "bold",
  },
  {
    family: "Saira",
    category: "sans",
    weights: [400, 500, 600, 700],
    vibe: "bold",
  },

  // ── Editorial / serif ──────────────────────────────────────────────
  {
    family: "Fraunces",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Playfair Display",
    category: "serif",
    weights: [400, 500, 600, 700, 800],
    vibe: "editorial",
  },
  {
    family: "EB Garamond",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Cormorant Garamond",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Crimson Pro",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Lora",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Source Serif 4",
    category: "serif",
    weights: [400, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Libre Caslon Text",
    category: "serif",
    weights: [400, 700],
    vibe: "editorial",
  },
  {
    family: "Libre Bodoni",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Newsreader",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },
  {
    family: "Spectral",
    category: "serif",
    weights: [400, 500, 600, 700],
    vibe: "editorial",
  },

  // ── Monospaces ─────────────────────────────────────────────────────
  {
    family: "JetBrains Mono",
    category: "mono",
    weights: [400, 500, 600, 700],
    vibe: "cyber",
  },
  {
    family: "IBM Plex Mono",
    category: "mono",
    weights: [400, 500, 600],
    vibe: "neutral",
  },
  {
    family: "Geist Mono",
    category: "mono",
    weights: [400, 500, 600, 700],
    vibe: "neutral",
  },
  {
    family: "Space Mono",
    category: "mono",
    weights: [400, 700],
    vibe: "cyber",
  },
  {
    family: "Fira Code",
    category: "mono",
    weights: [400, 500, 600, 700],
    vibe: "cyber",
  },
  {
    family: "Roboto Mono",
    category: "mono",
    weights: [400, 500, 700],
    vibe: "neutral",
  },
  { family: "DM Mono", category: "mono", weights: [400, 500], vibe: "neutral" },
  {
    family: "Source Code Pro",
    category: "mono",
    weights: [400, 500, 700],
    vibe: "neutral",
  },
  {
    family: "Inconsolata",
    category: "mono",
    weights: [400, 500, 700],
    vibe: "cyber",
  },
  {
    family: "Major Mono Display",
    category: "mono",
    weights: [400],
    vibe: "cyber",
  },
  { family: "VT323", category: "mono", weights: [400], vibe: "cyber" },
  {
    family: "Share Tech Mono",
    category: "mono",
    weights: [400],
    vibe: "cyber",
  },
  { family: "Departure Mono", category: "mono", weights: [400], vibe: "cyber" },
]

const GOOGLE_FONT_BY_FAMILY = new Map<string, GoogleFontMeta>()
for (const f of GOOGLE_FONTS) GOOGLE_FONT_BY_FAMILY.set(f.family, f)

/* ------------------------------------------------------------------ */
/* Curated font sets per theme                                          */
/* ------------------------------------------------------------------ */

export type FontSet = {
  id: string
  label: string
  hint: string
  sans: FontKey
  heading: FontKey
  mono: FontKey
}

export const FONT_SETS: Record<
  "editorial" | "saas" | "bold" | "cyber",
  FontSet[]
> = {
  editorial: [
    {
      id: "editorial-classic",
      label: "Classic",
      hint: "Geist · Instrument Serif",
      sans: "geist-sans",
      heading: "instrument-serif",
      mono: "ibm-plex-mono",
    },
    {
      id: "editorial-fraunces",
      label: "Fraunces",
      hint: "Inter · Fraunces",
      sans: "google:Inter",
      heading: "google:Fraunces",
      mono: "google:IBM Plex Mono",
    },
    {
      id: "editorial-playfair",
      label: "Playfair",
      hint: "Lato · Playfair Display",
      sans: "google:Lato",
      heading: "google:Playfair Display",
      mono: "ibm-plex-mono",
    },
    {
      id: "editorial-newsreader",
      label: "Newsreader",
      hint: "Public Sans · Newsreader",
      sans: "google:Public Sans",
      heading: "google:Newsreader",
      mono: "ibm-plex-mono",
    },
    {
      id: "editorial-garamond",
      label: "Garamond",
      hint: "Albert Sans · EB Garamond",
      sans: "google:Albert Sans",
      heading: "google:EB Garamond",
      mono: "ibm-plex-mono",
    },
  ],
  saas: [
    {
      id: "saas-geist",
      label: "Geist",
      hint: "Geist Sans + Mono",
      sans: "geist-sans",
      heading: "geist-sans",
      mono: "geist-mono",
    },
    {
      id: "saas-inter",
      label: "Inter",
      hint: "Inter · JetBrains Mono",
      sans: "google:Inter",
      heading: "google:Inter",
      mono: "google:JetBrains Mono",
    },
    {
      id: "saas-manrope",
      label: "Manrope",
      hint: "Manrope · DM Mono",
      sans: "google:Manrope",
      heading: "google:Manrope",
      mono: "google:DM Mono",
    },
    {
      id: "saas-jakarta",
      label: "Jakarta",
      hint: "Plus Jakarta · Geist Mono",
      sans: "google:Plus Jakarta Sans",
      heading: "google:Plus Jakarta Sans",
      mono: "geist-mono",
    },
    {
      id: "saas-dm",
      label: "DM",
      hint: "DM Sans · DM Mono",
      sans: "google:DM Sans",
      heading: "google:DM Sans",
      mono: "google:DM Mono",
    },
  ],
  bold: [
    {
      id: "bold-grotesk",
      label: "Grotesk",
      hint: "Space Grotesk · JetBrains Mono",
      sans: "google:Space Grotesk",
      heading: "google:Space Grotesk",
      mono: "google:JetBrains Mono",
    },
    {
      id: "bold-bricolage",
      label: "Bricolage",
      hint: "Inter · Bricolage Grotesque",
      sans: "google:Inter",
      heading: "google:Bricolage Grotesque",
      mono: "google:JetBrains Mono",
    },
    {
      id: "bold-syne",
      label: "Syne",
      hint: "Inter · Syne",
      sans: "google:Inter",
      heading: "google:Syne",
      mono: "google:JetBrains Mono",
    },
    {
      id: "bold-unbounded",
      label: "Unbounded",
      hint: "Inter · Unbounded",
      sans: "google:Inter",
      heading: "google:Unbounded",
      mono: "geist-mono",
    },
    {
      id: "bold-archivo",
      label: "Archivo",
      hint: "Manrope · Archivo Black",
      sans: "google:Manrope",
      heading: "google:Archivo Black",
      mono: "google:JetBrains Mono",
    },
  ],
  cyber: [
    {
      id: "cyber-plex",
      label: "IBM Plex",
      hint: "IBM Plex Mono everywhere",
      sans: "ibm-plex-mono",
      heading: "ibm-plex-mono",
      mono: "jetbrains-mono",
    },
    {
      id: "cyber-jetbrains",
      label: "JetBrains",
      hint: "JetBrains Mono everywhere",
      sans: "google:JetBrains Mono",
      heading: "google:JetBrains Mono",
      mono: "google:JetBrains Mono",
    },
    {
      id: "cyber-space",
      label: "Space Mono",
      hint: "Space Mono · Fira Code",
      sans: "google:Space Mono",
      heading: "google:Space Mono",
      mono: "google:Fira Code",
    },
    {
      id: "cyber-vt323",
      label: "VT323",
      hint: "VT323 · Share Tech Mono",
      sans: "google:Share Tech Mono",
      heading: "google:VT323",
      mono: "google:Share Tech Mono",
    },
    {
      id: "cyber-major",
      label: "Major",
      hint: "Inconsolata · Major Mono",
      sans: "google:Inconsolata",
      heading: "google:Major Mono Display",
      mono: "google:Inconsolata",
    },
  ],
}

/* ------------------------------------------------------------------ */
/* Resolution                                                          */
/* ------------------------------------------------------------------ */

/**
 * Resolve a font key to a CSS font-family value usable in a CSS variable.
 * - Built-in keys → their pre-loaded variable + fallback stack
 * - `google:Family Name` → `"Family Name", <fallback for category>`
 */
export function resolveFontFamily(key: FontKey | string): string {
  if (key in BUILT_IN_FONTS) {
    return BUILT_IN_FONTS[key as BuiltInFontKey]
  }
  if (typeof key === "string" && key.startsWith("google:")) {
    const family = key.slice(7)
    const meta = GOOGLE_FONT_BY_FAMILY.get(family)
    const fallback =
      meta?.category === "mono"
        ? "ui-monospace, monospace"
        : meta?.category === "serif"
          ? "ui-serif, Georgia, serif"
          : "ui-sans-serif, system-ui, sans-serif"
    return `"${family}", ${fallback}`
  }
  // Unknown key — fall back to system sans rather than failing.
  return BUILT_IN_FONTS.system
}

/** Human label for a font key. */
export function fontLabel(key: FontKey | string): string {
  if (key in BUILT_IN_FONTS) {
    if (key === "system") return "System Sans"
    if (key === "system-mono") return "System Mono"
    if (key === "system-serif") return "System Serif"
    return key
      .replace(/^geist-/, "Geist ")
      .replace(/^ibm-plex-/, "IBM Plex ")
      .replace(/^instrument-/, "Instrument ")
      .replace(/^jetbrains-/, "JetBrains ")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  if (typeof key === "string" && key.startsWith("google:")) {
    return key.slice(7)
  }
  return String(key)
}

/* ------------------------------------------------------------------ */
/* Dynamic Google Fonts loading                                         */
/* ------------------------------------------------------------------ */

const loadedGoogleFonts = new Set<string>()

/**
 * Inject a Google Fonts stylesheet link for `family` if not already loaded.
 * Safe to call on the server (no-op).
 */
export function loadGoogleFont(family: string): void {
  if (typeof document === "undefined") return
  if (loadedGoogleFonts.has(family)) return
  const meta = GOOGLE_FONT_BY_FAMILY.get(family)
  const weights = meta?.weights ?? [400, 500, 600, 700]
  const weightSpec = weights.join(";")
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  ).replace(/%20/g, "+")}:wght@${weightSpec}&display=swap`
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = href
  link.dataset.googleFont = family
  document.head.appendChild(link)
  loadedGoogleFonts.add(family)
}

/** Load a font from a FontKey if it's a Google font. No-op for built-ins. */
export function loadFontIfRemote(key: FontKey | string): void {
  if (typeof key === "string" && key.startsWith("google:")) {
    loadGoogleFont(key.slice(7))
  }
}

/* ------------------------------------------------------------------ */
/* Legacy compat                                                       */
/* ------------------------------------------------------------------ */

/** @deprecated — use BUILT_IN_FONTS or resolveFontFamily(). */
export const FONTS = BUILT_IN_FONTS

export const SANS_FONTS: readonly BuiltInFontKey[] = [
  "geist-sans",
  "ibm-plex-sans",
  "instrument-serif",
  "system",
]

export const MONO_FONTS: readonly BuiltInFontKey[] = [
  "geist-mono",
  "ibm-plex-mono",
  "jetbrains-mono",
  "system-mono",
]
