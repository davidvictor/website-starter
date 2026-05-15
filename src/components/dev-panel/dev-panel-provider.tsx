// src/components/dev-panel/dev-panel-provider.tsx
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
import type { ShaderId } from "@/components/shaders/themed/types"
import type { DevDataEntry } from "./types"

type DevPanelContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
  dataProbes: ReadonlyMap<string, DevDataEntry>
  registerData: (id: string, entry: DevDataEntry) => void
  unregisterData: (id: string) => void

  // NEW
  focusedShaderId: ShaderId | null
  setFocusedShaderId: (id: ShaderId | null) => void
  cycleFocus: (dir: 1 | -1) => void
  forceReducedMotion: boolean
  setForceReducedMotion: (v: boolean) => void
  mountedShaders: ReadonlySet<ShaderId>
  registerMountedShader: (id: ShaderId) => void
  unregisterMountedShader: (id: ShaderId) => void
}

const Ctx = createContext<DevPanelContextValue | null>(null)

export function DevPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("themes")
  const [dataProbes, setDataProbes] = useState<Map<string, DevDataEntry>>(
    () => new Map()
  )
  const [focusedShaderId, setFocusedShaderId] = useState<ShaderId | null>(null)
  const [forceReducedMotion, setForceReducedMotion] = useState(false)
  const [mountedShaders, setMountedShaders] = useState<Set<ShaderId>>(
    () => new Set()
  )

  const toggle = useCallback(() => setOpen((o) => !o), [])

  const registerData = useCallback((id: string, entry: DevDataEntry) => {
    setDataProbes((prev) => {
      const next = new Map(prev)
      next.set(id, entry)
      return next
    })
  }, [])

  const unregisterData = useCallback((id: string) => {
    setDataProbes((prev) => {
      if (!prev.has(id)) return prev
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const registerMountedShader = useCallback((id: ShaderId) => {
    setMountedShaders((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const unregisterMountedShader = useCallback((id: ShaderId) => {
    setMountedShaders((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const cycleFocus = useCallback(
    (dir: 1 | -1) => {
      setFocusedShaderId((current) => {
        const ids = Array.from(mountedShaders).sort()
        if (ids.length === 0) return null
        const idx = current === null ? -1 : ids.indexOf(current)
        const nextIdx = idx + dir
        if (nextIdx < 0 || nextIdx >= ids.length) return null
        return ids[nextIdx]
      })
    },
    [mountedShaders]
  )

  useEffect(() => {
    function isModifierComboFor(e: KeyboardEvent, base: "[" | "]"): boolean {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac")
      const mod = isMac ? e.metaKey : e.ctrlKey
      return mod && e.key === base
    }

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const inEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      // ~ / backtick toggles
      const isTilde =
        (e.key === "~" || e.key === "`") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      if (isTilde && !inEditable) {
        e.preventDefault()
        toggle()
        return
      }

      // Esc — close OR clear focus
      if (e.key === "Escape" && open) {
        if (focusedShaderId !== null) {
          setFocusedShaderId(null)
        } else {
          setOpen(false)
        }
        return
      }

      // Cmd+] / Cmd+[ (macOS) or Ctrl+] / Ctrl+[ (others) — cycle focus
      if (open) {
        if (isModifierComboFor(e, "]")) {
          e.preventDefault()
          cycleFocus(1)
        } else if (isModifierComboFor(e, "[")) {
          e.preventDefault()
          cycleFocus(-1)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggle, open, focusedShaderId, cycleFocus])

  const value = useMemo<DevPanelContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      activeTab,
      setActiveTab,
      dataProbes,
      registerData,
      unregisterData,
      focusedShaderId,
      setFocusedShaderId,
      cycleFocus,
      forceReducedMotion,
      setForceReducedMotion,
      mountedShaders,
      registerMountedShader,
      unregisterMountedShader,
    }),
    [
      open,
      toggle,
      activeTab,
      dataProbes,
      registerData,
      unregisterData,
      focusedShaderId,
      cycleFocus,
      forceReducedMotion,
      mountedShaders,
      registerMountedShader,
      unregisterMountedShader,
    ]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDevPanel() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error("useDevPanel must be used inside <DevPanelProvider>")
  }
  return ctx
}

export function useMountedShaderCount(): number {
  return useDevPanel().mountedShaders.size
}
