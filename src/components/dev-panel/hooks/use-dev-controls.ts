// src/components/dev-panel/hooks/use-dev-controls.ts
"use client"

import { folder, useControls } from "leva"
import { useMemo } from "react"

import type {
  DevControlSchema,
  DevControlSpec,
  DevControlValues,
} from "../types"

type LevaInput = Record<string, unknown>

type UseDevControlsOptions = {
  /** When false, the folder is not registered with Leva; the hook still
   *  returns merged defaults+values so the caller can render correctly. */
  enabled?: boolean
  /** Pre-populated values to merge over schema defaults when disabled,
   *  or to seed Leva's inputs when enabled. */
  values?: Record<string, unknown>
}

function specToLevaInput(
  spec: DevControlSpec,
  seedValue: unknown
): LevaInput {
  const value = seedValue ?? spec.default

  if (spec.renderIf) {
    const renderIfKey = spec.renderIf.key
    const renderIfEquals = spec.renderIf.equals
    const renderProp = {
      render: (get: (key: string) => unknown) =>
        get(renderIfKey) === renderIfEquals,
    }

    switch (spec.type) {
      case "number":
        return {
          value,
          min: spec.min,
          max: spec.max,
          step: spec.step,
          label: spec.label,
          ...renderProp,
        }
      case "boolean":
      case "string":
      case "color":
        return { value, label: spec.label, ...renderProp }
      case "select": {
        if (spec.optionsLabels) {
          const opts: Record<string, string> = {}
          for (const v of spec.options) {
            opts[spec.optionsLabels[v] ?? v] = v
          }
          return { value, options: opts, label: spec.label, ...renderProp }
        }
        return {
          value,
          options: [...spec.options],
          label: spec.label,
          ...renderProp,
        }
      }
      case "vec3": {
        const v = value as [number, number, number] | { x: number; y: number; z: number }
        const seed = Array.isArray(v) ? { x: v[0], y: v[1], z: v[2] } : v
        return { value: seed, label: spec.label, ...renderProp }
      }
    }
  }

  switch (spec.type) {
    case "number":
      return {
        value,
        min: spec.min,
        max: spec.max,
        step: spec.step,
        label: spec.label,
      }
    case "boolean":
    case "string":
    case "color":
      return { value, label: spec.label }
    case "select": {
      if (spec.optionsLabels) {
        const opts: Record<string, string> = {}
        for (const v of spec.options) {
          opts[spec.optionsLabels[v] ?? v] = v
        }
        return { value, options: opts, label: spec.label }
      }
      return {
        value,
        options: [...spec.options],
        label: spec.label,
      }
    }
    case "vec3": {
      const v = value as [number, number, number] | { x: number; y: number; z: number }
      const seed = Array.isArray(v) ? { x: v[0], y: v[1], z: v[2] } : v
      return { value: seed, label: spec.label }
    }
  }
}

function defaultFor(spec: DevControlSpec): unknown {
  return spec.type === "vec3" ? [...spec.default] : spec.default
}

function mergeDefaults<S extends DevControlSchema>(
  schema: S,
  values: Record<string, unknown>
): DevControlValues<S> {
  const out: Record<string, unknown> = {}
  for (const [key, spec] of Object.entries(schema)) {
    const v = values[key]
    if (v === undefined) {
      out[key] = defaultFor(spec)
      continue
    }
    if (spec.type === "vec3") {
      if (Array.isArray(v) && v.length === 3) out[key] = v
      else if (v && typeof v === "object" && "x" in v && "y" in v && "z" in v) {
        const o = v as { x: number; y: number; z: number }
        out[key] = [o.x, o.y, o.z]
      } else out[key] = defaultFor(spec)
    } else {
      out[key] = v
    }
  }
  return out as DevControlValues<S>
}

/**
 * Register a typed set of dev controls under a named folder.
 * Values stay in sync with the dev panel's Controls tab.
 *
 * @param group   - Folder label shown in the Leva panel.
 * @param schema  - Typed control descriptors.
 * @param options - Optional `{ enabled, values }`.
 *   - `enabled=false`: folder is NOT registered with Leva; hook returns
 *     merged defaults+values so callers render correctly without the panel.
 *   - `values`: seed values merged over schema defaults.
 */
export function useDevControls<S extends DevControlSchema>(
  group: string,
  schema: S,
  options?: UseDevControlsOptions
): DevControlValues<S> {
  const enabled = options?.enabled ?? true
  const externalValues = options?.values

  const folderSchema = useMemo(() => {
    if (!enabled) return null
    const inner: Record<string, LevaInput> = {}
    for (const [key, spec] of Object.entries(schema)) {
      inner[key] = specToLevaInput(spec, externalValues?.[key])
    }
    return { [group]: folder(inner as never) } as Record<string, unknown>
    // Re-register when schema or seed values shape changes.
  }, [enabled, group, schema, externalValues])

  // useControls must be unconditional (React rules of hooks).
  // Pass empty object when disabled — registers nothing with Leva.
  const levaValues = useControls(
    (folderSchema ?? {}) as never
  ) as Record<string, unknown>

  return useMemo(() => {
    if (!enabled) {
      return mergeDefaults(schema, externalValues ?? {})
    }
    // Normalize vec3 values back to tuples.
    const normalized: Record<string, unknown> = {}
    for (const [key, spec] of Object.entries(schema)) {
      const raw = levaValues[key]
      if (spec.type === "vec3") {
        if (raw && typeof raw === "object" && "x" in raw && "y" in raw && "z" in raw) {
          const v = raw as { x: number; y: number; z: number }
          normalized[key] = [v.x, v.y, v.z]
        } else if (Array.isArray(raw) && raw.length === 3) {
          normalized[key] = raw
        } else {
          normalized[key] = defaultFor(spec)
        }
      } else {
        normalized[key] = raw ?? defaultFor(spec)
      }
    }
    return normalized as DevControlValues<S>
  }, [enabled, externalValues, schema, levaValues])
}
