// src/components/shaders/themed/editorial/1.veil.tsx
import { CursorRipples, FlowingGradient, Paper } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "muted" },
  c: { kind: "theme", token: "brand-accent" },
  d: { kind: "theme", token: "muted-foreground" },
}

const BASE_SCHEMA: DevControlSchema = {
  speed: { type: "number", default: 0.4, min: 0, max: 2, step: 0.05, label: "speed" },
  distortion: { type: "number", default: 0.6, min: 0, max: 2, step: 0.05, label: "distortion" },
  paperGrain: { type: "number", default: 0.2, min: 0, max: 0.5, step: 0.01, label: "paper" },
  grainScale: { type: "number", default: 1.2, min: 0.1, max: 3, step: 0.05, label: "grain scale" },
  seed: { type: "number", default: 0, min: 0, max: 100, step: 1, label: "seed" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: { type: "number", default: 3, min: 0, max: 20, step: 0.1, label: "ripple" },
  rippleRadius: { type: "number", default: 0.6, min: 0.1, max: 1, step: 0.05, label: "radius" },
}

type IdleProps = {
  flowing: {
    colorA: string
    colorB: string
    colorC: string
    colorD: string
    speed: number
    distortion: number
    seed: number
  }
  paper: { roughness: number; grainScale: number }
}

type InteractiveProps = IdleProps & {
  ripple: { intensity: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): IdleProps {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    flowing: {
      colorA: colors.a,
      colorB: colors.b,
      colorC: colors.c,
      colorD: colors.d,
      speed: (controls.speed as number) * speedMul,
      distortion: controls.distortion as number,
      seed: controls.seed as number,
    },
    paper: {
      roughness: controls.paperGrain as number,
      grainScale: controls.grainScale as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): InteractiveProps {
  return {
    ...buildIdle(ctx),
    ripple: {
      intensity: ctx.controls.rippleIntensity as number,
      radius: ctx.controls.rippleRadius as number,
    },
  }
}

function renderIdle(props: unknown) {
  const p = props as IdleProps
  return (
    <>
      <FlowingGradient
        colorA={p.flowing.colorA}
        colorB={p.flowing.colorB}
        colorC={p.flowing.colorC}
        colorD={p.flowing.colorD}
        speed={p.flowing.speed}
        distortion={p.flowing.distortion}
        seed={p.flowing.seed}
        colorSpace="oklch"
      />
      <Paper roughness={p.paper.roughness} grainScale={p.paper.grainScale} displacement={0.08} />
    </>
  )
}

function renderInteractive(props: unknown) {
  const p = props as InteractiveProps
  return (
    <>
      <CursorRipples
        intensity={p.ripple.intensity}
        decay={12}
        radius={p.ripple.radius}
        chromaticSplit={0}
      >
        <FlowingGradient
          colorA={p.flowing.colorA}
          colorB={p.flowing.colorB}
          colorC={p.flowing.colorC}
          colorD={p.flowing.colorD}
          speed={p.flowing.speed}
          distortion={p.flowing.distortion}
          seed={p.flowing.seed}
          colorSpace="oklch"
        />
      </CursorRipples>
      <Paper roughness={p.paper.roughness} grainScale={p.paper.grainScale} displacement={0.08} />
    </>
  )
}

export const editorialVeilPair = definePair({
  baseId: "editorial.1",
  label: "Editorial · Veil",
  paperName: "FlowingGradient + Paper",
  isAscii: false,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(at 70% 30%, {{c}} 0%, transparent 55%), linear-gradient(135deg, {{a}} 0%, {{b}} 100%)",
})
