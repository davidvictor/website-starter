import type { ReactNode } from "react"
import { Ascii, Liquify, Plasma } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "background" },
}

const BASE_SCHEMA: DevControlSchema = {
  cellSize: { type: "number", default: 26, min: 16, max: 50, step: 1, label: "cell size" },
  density: { type: "number", default: 2.5, min: 0, max: 4, step: 0.1, label: "density" },
  speed: { type: "number", default: 1.8, min: 0, max: 5, step: 0.1, label: "speed" },
  warp: { type: "number", default: 0.5, min: 0, max: 1, step: 0.01, label: "warp" },
  contrast: { type: "number", default: 1.4, min: 0, max: 3, step: 0.05, label: "contrast" },
  gamma: { type: "number", default: 1.4, min: 0.5, max: 3, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "blocks",
    options: ["blocks", "digits", "letters"] as const,
    optionsLabels: {
      blocks: "blocks  (█ ▓ ▒ ░ )",
      digits: "digits  (0–9)",
      letters: "letters  (MWHEX#-:.)",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  liquifyIntensity: { type: "number", default: 6, min: 0, max: 20, step: 0.1, label: "liquify" },
  liquifyStiffness: { type: "number", default: 4, min: 1, max: 30, step: 0.5, label: "stiffness" },
  liquifyDamping: { type: "number", default: 3, min: 0, max: 10, step: 0.1, label: "damping" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  plasma: { colorA: string; colorB: string; density: number; speed: number; warp: number; contrast: number }
  liquify?: { intensity: number; stiffness: number; damping: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("bold.2.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    plasma: {
      colorA: colors.a,
      colorB: colors.b,
      density: controls.density as number,
      speed: (controls.speed as number) * speedMul,
      warp: controls.warp as number,
      contrast: controls.contrast as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    liquify: {
      intensity: ctx.controls.liquifyIntensity as number,
      stiffness: ctx.controls.liquifyStiffness as number,
      damping: ctx.controls.liquifyDamping as number,
    },
  }
}

function plasmaNode(p: Props): ReactNode {
  return (
    <Plasma
      colorA={p.plasma.colorA}
      colorB={p.plasma.colorB}
      density={p.plasma.density}
      speed={p.plasma.speed}
      intensity={1.8}
      warp={p.plasma.warp}
      contrast={p.plasma.contrast}
      balance={55}
      colorSpace="oklch"
    />
  )
}

function asciiWrap(p: Props, child: ReactNode): ReactNode {
  return (
    <Ascii
      characters={p.ascii.characters}
      fontFamily="JetBrains Mono"
      cellSize={p.ascii.cellSize}
      spacing={1}
      gamma={p.ascii.gamma}
    >
      {child}
    </Ascii>
  )
}

function renderIdle(props: unknown): ReactNode {
  const p = props as Props
  return asciiWrap(p, plasmaNode(p))
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <Liquify
      intensity={p.liquify!.intensity}
      stiffness={p.liquify!.stiffness}
      damping={p.liquify!.damping}
      radius={0.8}
      edges="mirror"
    >
      {asciiWrap(p, plasmaNode(p))}
    </Liquify>
  )
}

export const boldAsciiPlasmaPair = definePair({
  baseId: "bold.2",
  label: "Bold · Ascii Plasma",
  paperName: "Ascii ← Plasma",
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
    "radial-gradient(circle at 50% 50%, {{a}} 0%, transparent 60%), linear-gradient(135deg, {{b}}, {{a}})",
})
