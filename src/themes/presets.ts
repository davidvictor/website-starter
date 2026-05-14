import type { ControllerTheme, PresetId } from "./controller-types"

/**
 * Built-in presets. Each preset is a full ControllerTheme: a starting
 * triple of (primary, accent, warmth) + a derivation profile that
 * decides chroma, contrast, semantic intensity, and how the accent
 * propagates through the UI.
 *
 * Picking a preset stamps both inputs AND derivation. Editing inputs
 * afterwards leaves the derivation intact (so the "character" of the
 * preset persists). Re-picking the preset re-stamps both.
 */
export const PRESETS: Record<Exclude<PresetId, "custom">, ControllerTheme> = {
  editorial: {
    id: "editorial",
    name: "Editorial",
    presetId: "editorial",
    description:
      "Quiet, considered, almost editorial. Single-accent system. Reads like print.",
    inputs: {
      primary: { hue: 30, vibrancy: 12 },
      accent: { hue: 25, vibrancy: 78, anchor: "free" },
      warmth: 0.65,
    },
    derivation: {
      chromaBoost: 0.7,
      contrast: "high",
      semanticIntensity: 0.75,
      accentUsage: "rare",
      radius: "0.25rem",
      fonts: {
        sans: "geist-sans",
        mono: "ibm-plex-mono",
        heading: "instrument-serif",
      },
    },
  },
  saas: {
    id: "saas",
    name: "SaaS",
    presetId: "saas",
    description:
      "Balanced, modern, gets out of the way. The Linear/Clerk/Cursor school.",
    inputs: {
      primary: { hue: 250, vibrancy: 62 },
      accent: { hue: 310, vibrancy: 72, anchor: "free" },
      warmth: 0,
    },
    derivation: {
      chromaBoost: 1.0,
      contrast: "medium",
      semanticIntensity: 1.0,
      accentUsage: "primary-only",
      radius: "0.625rem",
      fonts: {
        sans: "geist-sans",
        mono: "geist-mono",
        heading: "geist-sans",
      },
    },
  },
  bold: {
    id: "bold",
    name: "Bold",
    presetId: "bold",
    description:
      "Vercel/Replit/Framer energy. Big type, gradient hits, accent everywhere.",
    inputs: {
      primary: { hue: 290, vibrancy: 88 },
      accent: { hue: 50, vibrancy: 95, anchor: "free" },
      warmth: -0.15,
    },
    derivation: {
      chromaBoost: 1.3,
      contrast: "high",
      semanticIntensity: 1.2,
      accentUsage: "maximal",
      radius: "0.125rem",
      fonts: {
        sans: "geist-sans",
        mono: "jetbrains-mono",
        heading: "geist-sans",
      },
    },
  },
  cyber: {
    id: "cyber",
    name: "Cyber",
    presetId: "cyber",
    description:
      "High-contrast neon on near-black. Mono everywhere. The terminal preset.",
    inputs: {
      primary: { hue: 190, vibrancy: 85 },
      accent: { hue: 140, vibrancy: 92, anchor: "free" },
      warmth: -0.45,
    },
    derivation: {
      chromaBoost: 1.25,
      contrast: "high",
      semanticIntensity: 1.15,
      accentUsage: "broad",
      radius: "0.125rem",
      fonts: {
        sans: "ibm-plex-mono",
        mono: "jetbrains-mono",
        heading: "ibm-plex-mono",
      },
    },
  },
}

export const DEFAULT_PRESET_ID: PresetId = "saas"
