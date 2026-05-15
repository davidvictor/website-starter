"use client"

import { ThemedShader } from "@/components/shaders/themed/themed-shader"

export default function ShadersExamplePage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Shader smoke test
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border">
          <ThemedShader id="editorial.1.idle" className="absolute inset-0" />
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-white">
            editorial.1.idle
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border">
          <ThemedShader id="editorial.1.interactive" className="absolute inset-0" />
          <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-[10px] text-white">
            editorial.1.interactive
          </span>
        </div>
      </div>
    </main>
  )
}
