"use client"

import { useEffect, useState } from "react"
import { useDevPanel } from "@/components/dev-panel"
import { useShouldReduceMacro } from "@/components/motion/use-should-reduce-macro"
import type { PerfMode, Variant } from "./types"

let webgl2Cached: boolean | null = null

function detectWebGL2(): boolean {
  if (webgl2Cached !== null) return webgl2Cached
  if (typeof document === "undefined") return false
  try {
    const c = document.createElement("canvas")
    webgl2Cached = !!c.getContext("webgl2")
  } catch {
    webgl2Cached = false
  }
  return webgl2Cached
}

export function useShaderPerfMode(_variant: Variant): PerfMode {
  const osReduced = useShouldReduceMacro()
  const { forceReducedMotion } = useDevPanel()
  const [hasGL2, setHasGL2] = useState(true) // optimistic; corrected post-mount

  useEffect(() => {
    setHasGL2(detectWebGL2())
  }, [])

  if (!hasGL2) return "fallback"
  if (osReduced || forceReducedMotion) return "reduced"
  return "full"
}
