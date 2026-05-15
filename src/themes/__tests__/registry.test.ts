import { vi } from "vitest"

vi.mock("next/font/google", () => {
  const stub = () => ({
    className: "",
    style: { fontFamily: "stub" },
    variable: "--font-stub",
  })
  return {
    Geist: stub,
    Geist_Mono: stub,
    IBM_Plex_Mono: stub,
    IBM_Plex_Sans: stub,
    Instrument_Serif: stub,
    JetBrains_Mono: stub,
  }
})

import { describe, expect, it } from "vitest"

import { applyTheme, baseThemes } from "../registry"

describe("applyTheme", () => {
  it("emits html data attributes used by theme-aware utilities", () => {
    const theme = baseThemes[0]
    const el = {
      style: { setProperty: vi.fn() },
      dataset: {} as Record<string, string>,
      classList: { add: vi.fn(), remove: vi.fn() },
    } as unknown as HTMLElement

    applyTheme(el, theme, "light")

    expect(el.dataset.theme).toBe(theme.id)
    expect(el.dataset.accentUsage).toBe(theme.derivation.accentUsage)
  })
})
