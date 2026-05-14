"use client"

import {
  type GrainGradientProps,
  GrainGradient as PaperGrainGradient,
} from "@paper-design/shaders-react"

export function GrainGradient({
  colors = ["hsl(250 90% 60%)", "hsl(190 85% 60%)", "hsl(330 80% 65%)"],
  speed = 0.5,
  intensity = 0.6,
  noise = 0.4,
  className,
  style,
  ...rest
}: Partial<GrainGradientProps>) {
  return (
    <PaperGrainGradient
      colors={colors}
      speed={speed}
      intensity={intensity}
      noise={noise}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
      {...rest}
    />
  )
}
