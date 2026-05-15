import type { ReactNode } from "react"
import { Ascii, CRTScreen, CursorTrail, FlowingGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "primary" },
  c: { kind: "theme", token: "accent" },
  d: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  gradientSpeed: {
    type: "number",
    default: 1,
    min: 0,
    max: 3,
    step: 0.05,
    label: "gradient speed",
  },
  gradientDistortion: {
    type: "number",
    default: 0.8,
    min: 0,
    max: 2,
    step: 0.05,
    label: "distortion",
  },
  cellSize: {
    type: "number",
    default: 22,
    min: 16,
    max: 40,
    step: 1,
    label: "cell size",
  },
  scanlineIntensity: {
    type: "number",
    default: 0.55,
    min: 0,
    max: 1,
    step: 0.05,
    label: "scanlines",
  },
  colorShift: {
    type: "number",
    default: 2.2,
    min: 0,
    max: 5,
    step: 0.1,
    label: "color shift",
  },
  vignetteRadius: {
    type: "number",
    default: 0.4,
    min: 0,
    max: 1,
    step: 0.05,
    label: "vignette",
  },
  gamma: {
    type: "number",
    default: 1.1,
    min: 0.5,
    max: 2,
    step: 0.05,
    label: "gamma",
  },
  charSet: {
    type: "select",
    default: "phosphor",
    options: ["phosphor", "loFi", "stark"] as const,
    optionsLabels: {
      phosphor: "phosphor  (@█▓▒░ )",
      loFi: "lo-fi  (█ ▒ ░ )",
      stark: "stark  (█  )",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  trailLength: {
    type: "number",
    default: 0.4,
    min: 0.1,
    max: 2,
    step: 0.05,
    label: "trail length",
  },
  trailRadius: {
    type: "number",
    default: 0.6,
    min: 0.5,
    max: 2,
    step: 0.05,
    label: "trail radius",
  },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  crt: { scanlineIntensity: number; colorShift: number; vignetteRadius: number }
  gradient: {
    colorA: string
    colorB: string
    colorC: string
    colorD: string
    speed: number
    distortion: number
  }
  trail?: { colorA: string; colorB: string; length: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("cyber.3.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    crt: {
      scanlineIntensity: controls.scanlineIntensity as number,
      colorShift: controls.colorShift as number,
      vignetteRadius: controls.vignetteRadius as number,
    },
    gradient: {
      colorA: colors.a,
      colorB: colors.b,
      colorC: colors.c,
      colorD: colors.d,
      speed: (controls.gradientSpeed as number) * speedMul,
      distortion: controls.gradientDistortion as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    trail: {
      colorA: ctx.colors.d,
      colorB: ctx.colors.b,
      length: ctx.controls.trailLength as number,
      radius: ctx.controls.trailRadius as number,
    },
  }
}

function gradientNode(p: Props): ReactNode {
  return (
    <FlowingGradient
      colorA={p.gradient.colorA}
      colorB={p.gradient.colorB}
      colorC={p.gradient.colorC}
      colorD={p.gradient.colorD}
      speed={p.gradient.speed}
      distortion={p.gradient.distortion}
      colorSpace="oklch"
    />
  )
}

function renderIdle(props: unknown): ReactNode {
  const p = props as Props
  return (
    <CRTScreen
      pixelSize={120}
      colorShift={p.crt.colorShift}
      scanlineIntensity={p.crt.scanlineIntensity}
      scanlineFrequency={400}
      brightness={1.15}
      contrast={1.35}
      vignetteIntensity={0.7}
      vignetteRadius={p.crt.vignetteRadius}
    >
      <Ascii
        characters={p.ascii.characters}
        fontFamily="JetBrains Mono"
        cellSize={p.ascii.cellSize}
        spacing={1}
        gamma={p.ascii.gamma}
      >
        {gradientNode(p)}
      </Ascii>
    </CRTScreen>
  )
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <CRTScreen
      pixelSize={120}
      colorShift={p.crt.colorShift}
      scanlineIntensity={p.crt.scanlineIntensity}
      scanlineFrequency={400}
      brightness={1.15}
      contrast={1.35}
      vignetteIntensity={0.7}
      vignetteRadius={p.crt.vignetteRadius}
    >
      <Ascii
        characters={p.ascii.characters}
        fontFamily="JetBrains Mono"
        cellSize={p.ascii.cellSize}
        spacing={1}
        gamma={p.ascii.gamma}
      >
        {gradientNode(p)}
        <CursorTrail
          colorA={p.trail!.colorA}
          colorB={p.trail!.colorB}
          radius={p.trail!.radius}
          length={p.trail!.length}
          shrink={1}
          colorSpace="oklch"
        />
      </Ascii>
    </CRTScreen>
  )
}

export const cyberPhosphorConsolePair = definePair({
  baseId: "cyber.3",
  label: "Cyber · Phosphor Console",
  paperName: "CRTScreen ← Ascii ← FlowingGradient",
  isAscii: true,
  slots: SLOTS,
  baseSchema: BASE_SCHEMA,
  interactiveSchema: INTERACTIVE_SCHEMA,
  schemaVersion: 1,
  buildIdle,
  renderIdle,
  buildInteractive,
  renderInteractive,
  fallbackBackground:
    "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%), repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px), linear-gradient(90deg, {{a}}, {{b}})",
})
