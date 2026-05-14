import type { ReactNode } from "react"

export type DevControlSpec =
  | {
      type: "number"
      default: number
      min?: number
      max?: number
      step?: number
      label?: string
    }
  | { type: "boolean"; default: boolean; label?: string }
  | { type: "string"; default: string; label?: string }
  | { type: "color"; default: string; label?: string }
  | {
      type: "select"
      default: string
      options: readonly string[]
      label?: string
    }
  | {
      type: "vec3"
      default: [number, number, number]
      label?: string
    }

export type DevControlSchema = Record<string, DevControlSpec>

export type DevControlValues<S extends DevControlSchema> = {
  [K in keyof S]: S[K] extends { type: "number" }
    ? number
    : S[K] extends { type: "boolean" }
      ? boolean
      : S[K] extends { type: "string" }
        ? string
        : S[K] extends { type: "color" }
          ? string
          : S[K] extends { type: "select"; options: infer O }
            ? O extends readonly string[]
              ? O[number]
              : never
            : S[K] extends { type: "vec3" }
              ? [number, number, number]
              : never
}

export type DevRoute = {
  path: string
  label: string
  group?: string
  description?: string
}

export type DevDataPrimitive = string | number | boolean | null | undefined
export type DevDataValue = DevDataPrimitive | ReactNode
export type DevDataGetter = () => DevDataValue

export type DevDataEntry = {
  key: string
  label: string
  read: () => DevDataValue
  group?: string
}
