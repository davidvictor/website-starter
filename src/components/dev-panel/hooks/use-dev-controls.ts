"use client"

import { folder, useControls } from "leva"
import { useMemo } from "react"

import type {
  DevControlSchema,
  DevControlSpec,
  DevControlValues,
} from "../types"

type LevaInput = Record<string, unknown>

function specToLevaInput(spec: DevControlSpec): LevaInput {
  switch (spec.type) {
    case "number":
      return {
        value: spec.default,
        min: spec.min,
        max: spec.max,
        step: spec.step,
        label: spec.label,
      }
    case "boolean":
    case "string":
    case "color":
      return { value: spec.default, label: spec.label }
    case "select":
      return {
        value: spec.default,
        options: [...spec.options],
        label: spec.label,
      }
    case "vec3":
      return {
        value: {
          x: spec.default[0],
          y: spec.default[1],
          z: spec.default[2],
        },
        label: spec.label,
      }
  }
}

/**
 * Register a typed set of dev controls under a named folder.
 * Values stay in sync with the dev panel's Controls tab.
 */
export function useDevControls<S extends DevControlSchema>(
  group: string,
  schema: S
): DevControlValues<S> {
  const folderSchema = useMemo(() => {
    const inner: Record<string, LevaInput> = {}
    for (const [key, spec] of Object.entries(schema)) {
      inner[key] = specToLevaInput(spec)
    }
    return { [group]: folder(inner as never) } as Record<string, unknown>
  }, [group, schema])

  const values = useControls(folderSchema as never) as Record<string, unknown>

  return useMemo(() => {
    const out: Record<string, unknown> = {}
    for (const [key, spec] of Object.entries(schema)) {
      const raw = values[key]
      if (spec.type === "vec3") {
        if (
          raw &&
          typeof raw === "object" &&
          "x" in raw &&
          "y" in raw &&
          "z" in raw
        ) {
          const v = raw as { x: number; y: number; z: number }
          out[key] = [v.x, v.y, v.z]
        } else if (Array.isArray(raw) && raw.length === 3) {
          out[key] = raw
        } else {
          out[key] = spec.default
        }
      } else {
        out[key] = raw ?? spec.default
      }
    }
    return out as DevControlValues<S>
  }, [schema, values])
}
