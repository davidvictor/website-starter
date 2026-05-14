"use client"

import { useEffect, useId, useRef } from "react"

import { useDevPanel } from "../dev-panel-provider"
import type { DevDataGetter, DevDataValue } from "../types"

/**
 * Register a live key/value onto the dev panel's Data tab.
 * Pass a primitive for static values, or a getter for live data.
 * Entry is unregistered when the component unmounts.
 */
export function useDevData(
  key: string,
  label: string,
  value: DevDataValue | DevDataGetter,
  group?: string
) {
  const { registerData, unregisterData } = useDevPanel()
  const uid = useId()
  const id = `${group ?? "misc"}:${key}:${uid}`

  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    const read = () => {
      const current = valueRef.current
      return typeof current === "function"
        ? (current as DevDataGetter)()
        : current
    }
    registerData(id, { key, label, read, group })
    return () => unregisterData(id)
  }, [id, key, label, group, registerData, unregisterData])
}
