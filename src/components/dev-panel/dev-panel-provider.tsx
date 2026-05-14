"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

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
}

const Ctx = createContext<DevPanelContextValue | null>(null)

export function DevPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("themes")
  const [dataProbes, setDataProbes] = useState<Map<string, DevDataEntry>>(
    () => new Map()
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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Toggle on `~` or `` ` `` (backtick) — both share the same physical key.
      const isToggle = e.key === "~" || e.key === "`"
      if (!isToggle) return
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return
      }
      // Avoid swallowing browser/IDE chord shortcuts.
      if (e.metaKey || e.ctrlKey || e.altKey) return
      e.preventDefault()
      toggle()
    }
    function onKeyDownEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keydown", onKeyDownEscape)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keydown", onKeyDownEscape)
    }
  }, [toggle, open])

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
    }),
    [open, toggle, activeTab, dataProbes, registerData, unregisterData]
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
