"use client"

import { useEffect, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Moon,
  RotateCcw,
  Sun,
  SunMoon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import {
  ACCENT_ANCHORS,
  hexToOklch,
  oklchToHex,
  type AccentAnchor,
  vibrancyToLC,
} from "@/lib/color"
import { MONO_FONTS, SANS_FONTS, type FontKey } from "@/lib/fonts"
import { PRESETS } from "@/themes/presets"
import { useTheme } from "@/providers/theme-provider"
import type {
  AccentInput,
  ColorInput,
  DerivationProfile,
  PresetId,
} from "@/themes/controller-types"
import { cn } from "@/lib/utils"

const PRESET_ORDER: Exclude<PresetId, "custom">[] = [
  "editorial",
  "saas",
  "bold",
  "cyber",
]

const ANCHOR_OPTIONS: { label: string; value: AccentAnchor }[] = [
  { label: "Free", value: "free" },
  { label: "+30°", value: "analogous" },
  { label: "+120°", value: "triadic" },
  { label: "+180°", value: "complementary" },
  { label: "−60°", value: "split" },
]

const CONTRAST_OPTIONS: DerivationProfile["contrast"][] = [
  "low",
  "medium",
  "high",
]

const ACCENT_USAGE_OPTIONS: DerivationProfile["accentUsage"][] = [
  "rare",
  "primary-only",
  "broad",
  "maximal",
]

export function ThemesTab() {
  const {
    themes,
    theme,
    themeId,
    setThemeId,
    mode,
    setMode,
    resolvedMode,
    applyPreset,
    setPrimary,
    setAccent,
    setWarmth,
    patchDerivation,
    resetTheme,
    isOverridden,
  } = useTheme()

  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(theme, null, 2))
      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 1500)
    } catch {
      /* clipboard denied */
    }
  }

  const modeOptions: {
    value: "light" | "dark" | "system"
    icon: typeof Sun
    label: string
  }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: SunMoon, label: "System" },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* THEME SWITCHER */}
      <section className="flex flex-col gap-2">
        <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          theme
        </Label>
        <div className="flex flex-col gap-1.5">
          {themes.map((t) => {
            const active = t.id === themeId
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left transition-colors",
                  active
                    ? "border-foreground/30 bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {t.name}
                    {isOverridden && active && (
                      <span className="rounded bg-amber-500/15 px-1 py-0.5 font-mono text-[9px] text-amber-600 dark:text-amber-400">
                        EDITED
                      </span>
                    )}
                  </span>
                </div>
                <ThemePreviewSwatches themeId={t.id} mode={resolvedMode} />
              </button>
            )
          })}
        </div>
      </section>

      <Separator />

      {/* PRESETS */}
      <section className="flex flex-col gap-2">
        <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          preset · stamps inputs + derivation
        </Label>
        <div className="grid grid-cols-4 gap-1">
          {PRESET_ORDER.map((id) => {
            const active = theme.presetId === id && !isOverridden
            return (
              <button
                type="button"
                key={id}
                onClick={() => applyPreset(id)}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-xs font-medium capitalize transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-muted"
                )}
              >
                {PRESETS[id].name}
              </button>
            )
          })}
        </div>
        {theme.description && (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {theme.description}
          </p>
        )}
      </section>

      <Separator />

      {/* MODE */}
      <section className="flex flex-col gap-2">
        <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          mode
        </Label>
        <div className="grid grid-cols-3 gap-1">
          {modeOptions.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              type="button"
              variant={mode === value ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(value)}
              className="h-7 text-xs"
            >
              <Icon className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </section>

      <Separator />

      {/* PRIMARY */}
      <ColorControl
        label="primary"
        value={theme.inputs.primary}
        onChange={setPrimary}
      />

      <Separator />

      {/* ACCENT */}
      <AccentControl
        value={theme.inputs.accent}
        primaryHue={theme.inputs.primary.hue}
        onChange={setAccent}
      />

      <Separator />

      {/* WARMTH */}
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            neutral warmth
          </Label>
          <span className="font-mono text-[10px] text-muted-foreground">
            {theme.inputs.warmth >= 0 ? "+" : ""}
            {theme.inputs.warmth.toFixed(2)}
          </span>
        </div>
        <Slider
          min={-1}
          max={1}
          step={0.01}
          value={[theme.inputs.warmth]}
          onValueChange={(v) => {
            const value = Array.isArray(v) ? v[0] : v
            if (typeof value === "number") setWarmth(value)
          }}
          className="py-1"
        />
        <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
          <span>cool</span>
          <span>neutral</span>
          <span>warm</span>
        </div>
      </section>

      <Separator />

      {/* ADVANCED */}
      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground"
        >
          <span>advanced</span>
          {advancedOpen ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </button>

        {advancedOpen && (
          <div className="flex flex-col gap-4 rounded-md border border-border bg-muted/20 p-3">
            <DerivationControl
              label="chroma boost"
              value={theme.derivation.chromaBoost}
              onChange={(v) => patchDerivation({ chromaBoost: v })}
              min={0.4}
              max={1.6}
              step={0.05}
              suffix="×"
            />
            <DerivationControl
              label="semantic intensity"
              value={theme.derivation.semanticIntensity}
              onChange={(v) =>
                patchDerivation({ semanticIntensity: v })
              }
              min={0.4}
              max={1.6}
              step={0.05}
              suffix="×"
            />
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] text-muted-foreground">
                contrast
              </Label>
              <div className="grid grid-cols-3 gap-1">
                {CONTRAST_OPTIONS.map((c) => (
                  <Button
                    key={c}
                    type="button"
                    variant={
                      theme.derivation.contrast === c ? "default" : "outline"
                    }
                    size="xs"
                    onClick={() => patchDerivation({ contrast: c })}
                    className="text-[10px] capitalize"
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] text-muted-foreground">
                accent usage
              </Label>
              <div className="grid grid-cols-2 gap-1">
                {ACCENT_USAGE_OPTIONS.map((u) => (
                  <Button
                    key={u}
                    type="button"
                    variant={
                      theme.derivation.accentUsage === u
                        ? "default"
                        : "outline"
                    }
                    size="xs"
                    onClick={() => patchDerivation({ accentUsage: u })}
                    className="text-[10px]"
                  >
                    {u}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] text-muted-foreground">
                radius
              </Label>
              <Input
                value={theme.derivation.radius}
                onChange={(e) =>
                  patchDerivation({ radius: e.target.value })
                }
                className="h-7 font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] text-muted-foreground">
                fonts
              </Label>
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
                <span className="text-xs text-muted-foreground">sans</span>
                <FontSelect
                  value={theme.derivation.fonts.sans}
                  options={SANS_FONTS}
                  onChange={(v) =>
                    patchDerivation({
                      fonts: { ...theme.derivation.fonts, sans: v },
                    })
                  }
                />
                <span className="text-xs text-muted-foreground">heading</span>
                <FontSelect
                  value={theme.derivation.fonts.heading}
                  options={SANS_FONTS}
                  onChange={(v) =>
                    patchDerivation({
                      fonts: { ...theme.derivation.fonts, heading: v },
                    })
                  }
                />
                <span className="text-xs text-muted-foreground">mono</span>
                <FontSelect
                  value={theme.derivation.fonts.mono}
                  options={MONO_FONTS}
                  onChange={(v) =>
                    patchDerivation({
                      fonts: { ...theme.derivation.fonts, mono: v },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* ACTIONS */}
      <section className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 flex-1 text-xs"
          onClick={copyJson}
        >
          <Copy className="size-3.5" />
          {copyState === "copied" ? "Copied" : "Copy JSON"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          disabled={!isOverridden}
          onClick={resetTheme}
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </section>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Edits live in localStorage. Copy JSON and paste into{" "}
        <code className="font-mono">src/themes/registry.json</code> to persist
        across sessions.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                       */
/* ------------------------------------------------------------------ */

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: ColorInput
  onChange: (next: ColorInput) => void
}) {
  const oklch = vibrancyToLC(value.vibrancy)
  const hex = oklchToHex({ l: oklch.l, c: oklch.c, h: value.hue })
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </Label>
        <span className="flex items-center gap-1.5">
          <span
            className="size-4 rounded border border-border"
            style={{ background: hex }}
          />
          <HexInput value={hex} hue={value.hue} onChange={onChange} />
        </span>
      </div>
      <HueRing
        value={value.hue}
        onChange={(hue) => onChange({ ...value, hue })}
      />
      <SliderRow
        label="vibrancy"
        value={value.vibrancy}
        onChange={(v) => onChange({ ...value, vibrancy: v })}
        min={0}
        max={100}
        step={1}
      />
    </section>
  )
}

function AccentControl({
  value,
  primaryHue,
  onChange,
}: {
  value: AccentInput
  primaryHue: number
  onChange: (next: AccentInput) => void
}) {
  const oklch = vibrancyToLC(value.vibrancy)
  const effectiveHue =
    value.anchor === "free"
      ? value.hue
      : (((primaryHue + (ACCENT_ANCHORS[value.anchor] ?? 0)) % 360) + 360) %
        360
  const hex = oklchToHex({ l: oklch.l, c: oklch.c, h: effectiveHue })

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          accent
        </Label>
        <span className="flex items-center gap-1.5">
          <span
            className="size-4 rounded border border-border"
            style={{ background: hex }}
          />
          <HexInput
            value={hex}
            hue={value.hue}
            onChange={(next) =>
              onChange({
                ...value,
                ...next,
                anchor: "free", // pasting a hex breaks any anchor lock
              })
            }
          />
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {ANCHOR_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={value.anchor === opt.value ? "default" : "outline"}
            size="xs"
            onClick={() => onChange({ ...value, anchor: opt.value })}
            className="text-[10px]"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <HueRing
        value={effectiveHue}
        onChange={(hue) => onChange({ ...value, hue, anchor: "free" })}
        dimmed={value.anchor !== "free"}
      />
      <SliderRow
        label="vibrancy"
        value={value.vibrancy}
        onChange={(v) => onChange({ ...value, vibrancy: v })}
        min={0}
        max={100}
        step={1}
      />
    </section>
  )
}

function HueRing({
  value,
  onChange,
  dimmed = false,
}: {
  value: number
  onChange: (hue: number) => void
  dimmed?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "relative h-3 w-full rounded-full",
          dimmed && "opacity-50"
        )}
        style={{
          background:
            "linear-gradient(to right, oklch(0.65 0.18 0), oklch(0.65 0.18 60), oklch(0.65 0.18 120), oklch(0.65 0.18 180), oklch(0.65 0.18 240), oklch(0.65 0.18 300), oklch(0.65 0.18 360))",
        }}
      >
        <input
          type="range"
          min={0}
          max={359}
          step={1}
          value={Math.round(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={dimmed}
          className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent"
          style={{
            // Show thumb only
            WebkitAppearance: "none",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background ring-1 ring-foreground/40 shadow"
          style={{ left: `${(value / 359) * 100}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>hue · {Math.round(value)}°</span>
      </div>
    </div>
  )
}

function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => {
          const n = Array.isArray(v) ? v[0] : v
          if (typeof n === "number") onChange(n)
        }}
      />
    </div>
  )
}

function HexInput({
  value,
  hue,
  onChange,
}: {
  value: string
  hue: number
  onChange: (next: { hue: number; vibrancy: number }) => void
}) {
  const [draft, setDraft] = useState(value)
  useEffect(() => {
    setDraft(value)
  }, [value])

  function commit(next: string) {
    setDraft(next)
    if (!/^#?[0-9a-f]{6}$/i.test(next)) return
    const parsed = hexToOklch(next)
    // Convert (L, C) back to vibrancy via inverse curve approx.
    const c = parsed.c
    const t = Math.max(0, Math.min(1, (c - 0.015) / 0.21))
    const vibrancy = Math.round(Math.pow(t, 1 / 0.85) * 100)
    onChange({
      hue: Math.round(parsed.h),
      vibrancy,
    })
    // suppress unused-warning by referencing hue (we may want it later)
    void hue
  }

  return (
    <input
      value={draft}
      onChange={(e) => commit(e.target.value)}
      className="h-5 w-[72px] rounded border border-border bg-background px-1.5 font-mono text-[10px] outline-none focus:border-foreground"
    />
  )
}

function DerivationControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">
          {value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => {
          const n = Array.isArray(v) ? v[0] : v
          if (typeof n === "number") onChange(n)
        }}
      />
    </div>
  )
}

function FontSelect({
  value,
  options,
  onChange,
}: {
  value: FontKey
  options: readonly FontKey[]
  onChange: (v: FontKey) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (typeof v === "string") onChange(v as FontKey)
      }}
    >
      <SelectTrigger className="h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-xs">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Read the current theme's pre-derived swatches by deriving them
 * synchronously for a target theme id (used in the theme switcher list).
 */
function ThemePreviewSwatches({
  themeId,
  mode,
}: {
  themeId: string
  mode: "light" | "dark"
}) {
  const { themes } = useTheme()
  const theme = themes.find((t) => t.id === themeId)
  if (!theme) return null

  // Compute swatches inline from the theme inputs — no need to re-derive
  // every token. We approximate using the controller inputs directly.
  const { primary, accent } = theme.inputs
  const primaryHex = oklchToHex({
    ...vibrancyToLC(primary.vibrancy),
    h: primary.hue,
  })
  const accentHex = oklchToHex({
    ...vibrancyToLC(accent.vibrancy),
    h:
      accent.anchor === "free"
        ? accent.hue
        : (((primary.hue + (ACCENT_ANCHORS[accent.anchor] ?? 0)) % 360) +
            360) %
          360,
  })
  const bgHex = mode === "dark" ? "#181818" : "#fafafa"
  const fgHex = mode === "dark" ? "#fafafa" : "#181818"

  return (
    <div className="flex shrink-0 gap-0.5">
      {[bgHex, fgHex, primaryHex, accentHex].map((color, i) => (
        <span
          key={i}
          className="size-3 rounded-full border border-border"
          style={{ background: color }}
        />
      ))}
    </div>
  )
}
