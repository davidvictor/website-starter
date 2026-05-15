import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"

export const runtime = "edge"
export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Default OG image — site name on a static gradient. v1 limitation: this
 * cannot read live theme CSS variables at edge render time, so the
 * gradient is a representative SaaS-preset choice. Per-page themed OG
 * is future work.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        padding: "80px",
        background:
          "linear-gradient(135deg, oklch(0.42 0.18 250) 0%, oklch(0.55 0.21 310) 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.04em" }}>
        {siteConfig.name}
      </div>
      <div
        style={{
          fontSize: 32,
          marginTop: 16,
          opacity: 0.85,
          maxWidth: "80%",
        }}
      >
        {siteConfig.description}
      </div>
    </div>,
    { ...size }
  )
}
