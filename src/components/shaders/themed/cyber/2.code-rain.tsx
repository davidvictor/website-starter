"use client"

import { type ReactNode, useEffect, useState } from "react"
import { Ascii, FallingLines, Smoke } from "shaders/react"
import type { DevControlSchema } from "@/components/dev-panel/types"
import { getCharSet } from "../char-sets"
import { definePair } from "../define-pair"
import type { BuildPropsContext, ColorSlot } from "../types"

const SLOTS: Record<string, ColorSlot> = {
  a: { kind: "theme", token: "primary" },
}

const INTERACTIVE_EXTRA_SLOTS: Record<string, ColorSlot> = {
  b: { kind: "theme", token: "accent" },
}

const BASE_SCHEMA: DevControlSchema = {
  density: {
    type: "number",
    default: 28,
    min: 10,
    max: 40,
    step: 1,
    label: "columns",
  },
  speed: {
    type: "number",
    default: 0.8,
    min: 0,
    max: 2,
    step: 0.05,
    label: "speed",
  },
  trailLength: {
    type: "number",
    default: 0.65,
    min: 0.2,
    max: 1,
    step: 0.05,
    label: "trail",
  },
  strokeWidth: {
    type: "number",
    default: 0.7,
    min: 0.3,
    max: 1,
    step: 0.05,
    label: "stroke",
  },
  cellSize: {
    type: "number",
    default: 24,
    min: 16,
    max: 40,
    step: 1,
    label: "cell size",
  },
  gamma: {
    type: "number",
    default: 0.9,
    min: 0.5,
    max: 2,
    step: 0.05,
    label: "gamma",
  },
  charSet: {
    type: "select",
    default: "binary",
    options: ["binary", "hex", "katakana", "asciiArt"] as const,
    optionsLabels: {
      binary: "binary  (0 1)",
      hex: "hex  (0–F)",
      katakana: "katakana  (アイウエオ…)",
      asciiArt: "ascii-art  (#@%*+-: )",
    },
    label: "characters",
  },
}

const INTERACTIVE_SCHEMA: DevControlSchema = {
  cursorBrightness: {
    type: "number",
    default: 0.3,
    min: 0,
    max: 0.6,
    step: 0.05,
    label: "cursor brightness",
  },
  smokeRadius: {
    type: "number",
    default: 0.15,
    min: 0.02,
    max: 0.5,
    step: 0.01,
    label: "smoke radius",
  },
  smokeIntensity: {
    type: "number",
    default: 0.5,
    min: 0,
    max: 2,
    step: 0.05,
    label: "smoke influence",
  },
}

type Props = {
  ascii: { characters: string; cellSize: number; gamma: number }
  rain: {
    colorA: string
    speed: number
    density: number
    trailLength: number
    strokeWidth: number
  }
  cursor?: {
    brightness: number
    smokeColorA: string
    smokeColorB: string
    smokeRadius: number
    smokeIntensity: number
  }
}

function buildIdle({ colors, controls, perfMode }: BuildPropsContext): Props {
  const cellMul = perfMode === "reduced" ? 2 : 1
  const speedMul = perfMode === "reduced" ? 0.5 : 1
  return {
    ascii: {
      characters: getCharSet("cyber.2.idle", controls.charSet as string),
      cellSize: (controls.cellSize as number) * cellMul,
      gamma: controls.gamma as number,
    },
    rain: {
      colorA: colors.a,
      speed: (controls.speed as number) * speedMul,
      density: controls.density as number,
      trailLength: controls.trailLength as number,
      strokeWidth: controls.strokeWidth as number,
    },
  }
}

function buildInteractive(ctx: BuildPropsContext): Props {
  return {
    ...buildIdle(ctx),
    cursor: {
      brightness: ctx.controls.cursorBrightness as number,
      smokeColorA: ctx.colors.b ?? ctx.colors.a,
      smokeColorB: ctx.colors.a,
      smokeRadius: ctx.controls.smokeRadius as number,
      smokeIntensity: ctx.controls.smokeIntensity as number,
    },
  }
}

function renderIdle(props: unknown): ReactNode {
  const p = props as Props
  return (
    <Ascii
      characters={p.ascii.characters}
      fontFamily="VT323"
      cellSize={p.ascii.cellSize}
      spacing={1}
      gamma={p.ascii.gamma}
    >
      <FallingLines
        colorA={p.rain.colorA}
        colorB="transparent"
        angle={90}
        speed={p.rain.speed}
        speedVariance={0.5}
        density={p.rain.density}
        trailLength={p.rain.trailLength}
        strokeWidth={p.rain.strokeWidth}
        rounding={0.2}
        colorSpace="oklch"
      />
    </Ascii>
  )
}

/**
 * Interactive rain — cursor proximity brightens characters (lower gamma) and
 * a Smoke layer emits cyan vapor near the cursor. Smoothing 0.2 follows the
 * pro-note recommendation for cursor-driven prop mapping.
 */
function CodeRainInteractive({ p }: { p: Props }) {
  const [gamma, setGamma] = useState(p.ascii.gamma)

  useEffect(() => {
    let raf = 0
    let lastClient = { x: 0.5, y: 0.5 }
    const onMove = (e: PointerEvent) => {
      lastClient = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    const loop = () => {
      const dx = lastClient.x - 0.5
      const dy = lastClient.y - 0.5
      const dist = Math.sqrt(dx * dx + dy * dy)
      const t = Math.max(0, Math.min(1, 1 - dist * 2))
      const target = p.ascii.gamma - p.cursor!.brightness * t
      setGamma((g) => g + (target - g) * 0.2)
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener("pointermove", onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(raf)
    }
  }, [p.ascii.gamma, p.cursor])

  return (
    <>
      <Ascii
        characters={p.ascii.characters}
        fontFamily="VT323"
        cellSize={p.ascii.cellSize}
        spacing={1}
        gamma={gamma}
      >
        <FallingLines
          colorA={p.rain.colorA}
          colorB="transparent"
          angle={90}
          speed={p.rain.speed}
          speedVariance={0.5}
          density={p.rain.density}
          trailLength={p.rain.trailLength}
          strokeWidth={p.rain.strokeWidth}
          rounding={0.2}
          colorSpace="oklch"
        />
      </Ascii>
      <Smoke
        colorA={p.cursor!.smokeColorA}
        colorB={p.cursor!.smokeColorB}
        emitFrom={{ x: 0.5, y: 0.5 }}
        direction={0}
        speed={5}
        intensity={0.4}
        mouseInfluence={p.cursor!.smokeIntensity}
        mouseRadius={p.cursor!.smokeRadius}
        dissipation={0.4}
        detail={18}
      />
    </>
  )
}

function renderInteractive(props: unknown): ReactNode {
  return <CodeRainInteractive p={props as Props} />
}

export const cyberCodeRainPair = definePair({
  baseId: "cyber.2",
  label: "Cyber · Code Rain",
  paperName: "Ascii ← FallingLines",
  isAscii: true,
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
    "repeating-linear-gradient(180deg, transparent 0px, {{a}} 1px, transparent 4px), linear-gradient(180deg, var(--background) 0%, var(--foreground) 100%)",
})
