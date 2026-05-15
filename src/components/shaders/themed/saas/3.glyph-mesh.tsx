import type { ReactNode } from "react"
import { Ascii, CursorRipples, MultiPointGradient } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
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
  cellSize: {
    type: "number",
    default: 38,
    min: 24,
    max: 60,
    step: 1,
    label: "cell size",
  },
  smoothness: {
    type: "number",
    default: 2.5,
    min: 0,
    max: 5,
    step: 0.05,
    label: "smoothness",
  },
  gamma: {
    type: "number",
    default: 1,
    min: 0.5,
    max: 2,
    step: 0.05,
    label: "gamma",
  },
  charSet: {
    type: "select",
    default: "data",
    options: ["data", "dots", "blocks"] as const,
    optionsLabels: {
      data: "data  (. + × ▪ █)",
      dots: "dots  (· • ◦ ●)",
      blocks: "blocks  (░ ▒ ▓ █)",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  rippleIntensity: {
    type: "number",
    default: 4,
    min: 0,
    max: 20,
    step: 0.1,
    label: "ripple",
  },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  mesh: {
    a: string
    b: string
    c: string
    d: string
    e: string
    smoothness: number
  }
  ripple?: { intensity: number }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  return {
    ascii: {
      characters: getCharSet("saas.3.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    mesh: {
      a: colors.a,
      b: colors.b,
      c: colors.c,
      d: colors.d,
      e: colors.e,
      smoothness: controls.smoothness as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    ripple: { intensity: ctx.controls.rippleIntensity as number },
  }
}

function meshNode(p: Props): ReactNode {
  return (
    <MultiPointGradient
      colorA={p.mesh.a}
      positionA={{ x: 0.2, y: 0.2 }}
      colorB={p.mesh.b}
      positionB={{ x: 0.8, y: 0.15 }}
      colorC={p.mesh.c}
      positionC={{ x: 0.85, y: 0.85 }}
      colorD={p.mesh.d}
      positionD={{ x: 0.15, y: 0.85 }}
      colorE={p.mesh.e}
      positionE={{ x: 0.5, y: 0.5 }}
      smoothness={p.mesh.smoothness}
    />
  )
}

function asciiNode(p: Props, child: ReactNode): ReactNode {
  return (
    <Ascii
      characters={p.ascii.characters}
      fontFamily="Geist Mono"
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
  return asciiNode(p, meshNode(p))
}

function renderInteractive(props: unknown): ReactNode {
  const p = props as Props
  return (
    <CursorRipples
      intensity={p.ripple!.intensity}
      decay={10}
      radius={0.5}
      chromaticSplit={0}
    >
      {asciiNode(p, meshNode(p))}
    </CursorRipples>
  )
}

export const saasGlyphMeshPair = definePair({
  baseId: "saas.3",
  label: "SaaS · Glyph Mesh",
  paperName: "Ascii ← MultiPointGradient",
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
    "radial-gradient(at 20% 20%, {{a}}, transparent 50%), radial-gradient(at 80% 15%, {{b}}, transparent 50%), radial-gradient(at 85% 85%, {{c}}, transparent 50%), radial-gradient(at 15% 85%, {{d}}, transparent 50%), linear-gradient({{e}}, {{e}})",
})
