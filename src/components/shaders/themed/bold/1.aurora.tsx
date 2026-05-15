import type { ReactNode } from "react"
import { Aurora, CursorRipples } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  intensity: { type: "number", default: 85, min: 0, max: 100, step: 1, label: "intensity" },
  curtains: { type: "select", default: "4", options: ["1", "2", "3", "4"] as const, label: "curtains" },
  speed: { type: "number", default: 3.5, min: -10, max: 10, step: 0.1, label: "speed" },
  waviness: { type: "number", default: 80, min: 0, max: 200, step: 1, label: "waviness" },
  rayDensity: { type: "number", default: 35, min: 0, max: 100, step: 1, label: "rays" },
  height: { type: "number", default: 140, min: 10, max: 200, step: 1, label: "height" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: { type: "number", default: 8, min: 0, max: 20, step: 0.1, label: "ripple" },
  rippleRadius: { type: "number", default: 0.6, min: 0.1, max: 1, step: 0.05, label: "radius" },
  chromaticSplit: { type: "number", default: 1.2, min: 0, max: 3, step: 0.1, label: "chroma split" },
}

type Props = {
  aurora: {
    colorA: string; colorB: string; colorC: string
    intensity: number; curtainCount: number; speed: number; waviness: number; rayDensity: number; height: number
  }
  ripple?: { intensity: number; radius: number; chromaticSplit: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  const intensityMul = perfMode === "reduced" ? 0.7 : 1
  return {
    aurora: {
      colorA: colors.a, colorB: colors.b, colorC: colors.c,
      intensity: (controls.intensity as number) * intensityMul,
      curtainCount: Number(controls.curtains as string),
      speed: (controls.speed as number) * speedMul,
      waviness: controls.waviness as number,
      rayDensity: controls.rayDensity as number,
      height: controls.height as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    ripple: {
      intensity: ctx.controls.rippleIntensity as number,
      radius: ctx.controls.rippleRadius as number,
      chromaticSplit: ctx.controls.chromaticSplit as number,
    },
  }
}

function auroraNode(p: Props): ReactNode {
  return (
    <Aurora
      colorA={p.aurora.colorA}
      colorB={p.aurora.colorB}
      colorC={p.aurora.colorC}
      intensity={p.aurora.intensity}
      curtainCount={p.aurora.curtainCount}
      speed={p.aurora.speed}
      waviness={p.aurora.waviness}
      rayDensity={p.aurora.rayDensity}
      height={p.aurora.height}
      colorSpace="oklch"
    />
  )
}

function renderIdle(props: unknown): ReactNode {
  return auroraNode(props as Props)
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <CursorRipples
      intensity={p.ripple!.intensity}
      decay={6}
      radius={p.ripple!.radius}
      chromaticSplit={p.ripple!.chromaticSplit}
    >
      {auroraNode(p)}
    </CursorRipples>
  )
}

export const boldAuroraPair = definePair({
  baseId: "bold.1",
  label: "Bold · Aurora",
  paperName: "Aurora",
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
    "radial-gradient(ellipse 80% 50% at 50% 100%, {{c}} 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 30% 80%, {{b}}, transparent 60%), linear-gradient(180deg, {{a}} 0%, transparent 100%)",
})
