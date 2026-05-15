import type { ReactNode } from "react"
import { Ascii, GridDistortion, LinearGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  cellSize: { type: "number", default: 45, min: 24, max: 80, step: 1, label: "cell size" },
  gamma: { type: "number", default: 1.2, min: 0.5, max: 2, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "marks",
    options: ["marks", "rule", "dots"] as const,
    optionsLabels: { marks: "marks  (. : - = +)", rule: "rule  (─ │ ┼)", dots: "dots  (· : ∶)" },
    label: "characters",
  },
  angle: { type: "number", default: 135, min: 0, max: 360, step: 1, label: "angle" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  distortionIntensity: { type: "number", default: 0.4, min: 0, max: 2, step: 0.05, label: "distortion" },
  distortionRadius: { type: "number", default: 1.2, min: 0, max: 3, step: 0.1, label: "radius" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  gradient: { colorA: string; colorB: string; angle: number }
  distortion?: { intensity: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  return {
    ascii: {
      characters: getCharSet("editorial.2.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    gradient: { colorA: colors.a, colorB: colors.c, angle: controls.angle as number },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    distortion: {
      intensity: ctx.controls.distortionIntensity as number,
      radius: ctx.controls.distortionRadius as number,
    },
  }
}

function renderIdle(props: unknown): ReactNode {
  const p = props as Props
  return (
    <Ascii characters={p.ascii.characters} fontFamily="IBM Plex Mono" cellSize={p.ascii.cellSize} spacing={0.95} gamma={p.ascii.gamma}>
      <LinearGradient colorA={p.gradient.colorA} colorB={p.gradient.colorB} angle={p.gradient.angle} colorSpace="oklch" />
    </Ascii>
  )
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <Ascii characters={p.ascii.characters} fontFamily="IBM Plex Mono" cellSize={p.ascii.cellSize} spacing={0.95} gamma={p.ascii.gamma}>
      <GridDistortion intensity={p.distortion!.intensity} decay={4} radius={p.distortion!.radius} gridSize={64}>
        <LinearGradient colorA={p.gradient.colorA} colorB={p.gradient.colorB} angle={p.gradient.angle} colorSpace="oklch" />
      </GridDistortion>
    </Ascii>
  )
}

export const editorialLetterpressPair = definePair({
  baseId: "editorial.2",
  label: "Editorial · Letterpress",
  paperName: "Ascii ← LinearGradient",
  isAscii: true,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground: "linear-gradient(135deg, {{a}} 0%, {{c}} 100%)",
})
