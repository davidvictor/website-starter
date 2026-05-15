import type { ReactNode } from "react"
import { FilmGrain, Liquify, Marble } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "background" },
  b: { kind: "theme", token: "muted-foreground" },
  c: { kind: "theme", token: "brand-accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  scale: {
    type: "number",
    default: 1.5,
    min: 0.5,
    max: 3,
    step: 0.05,
    label: "scale",
  },
  turbulence: {
    type: "number",
    default: 8,
    min: 0,
    max: 20,
    step: 0.5,
    label: "turbulence",
  },
  speed: {
    type: "number",
    default: 0.04,
    min: 0,
    max: 0.1,
    step: 0.005,
    label: "speed",
  },
  grainOverride: {
    type: "number",
    default: 0,
    min: 0,
    max: 0.4,
    step: 0.01,
    label: "grain (0 = auto)",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  liquifyIntensity: {
    type: "number",
    default: 4,
    min: 0,
    max: 20,
    step: 0.1,
    label: "liquify",
  },
  liquifyStiffness: {
    type: "number",
    default: 8,
    min: 1,
    max: 30,
    step: 0.5,
    label: "stiffness",
  },
}

function parseOklchL(value: string): number {
  const m = value.match(/oklch\(\s*([0-9.]+)/i)
  if (!m) return 0.5
  return Math.max(0, Math.min(1, parseFloat(m[1])))
}

function calibratedGrain(bgColor: string, override: number): number {
  if (override > 0) return override
  const l = parseOklchL(bgColor)
  return Math.max(0.05, Math.min(0.32, 0.32 - 0.27 * l))
}

type Props = {
  marble: {
    colorA: string
    colorB: string
    colorC: string
    scale: number
    turbulence: number
    speed: number
  }
  film: { strength: number }
  liquify?: { intensity: number; stiffness: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    marble: {
      colorA: colors.a,
      colorB: colors.b,
      colorC: colors.c,
      scale: controls.scale as number,
      turbulence: controls.turbulence as number,
      speed: (controls.speed as number) * speedMul,
    },
    film: {
      strength: calibratedGrain(colors.a, controls.grainOverride as number),
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    liquify: {
      intensity: ctx.controls.liquifyIntensity as number,
      stiffness: ctx.controls.liquifyStiffness as number,
    },
  }
}

function renderIdle(props: unknown): ReactNode {
  const p = props as Props
  return (
    <>
      <Marble
        colorA={p.marble.colorA}
        colorB={p.marble.colorB}
        colorC={p.marble.colorC}
        scale={p.marble.scale}
        turbulence={p.marble.turbulence}
        speed={p.marble.speed}
        colorSpace="oklch"
      />
      <FilmGrain strength={p.film.strength} bias={2} />
    </>
  )
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <>
      <Liquify
        intensity={p.liquify!.intensity}
        stiffness={p.liquify!.stiffness}
        damping={4}
        radius={0.6}
      >
        <Marble
          colorA={p.marble.colorA}
          colorB={p.marble.colorB}
          colorC={p.marble.colorC}
          scale={p.marble.scale}
          turbulence={p.marble.turbulence}
          speed={p.marble.speed}
          colorSpace="oklch"
        />
      </Liquify>
      <FilmGrain strength={p.film.strength} bias={2} />
    </>
  )
}

export const editorialMarblePair = definePair({
  baseId: "editorial.3",
  label: "Editorial · Marble",
  paperName: "Marble + FilmGrain",
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
    "radial-gradient(at 40% 60%, {{c}} 0%, transparent 35%), linear-gradient(135deg, {{a}} 0%, {{b}} 100%)",
})
