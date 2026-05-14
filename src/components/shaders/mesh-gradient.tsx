"use client"

import {
  MeshGradient as PaperMeshGradient,
  type MeshGradientProps,
} from "@paper-design/shaders-react"

const DEFAULT_COLORS = [
  "hsl(220 90% 56%)",
  "hsl(290 80% 60%)",
  "hsl(330 85% 60%)",
  "hsl(20 90% 60%)",
]

export function MeshGradient({
  colors = DEFAULT_COLORS,
  speed = 0.4,
  distortion = 0.85,
  swirl = 0.6,
  className,
  style,
  ...rest
}: Partial<MeshGradientProps>) {
  return (
    <PaperMeshGradient
      colors={colors}
      speed={speed}
      distortion={distortion}
      swirl={swirl}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
      {...rest}
    />
  )
}
