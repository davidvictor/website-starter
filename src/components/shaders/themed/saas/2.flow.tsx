import type { ReactNode } from "react"
import { ChromaFlow, FlowingGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "primary" },
  c: { kind: "theme", token: "accent" },
  d: { kind: "theme", token: "brand-accent" },
}

const INTERACTIVE_EXTRA_SLOTS: Record<string, ColorSlot> = {
  e: { kind: "theme", token: "chart-1" },
  f: { kind: "theme", token: "chart-2" },
}

const BASE_SCHEMA: DevControlSchema = {
  speed: {
    type: "number",
    default: 0.8,
    min: 0,
    max: 2,
    step: 0.05,
    label: "speed",
  },
  distortion: {
    type: "number",
    default: 0.7,
    min: 0,
    max: 2,
    step: 0.05,
    label: "distortion",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  intensity: {
    type: "number",
    default: 1.0,
    min: 0.5,
    max: 1.5,
    step: 0.05,
    label: "intensity",
  },
  radius: {
    type: "number",
    default: 2.5,
    min: 0,
    max: 5,
    step: 0.1,
    label: "radius",
  },
  momentum: {
    type: "number",
    default: 28,
    min: 10,
    max: 60,
    step: 1,
    label: "momentum",
  },
}

type IdleProps = {
  flowing: {
    colorA: string
    colorB: string
    colorC: string
    colorD: string
    speed: number
    distortion: number
  }
}

type InteractiveProps = {
  chroma: {
    baseColor: string
    upColor: string
    downColor: string
    leftColor: string
    rightColor: string
    intensity: number
    radius: number
    momentum: number
  }
}

function buildIdle({
  colors,
  controls,
  perfMode,
}: BuildPropsContext): IdleProps {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    flowing: {
      colorA: colors.a,
      colorB: colors.b,
      colorC: colors.c,
      colorD: colors.d,
      speed: (controls.speed as number) * speedMul,
      distortion: controls.distortion as number,
    },
  }
}

function buildInteractive({
  colors,
  controls,
}: BuildPropsContext): InteractiveProps {
  return {
    chroma: {
      baseColor: colors.b,
      upColor: colors.c,
      downColor: colors.d,
      leftColor: colors.e ?? colors.b,
      rightColor: colors.f ?? colors.c,
      intensity: controls.intensity as number,
      radius: controls.radius as number,
      momentum: controls.momentum as number,
    },
  }
}

function renderIdle(props: unknown): ReactNode {
  const p = props as IdleProps
  return (
    <FlowingGradient
      colorA={p.flowing.colorA}
      colorB={p.flowing.colorB}
      colorC={p.flowing.colorC}
      colorD={p.flowing.colorD}
      speed={p.flowing.speed}
      distortion={p.flowing.distortion}
      colorSpace="oklch"
    />
  )
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as InteractiveProps
  return (
    <ChromaFlow
      baseColor={p.chroma.baseColor}
      upColor={p.chroma.upColor}
      downColor={p.chroma.downColor}
      leftColor={p.chroma.leftColor}
      rightColor={p.chroma.rightColor}
      intensity={p.chroma.intensity}
      radius={p.chroma.radius}
      momentum={p.chroma.momentum}
    />
  )
}

export const saasFlowPair = definePair({
  baseId: "saas.2",
  label: "SaaS · Flow",
  paperName: "FlowingGradient → ChromaFlow",
  isAscii: false,
  slots: SLOTS,
  interactiveExtraSlots: INTERACTIVE_EXTRA_SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "linear-gradient(135deg, {{a}}, {{b}} 40%, {{c}} 70%, {{d}})",
})
