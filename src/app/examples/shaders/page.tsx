"use client"

import { useState } from "react"

import { GrainGradient } from "@/components/shaders/grain-gradient"
import { MeshGradient } from "@/components/shaders/mesh-gradient"
import {
  ControlBoolean,
  ControlColor,
  ControlNumber,
  FloatingControls,
} from "@/components/dev-panel"

export default function ShadersExamplePage() {
  const [speed, setSpeed] = useState(0.4)
  const [distortion, setDistortion] = useState(0.85)
  const [swirl, setSwirl] = useState(0.45)
  const [color1, setColor1] = useState("#3b82f6")
  const [color2, setColor2] = useState("#a855f7")
  const [color3, setColor3] = useState("#f97316")
  const [showGrain, setShowGrain] = useState(true)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-24">
      <header className="flex flex-col gap-2">
        <p className="text-xs tracking-wider text-muted-foreground uppercase">
          /examples/shaders
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Paper Design shaders
        </h1>
        <p className="text-muted-foreground">
          Floating controls in the bottom-left tweak the WebGL canvas in real
          time. Open the dev panel (
          <kbd className="rounded border border-border bg-muted px-1 font-mono text-xs">
            ~
          </kbd>
          ) for theme + global controls.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-tight">Mesh gradient</h2>
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border">
          <MeshGradient
            colors={[color1, color2, color3]}
            speed={speed}
            distortion={distortion}
            swirl={swirl}
          />
        </div>
      </section>

      {showGrain && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium tracking-tight">Grain gradient</h2>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border">
            <GrainGradient
              colors={[color1, color2, color3]}
              speed={speed * 0.8}
            />
          </div>
        </section>
      )}

      <FloatingControls title="shader" position="bottom-left">
        <ControlNumber
          label="speed"
          value={speed}
          onChange={setSpeed}
          min={0}
          max={2}
          step={0.01}
        />
        <ControlNumber
          label="distortion"
          value={distortion}
          onChange={setDistortion}
          min={0}
          max={2}
          step={0.01}
        />
        <ControlNumber
          label="swirl"
          value={swirl}
          onChange={setSwirl}
          min={0}
          max={1.5}
          step={0.01}
        />
        <ControlColor label="color 1" value={color1} onChange={setColor1} />
        <ControlColor label="color 2" value={color2} onChange={setColor2} />
        <ControlColor label="color 3" value={color3} onChange={setColor3} />
        <ControlBoolean
          label="show grain"
          value={showGrain}
          onChange={setShowGrain}
        />
      </FloatingControls>
    </main>
  )
}
