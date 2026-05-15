import type { ReactNode } from "react"
import { Smoke, Swirl } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
}

const INTERACTIVE_EXTRA_SLOTS: Record<string, ColorSlot> = {
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  speed: {
    type: "number",
    default: 1.4,
    min: 0,
    max: 5,
    step: 0.1,
    label: "speed",
  },
  detail: {
    type: "number",
    default: 1.8,
    min: 0,
    max: 5,
    step: 0.1,
    label: "detail",
  },
  blend: {
    type: "number",
    default: 50,
    min: 0,
    max: 100,
    step: 1,
    label: "blend",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  smokeIntensity: {
    type: "number",
    default: 0.5,
    min: 0.1,
    max: 1,
    step: 0.05,
    label: "smoke",
  },
  mouseInfluence: {
    type: "number",
    default: 0.8,
    min: 0,
    max: 2,
    step: 0.05,
    label: "cursor pull",
  },
  mouseRadius: {
    type: "number",
    default: 0.2,
    min: 0.02,
    max: 0.5,
    step: 0.01,
    label: "cursor radius",
  },
}

type Props = {
  swirl: {
    colorA: string
    colorB: string
    speed: number
    detail: number
    blend: number
  }
  smoke?: {
    colorA: string
    colorB: string
    intensity: number
    mouseInfluence: number
    mouseRadius: number
  }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    swirl: {
      colorA: colors.a,
      colorB: colors.b,
      speed: (controls.speed as number) * speedMul,
      detail: controls.detail as number,
      blend: controls.blend as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    smoke: {
      colorA: ctx.colors.c ?? ctx.colors.a,
      colorB: ctx.colors.a,
      intensity: ctx.controls.smokeIntensity as number,
      mouseInfluence: ctx.controls.mouseInfluence as number,
      mouseRadius: ctx.controls.mouseRadius as number,
    },
  }
}

function swirlNode(p: Props): ReactNode {
  return (
    <Swirl
      colorA={p.swirl.colorA}
      colorB={p.swirl.colorB}
      speed={p.swirl.speed}
      detail={p.swirl.detail}
      blend={p.swirl.blend}
      colorSpace="oklch"
    />
  )
}

function renderIdle(props: unknown): ReactNode {
  return swirlNode(props as Props)
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <>
      {swirlNode(p)}
      <Smoke
        colorA={p.smoke!.colorA}
        colorB={p.smoke!.colorB}
        emitFrom={{ x: 0.5, y: 1 }}
        direction={0}
        speed={15}
        intensity={p.smoke!.intensity}
        mouseInfluence={p.smoke!.mouseInfluence}
        mouseRadius={p.smoke!.mouseRadius}
        dissipation={0.3}
        detail={22}
      />
    </>
  )
}

export const boldSwirlPair = definePair({
  baseId: "bold.3",
  label: "Bold · Swirl",
  paperName: "Swirl (+ Smoke)",
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
    "radial-gradient(at 60% 40%, {{c}} 0%, transparent 40%), conic-gradient(from 180deg at 50% 50%, {{a}}, {{b}}, {{a}})",
})
