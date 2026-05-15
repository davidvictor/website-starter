import type { ReactNode } from "react"
import { CursorRipples, MultiPointGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
  c: { kind: "theme", token: "brand-accent" },
  d: { kind: "theme", token: "chart-1" },
  e: { kind: "theme", token: "background" },
}

const BASE_SCHEMA: DevControlSchema = {
  smoothness: { type: "number", default: 2.5, min: 0, max: 5, step: 0.05, label: "smoothness" },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: { type: "number", default: 6, min: 0, max: 20, step: 0.1, label: "ripple" },
  rippleRadius: { type: "number", default: 0.5, min: 0.1, max: 1, step: 0.05, label: "radius" },
  chromaticSplit: { type: "number", default: 0.6, min: 0, max: 3, step: 0.1, label: "chroma split" },
}

type Props = {
  mesh: { colorA: string; colorB: string; colorC: string; colorD: string; colorE: string; smoothness: number }
  ripple?: { intensity: number; radius: number; chromaticSplit: number }
}

function buildIdle({ colors, controls }: BuildPropsContext): Props {
  return {
    mesh: {
      colorA: colors.a, colorB: colors.b, colorC: colors.c, colorD: colors.d, colorE: colors.e,
      smoothness: controls.smoothness as number,
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

function meshNode(p: Props): ReactNode {
  return (
    <MultiPointGradient
      colorA={p.mesh.colorA} positionA={{ x: 0.2, y: 0.2 }}
      colorB={p.mesh.colorB} positionB={{ x: 0.8, y: 0.15 }}
      colorC={p.mesh.colorC} positionC={{ x: 0.85, y: 0.85 }}
      colorD={p.mesh.colorD} positionD={{ x: 0.15, y: 0.85 }}
      colorE={p.mesh.colorE} positionE={{ x: 0.5, y: 0.5 }}
      smoothness={p.mesh.smoothness}
    />
  )
}

function renderIdle(props: unknown): ReactNode {
  return meshNode(props as Props)
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <CursorRipples
      intensity={p.ripple!.intensity}
      decay={8}
      radius={p.ripple!.radius}
      chromaticSplit={p.ripple!.chromaticSplit}
    >
      {meshNode(p)}
    </CursorRipples>
  )
}

export const saasMeshPair = definePair({
  baseId: "saas.1",
  label: "SaaS · Mesh",
  paperName: "MultiPointGradient",
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
    "radial-gradient(at 20% 20%, {{a}}, transparent 50%), radial-gradient(at 80% 15%, {{b}}, transparent 50%), radial-gradient(at 85% 85%, {{c}}, transparent 50%), radial-gradient(at 15% 85%, {{d}}, transparent 50%), linear-gradient({{e}}, {{e}})",
})
