"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type {
  AccentInput,
  ColorInput,
  ControllerTheme,
  DerivationProfile,
  PresetId,
} from "@/themes/controller-types"
import {
  applyTheme,
  baseThemes,
  defaultThemeId,
  findPreset,
  findTheme,
} from "@/themes/registry"

type Mode = "light" | "dark" | "system"
type ResolvedMode = "light" | "dark"

const THEME_STORAGE_KEY = "website-starter:theme-id"
const MODE_STORAGE_KEY = "website-starter:theme-mode"
const OVERRIDES_STORAGE_KEY = "website-starter:theme-overrides"

type ThemeContextValue = {
  themes: readonly ControllerTheme[]
  theme: ControllerTheme
  themeId: string
  setThemeId: (id: string) => void
  mode: Mode
  setMode: (mode: Mode) => void
  resolvedMode: ResolvedMode
  /** Apply a preset — stamps inputs + derivation onto the active theme. */
  applyPreset: (id: PresetId) => void
  /** Update the Primary input. */
  setPrimary: (next: ColorInput) => void
  /** Update the Accent input (hue, vibrancy, anchor). */
  setAccent: (next: AccentInput) => void
  /** Update warmth scalar [-1, 1]. */
  setWarmth: (next: number) => void
  /** Patch the derivation profile (advanced). */
  patchDerivation: (patch: Partial<DerivationProfile>) => void
  /** Reset the active theme to its base (drops local overrides). */
  resetTheme: () => void
  /** Wipe all theme-related localStorage and revert to registry defaults. */
  clearAll: () => void
  /** True if the active theme has any local edits relative to base. */
  isOverridden: boolean
}

const Ctx = createContext<ThemeContextValue | null>(null)

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* swallow */
  }
}

function getSystemMode(): ResolvedMode {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, ControllerTheme>>(
    {}
  )
  const [themeId, setThemeIdState] = useState<string>(defaultThemeId)
  const [mode, setModeState] = useState<Mode>("system")
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>("light")

  useEffect(() => {
    setOverrides(readStorage(OVERRIDES_STORAGE_KEY, {}))
    setThemeIdState(readStorage(THEME_STORAGE_KEY, defaultThemeId))
    setModeState(readStorage(MODE_STORAGE_KEY, "system"))
  }, [])

  useEffect(() => {
    if (mode !== "system") {
      setResolvedMode(mode)
      return
    }
    const update = () => setResolvedMode(getSystemMode())
    update()
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [mode])

  // Merge base registry with overrides.
  const themes = useMemo<ControllerTheme[]>(() => {
    return baseThemes.map((t) => overrides[t.id] ?? t)
  }, [overrides])

  const theme = useMemo<ControllerTheme>(() => {
    return (
      findTheme(themes, themeId) ??
      findTheme(themes, defaultThemeId) ??
      themes[0]
    )
  }, [themes, themeId])

  // Apply theme to <html> on every theme/mode change.
  useEffect(() => {
    if (typeof document === "undefined") return
    applyTheme(document.documentElement, theme, resolvedMode)
  }, [theme, resolvedMode])

  /* ---- mutators ---- */

  const persistOverrides = useCallback(
    (next: Record<string, ControllerTheme>) => {
      setOverrides(next)
      writeStorage(OVERRIDES_STORAGE_KEY, next)
    },
    []
  )

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id)
    writeStorage(THEME_STORAGE_KEY, id)
  }, [])

  const setMode = useCallback((nextMode: Mode) => {
    setModeState(nextMode)
    writeStorage(MODE_STORAGE_KEY, nextMode)
  }, [])

  const writeTheme = useCallback(
    (next: ControllerTheme) => {
      persistOverrides({ ...overrides, [next.id]: next })
    },
    [overrides, persistOverrides]
  )

  const applyPreset = useCallback(
    (id: PresetId) => {
      if (id === "custom") return
      const preset = findPreset(id)
      if (!preset) return
      // Stamp preset onto the active theme (preserving theme.id/name).
      const next: ControllerTheme = {
        ...theme,
        presetId: id,
        inputs: preset.inputs,
        derivation: preset.derivation,
        overrides: undefined,
      }
      writeTheme(next)
    },
    [theme, writeTheme]
  )

  const setPrimary = useCallback(
    (input: ColorInput) => {
      writeTheme({
        ...theme,
        inputs: { ...theme.inputs, primary: input },
      })
    },
    [theme, writeTheme]
  )

  const setAccent = useCallback(
    (input: AccentInput) => {
      writeTheme({
        ...theme,
        inputs: { ...theme.inputs, accent: input },
      })
    },
    [theme, writeTheme]
  )

  const setWarmth = useCallback(
    (value: number) => {
      writeTheme({
        ...theme,
        inputs: { ...theme.inputs, warmth: value },
      })
    },
    [theme, writeTheme]
  )

  const patchDerivation = useCallback(
    (patch: Partial<DerivationProfile>) => {
      writeTheme({
        ...theme,
        derivation: { ...theme.derivation, ...patch },
      })
    },
    [theme, writeTheme]
  )

  const resetTheme = useCallback(() => {
    const next = { ...overrides }
    delete next[theme.id]
    persistOverrides(next)
  }, [overrides, theme.id, persistOverrides])

  const clearAll = useCallback(() => {
    setOverrides({})
    setThemeIdState(defaultThemeId)
    setModeState("system")
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(OVERRIDES_STORAGE_KEY)
        localStorage.removeItem(THEME_STORAGE_KEY)
        localStorage.removeItem(MODE_STORAGE_KEY)
      } catch {
        /* swallow */
      }
    }
  }, [])

  const isOverridden = Boolean(overrides[theme.id])

  const value = useMemo<ThemeContextValue>(
    () => ({
      themes,
      theme,
      themeId,
      setThemeId,
      mode,
      setMode,
      resolvedMode,
      applyPreset,
      setPrimary,
      setAccent,
      setWarmth,
      patchDerivation,
      resetTheme,
      clearAll,
      isOverridden,
    }),
    [
      themes,
      theme,
      themeId,
      setThemeId,
      mode,
      setMode,
      resolvedMode,
      applyPreset,
      setPrimary,
      setAccent,
      setWarmth,
      patchDerivation,
      resetTheme,
      clearAll,
      isOverridden,
    ]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>")
  }
  return ctx
}
