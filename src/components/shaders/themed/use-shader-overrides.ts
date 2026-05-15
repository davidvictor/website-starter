// src/components/shaders/themed/use-shader-overrides.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { getShaderDef } from "./registry"
import type { ShaderId, ShaderOverrides } from "./types"

const STORAGE_PREFIX = "website-starter:shader:"

function empty(v: number): ShaderOverrides {
  return { v, controls: {}, colorSlots: {} }
}

function read(key: string, currentVersion: number): ShaderOverrides {
  if (typeof window === "undefined") return empty(currentVersion)
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return empty(currentVersion)
    const parsed = JSON.parse(raw) as ShaderOverrides
    if (parsed.v !== currentVersion) return empty(currentVersion)
    return parsed
  } catch {
    return empty(currentVersion)
  }
}

export function useShaderOverrides(
  shaderId: ShaderId
): [ShaderOverrides, (patch: Partial<ShaderOverrides>) => void, () => void] {
  const def = getShaderDef(shaderId)
  const key = `${STORAGE_PREFIX}${shaderId}`

  const [state, setState] = useState<ShaderOverrides>(() =>
    read(key, def.schemaVersion)
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* quota or private mode — silent */
    }
  }, [key, state])

  const patch = useCallback(
    (next: Partial<ShaderOverrides>) =>
      setState((prev) => ({ ...prev, ...next, v: def.schemaVersion })),
    [def.schemaVersion]
  )

  const reset = useCallback(
    () => setState(empty(def.schemaVersion)),
    [def.schemaVersion]
  )

  return [state, patch, reset]
}

/** Imperative reset used by the "Reset all 24 shaders" button in the Themes tab. */
export function clearAllShaderOverrides(ids: readonly ShaderId[]): void {
  if (typeof window === "undefined") return
  for (const id of ids) {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${id}`)
    } catch {
      /* silent */
    }
  }
}
