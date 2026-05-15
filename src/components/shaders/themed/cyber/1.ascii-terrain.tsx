import type { ReactNode } from "react"
import { Ascii, GridDistortion, Voronoi } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
  b: { kind: "theme", token: "accent" },
  c: { kind: "theme", token: "background" },
}

const BASE_SCHEMA: DevControlSchema = {
  cellSize: { type: "number", default: 20, min: 12, max: 36, step: 1, label: "cell size" },
  voronoiScale: { type: "number", default: 8, min: 2, max: 15, step: 0.5, label: "scale" },
  voronoiSpeed: { type: "number", default: 0.4, min: 0, max: 2, step: 0.05, label: "speed" },
  gamma: { type: "number", default: 1, min: 0.5, max: 2, step: 0.05, label: "gamma" },
  charSet: {
    type: "select",
    default: "density",
    options: ["density", "sparse", "blocks"] as const,
    optionsLabels: {
      density: "density  (#@%*+-: )",
      sparse: "sparse  (. : ;)",
      blocks: "blocks  (█ ▓ ▒ ░)",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  distortionIntensity: { type: "number", default: 1.2, min: 0, max: 5, step: 0.05, label: "distortion" },
  distortionRadius: { type: "number", default: 1.2, min: 0, max: 3, step: 0.1, label: "radius" },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  voronoi: { colorA: string; colorB: string; colorBorder: string; scale: number; speed: number }
  distortion?: { intensity: number; radius: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("cyber.1.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    voronoi: {
      colorA: colors.a,
      colorB: colors.b,
      colorBorder: colors.c,
      scale: controls.voronoiScale as number,
      speed: (controls.voronoiSpeed as number) * speedMul,
    },
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

function voronoiNode(p: Props): ReactNode {
  return (
    <Voronoi
      colorA={p.voronoi.colorA}
      colorB={p.voronoi.colorB}
      colorBorder={p.voronoi.colorBorder}
      scale={p.voronoi.scale}
      speed={p.voronoi.speed}
      edgeIntensity={0.6}
      edgeSoftness={0.04}
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
  return asciiWrap(p, voronoiNode(p))
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <GridDistortion
      intensity={p.distortion!.intensity}
      decay={2.5}
      radius={p.distortion!.radius}
      gridSize={48}
      edges="wrap"
    >
      {asciiWrap(p, voronoiNode(p))}
    </GridDistortion>
  )
}

export const cyberAsciiTerrainPair = definePair({
  baseId: "cyber.1",
  label: "Cyber · Ascii Terrain",
  paperName: "Ascii ← Voronoi",
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
    "radial-gradient(at 30% 30%, {{a}}, transparent 40%), radial-gradient(at 70% 70%, {{b}}, transparent 40%), linear-gradient(180deg, {{c}}, #000)",
})
