"use client"

import {
  ChevronDown,
  Copy,
  Moon,
  RotateCcw,
  Sun,
  SunMoon,
  Trash2,
  Type,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { IconMorph } from "@/components/motion/icon-morph"
import { Press } from "@/components/motion/press"
import { useConcentric } from "@/components/motion/use-concentric"
import { SHADER_IDS } from "@/components/shaders/themed/registry"
import { clearAllShaderOverrides } from "@/components/shaders/themed/use-shader-overrides"
import { Button } from "@/components/ui/button"
import { FontPicker } from "@/components/ui/font-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ACCENT_ANCHORS,
  type AccentAnchor,
  hexToOklch,
  oklchToHex,
  vibrancyToLC,
  warmthToNeutral,
} from "@/lib/color"
import {
  type FontKey,
  fontLabel,
  fontSetsForVibe,
  loadFontIfRemote,
  resolveFontFamily,
} from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { useTheme } from "@/providers/theme-provider"
import type { AccentInput, ColorInput } from "@/themes/controller-types"
import {
  ACCENT_USAGE_LEVELS,
  CONTRAST_LEVELS,
  ROUTE_TRANSITION_MODES,
} from "@/themes/derivation-axes"
import { presetIds, presetsById } from "@/themes/registry"

const ANCHOR_OPTIONS: { label: string; value: AccentAnchor }[] = [
  { label: "Free", value: "free" },
  { label: "+30°", value: "analogous" },
  { label: "+120°", value: "triadic" },
  { label: "+180°", value: "complementary" },
  { label: "−60°", value: "split" },
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
    clearAll,
    isOverridden,
  } = useTheme()

  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const [confirmingClear, setConfirmingClear] = useState(false)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(theme, null, 2))
      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 1500)
    } catch {
      /* clipboard denied */
    }
  }

  function handleClearClick() {
    if (!confirmingClear) {
      setConfirmingClear(true)
      if (clearTimer.current) clearTimeout(clearTimer.current)
      clearTimer.current = setTimeout(() => setConfirmingClear(false), 2500)
      return
    }
    if (clearTimer.current) clearTimeout(clearTimer.current)
    setConfirmingClear(false)
    clearAll()
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

  // Curated font sets matching the active preset's vibe — falls back
  // to the full catalog when nothing matches.
  const vibeKey = theme.presetId === "custom" ? "saas" : theme.presetId
  const activeFontSets = fontSetsForVibe(vibeKey)

  return (
    <div className="flex flex-col gap-4">
      {/* THEME SWITCHER */}
      <Section label="theme" sublabel="palette + typography">
        <div className="flex flex-col gap-1">
          {themes.map((t) => {
            const active = t.id === themeId
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left transition-colors cursor-pointer",
                  active
                    ? "border-foreground/30 bg-muted"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-sm font-medium">{t.name}</span>
                  {isOverridden && active && (
                    <span className="rounded bg-amber-500/15 px-1 py-0.5 font-mono text-[9px] text-amber-600 dark:text-amber-400">
                      EDITED
                    </span>
                  )}
                </div>
                <ThemePreviewSwatches themeId={t.id} mode={resolvedMode} />
              </button>
            )
          })}
        </div>
      </Section>

      <Separator />

      {/* PRESETS */}
      <Section
        label="preset"
        sublabel="stamps inputs + derivation onto the active theme"
      >
        <div className="flex flex-wrap gap-1">
          {presetIds.map((id) => {
            const active = theme.presetId === id && !isOverridden
            const preset = presetsById[id]
            return (
              <Press
                key={id}
                render={
                  <button
                    type="button"
                    onClick={() => applyPreset(id)}
                    className={cn(
                      "h-7 flex-1 min-w-[3.5rem] rounded-md border text-xs font-medium capitalize transition-colors cursor-pointer",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {preset?.name ?? id}
                  </button>
                }
              />
            )
          })}
        </div>
        {theme.description && (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {theme.description}
          </p>
        )}
      </Section>

      <Separator />

      {/* MODE */}
      <Section
        label="mode"
        trailing={
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            resolved
            <IconMorph
              from={Sun}
              to={Moon}
              active={resolvedMode === "dark"}
              size={12}
            />
          </span>
        }
      >
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
      </Section>

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
      <WarmthControl
        value={theme.inputs.warmth}
        primaryHue={theme.inputs.primary.hue}
        onChange={setWarmth}
      />

      <Separator />

      {/* TYPOGRAPHY */}
      <TypographyControl
        sans={theme.derivation.fonts.sans}
        heading={theme.derivation.fonts.heading}
        mono={theme.derivation.fonts.mono}
        presetSets={activeFontSets}
        onPatch={(patch) =>
          patchDerivation({
            fonts: { ...theme.derivation.fonts, ...patch },
          })
        }
      />

      <Separator />

      {/* ADVANCED */}
      <DisclosureSection label="advanced">
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
          onChange={(v) => patchDerivation({ semanticIntensity: v })}
          min={0.4}
          max={1.6}
          step={0.05}
          suffix="×"
        />
        <div className="flex flex-col gap-1">
          <SubLabel>contrast</SubLabel>
          <div className="flex flex-wrap gap-1">
            {CONTRAST_LEVELS.map((c) => (
              <Button
                key={c.id}
                type="button"
                variant={
                  theme.derivation.contrast === c.id ? "default" : "outline"
                }
                size="xs"
                onClick={() => patchDerivation({ contrast: c.id })}
                className="flex-1 min-w-[3.5rem] text-[10px]"
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <SubLabel>accent usage</SubLabel>
          <div className="grid grid-cols-2 gap-1">
            {ACCENT_USAGE_LEVELS.map((u) => (
              <Button
                key={u.id}
                type="button"
                variant={
                  theme.derivation.accentUsage === u.id ? "default" : "outline"
                }
                size="xs"
                onClick={() => patchDerivation({ accentUsage: u.id })}
                className="text-[10px]"
                title={u.description}
              >
                {u.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <SubLabel>radius</SubLabel>
          <Input
            value={theme.derivation.radius}
            onChange={(e) => patchDerivation({ radius: e.target.value })}
            className="h-7 font-mono text-xs"
          />
        </div>
        <div className="flex flex-col gap-1">
          <SubLabel>route transition</SubLabel>
          <div className="flex flex-wrap gap-1">
            {ROUTE_TRANSITION_MODES.map((m) => (
              <Button
                key={m.id}
                size="xs"
                variant={
                  (theme.derivation.routeTransition ?? "vertical-translate") ===
                  m.id
                    ? "default"
                    : "outline"
                }
                className="h-6 flex-1 min-w-[5rem] text-[10px]"
                onClick={() => patchDerivation({ routeTransition: m.id })}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>
      </DisclosureSection>

      <Separator />

      {/* ACTIONS */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
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
        </div>
        <Button
          type="button"
          size="sm"
          variant={confirmingClear ? "destructive" : "ghost"}
          className="h-7 text-xs"
          onClick={handleClearClick}
        >
          <Trash2 className="size-3.5" />
          {confirmingClear
            ? "Click again to clear all local state"
            : "Clear localStorage"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => clearAllShaderOverrides(SHADER_IDS)}
        >
          <RotateCcw className="size-3.5" />
          Reset all 24 shaders
        </Button>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Edits persist to <code className="font-mono">localStorage</code>. Copy
          JSON into <code className="font-mono">themes/registry.json</code> to
          ship across sessions.
        </p>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                    */
/* ------------------------------------------------------------------ */

function Section({
  label,
  sublabel,
  trailing,
  children,
}: {
  label: string
  sublabel?: string
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <Label className="flex items-baseline justify-between gap-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        <span className="flex items-baseline gap-2">
          <span>{label}</span>
          {sublabel && (
            <span className="font-mono text-[9px] normal-case tracking-normal text-muted-foreground/60">
              {sublabel}
            </span>
          )}
        </span>
        {trailing}
      </Label>
      {children}
    </section>
  )
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
      {children}
    </span>
  )
}

function DisclosureSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  // Outer rounded-md (8px) + p-2.5 (10px) → inner content should clip
  // close to flush. `useConcentric` returns rounded-none here.
  const innerRadius = useConcentric("rounded-md", 10)
  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase transition-colors cursor-pointer hover:text-foreground"
      >
        <span>{label}</span>
        <ChevronDown
          className={cn("size-3 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-md border border-border bg-muted/20 p-2.5",
            `[&>*:where(.concentric-inner)]:${innerRadius}`
          )}
        >
          {children}
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Color controls                                                       */
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
      <ColorHeader
        label={label}
        hex={hex}
        hue={value.hue}
        onChange={onChange}
      />
      <HueRing
        value={value.hue}
        onChange={(hue) => onChange({ ...value, hue })}
      />
      <VibrancySlider
        value={value.vibrancy}
        hue={value.hue}
        onChange={(vibrancy) => onChange({ ...value, vibrancy })}
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
      : (((primaryHue + (ACCENT_ANCHORS[value.anchor] ?? 0)) % 360) + 360) % 360
  const hex = oklchToHex({ l: oklch.l, c: oklch.c, h: effectiveHue })

  return (
    <section className="flex flex-col gap-2">
      <ColorHeader
        label="accent"
        hex={hex}
        hue={value.hue}
        onChange={(next) =>
          onChange({
            ...value,
            ...next,
            anchor: "free",
          })
        }
      />

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
      <VibrancySlider
        value={value.vibrancy}
        hue={effectiveHue}
        onChange={(vibrancy) => onChange({ ...value, vibrancy })}
      />
    </section>
  )
}

function ColorHeader({
  label,
  hex,
  hue,
  onChange,
}: {
  label: string
  hex: string
  hue: number
  onChange: (next: { hue: number; vibrancy: number }) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </Label>
      <span className="flex items-center gap-1.5 rounded-md border border-border bg-card pl-1.5 pr-px py-px">
        <span
          aria-hidden
          className="size-3.5 rounded-sm shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
          style={{ background: hex }}
        />
        <HexInput value={hex} hue={hue} onChange={onChange} />
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Refined sliders                                                      */
/* ------------------------------------------------------------------ */

/**
 * Hue ring: a 12-stop OKLCH rainbow track with a polished circular thumb
 * that always reads the current hue.
 */
function HueRing({
  value,
  onChange,
  dimmed = false,
}: {
  value: number
  onChange: (hue: number) => void
  dimmed?: boolean
}) {
  const gradient = useMemo(() => {
    const stops: string[] = []
    for (let i = 0; i <= 12; i++) {
      const h = (i * 360) / 12
      stops.push(`oklch(0.7 0.18 ${h}) ${(i * 100) / 12}%`)
    }
    return `linear-gradient(to right, ${stops.join(", ")})`
  }, [])

  const thumbColor = useMemo(() => `oklch(0.7 0.18 ${value})`, [value])

  return (
    <SliderShell
      value={value}
      onChange={onChange}
      min={0}
      max={359}
      step={1}
      label="hue"
      display={`${Math.round(value)}°`}
      gradient={gradient}
      thumbColor={thumbColor}
      disabled={dimmed}
      ariaLabel="hue"
    />
  )
}

/**
 * Vibrancy: the track shows what the slider produces — a gradient from
 * near-gray at v=0 to fully vivid at v=100, sampled at the current hue.
 */
function VibrancySlider({
  value,
  hue,
  onChange,
}: {
  value: number
  hue: number
  onChange: (v: number) => void
}) {
  const gradient = useMemo(() => {
    const stops: string[] = []
    for (let i = 0; i <= 10; i++) {
      const t = i / 10
      const { l, c } = vibrancyToLC(t * 100)
      stops.push(`oklch(${l.toFixed(3)} ${c.toFixed(3)} ${hue}) ${i * 10}%`)
    }
    return `linear-gradient(to right, ${stops.join(", ")})`
  }, [hue])

  const thumbColor = useMemo(() => {
    const { l, c } = vibrancyToLC(value)
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${hue})`
  }, [value, hue])

  return (
    <SliderShell
      value={value}
      onChange={onChange}
      min={0}
      max={100}
      step={1}
      label="vibrancy"
      display={`${Math.round(value)}`}
      gradient={gradient}
      thumbColor={thumbColor}
      ariaLabel="vibrancy"
    />
  )
}

/**
 * Warmth: cool blue → neutral → warm amber gradient that bleeds toward the
 * primary hue at the extremes — same curve the engine uses.
 */
function WarmthControl({
  value,
  primaryHue,
  onChange,
}: {
  value: number
  primaryHue: number
  onChange: (v: number) => void
}) {
  const gradient = useMemo(() => {
    const stops: string[] = []
    for (let i = 0; i <= 10; i++) {
      const w = (i / 10) * 2 - 1 // [-1, +1]
      const { hue, chroma } = warmthToNeutral(w, primaryHue)
      stops.push(
        `oklch(${0.62} ${chroma.toFixed(3)} ${hue.toFixed(2)}) ${i * 10}%`
      )
    }
    return `linear-gradient(to right, ${stops.join(", ")})`
  }, [primaryHue])

  const thumbColor = useMemo(() => {
    const { hue, chroma } = warmthToNeutral(value, primaryHue)
    return `oklch(0.62 ${chroma.toFixed(3)} ${hue.toFixed(2)})`
  }, [value, primaryHue])

  // Map slider in 0..100 to warmth in [-1, 1] to maintain integer step
  // behavior and match the rendered track length.
  const sliderPos = ((value + 1) / 2) * 100

  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          neutral warmth
        </Label>
        <span className="font-mono text-[10px] text-muted-foreground">
          {value >= 0 ? "+" : ""}
          {value.toFixed(2)}
        </span>
      </div>
      <SliderTrack
        valuePercent={sliderPos}
        gradient={gradient}
        thumbColor={thumbColor}
        ariaLabel="neutral warmth"
        ariaValueText={value.toFixed(2)}
        onChange={(pct) => onChange(+(pct / 50 - 1).toFixed(2))}
      />
      <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>cool</span>
        <span>neutral</span>
        <span>warm</span>
      </div>
    </section>
  )
}

/**
 * Generic "label + slider track + value readout" wrapper.
 */
function SliderShell({
  value,
  onChange,
  min,
  max,
  step,
  label,
  display,
  gradient,
  thumbColor,
  disabled = false,
  ariaLabel,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  label: string
  display: string
  gradient: string
  thumbColor: string
  disabled?: boolean
  ariaLabel?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between font-mono text-[9px] text-muted-foreground">
        <span>{label}</span>
        <span>{display}</span>
      </div>
      <SliderTrack
        valuePercent={pct}
        gradient={gradient}
        thumbColor={thumbColor}
        disabled={disabled}
        ariaLabel={ariaLabel ?? label}
        ariaValueText={display}
        onChange={(p) => {
          const next = min + (p / 100) * (max - min)
          const snapped = Math.round(next / step) * step
          onChange(Math.max(min, Math.min(max, snapped)))
        }}
      />
    </div>
  )
}

/**
 * Low-level slider track + thumb. The gradient is the slider track itself;
 * the thumb is a circular indicator that visualizes the *current* color.
 * Hit-target is enlarged via an absolute inset, so pointer events on the
 * full row height move the slider — no need to land on the 14px bar.
 */
function SliderTrack({
  valuePercent,
  gradient,
  thumbColor,
  onChange,
  disabled = false,
  ariaLabel,
  ariaValueText,
}: {
  valuePercent: number
  gradient: string
  thumbColor: string
  onChange: (percent: number) => void
  disabled?: boolean
  ariaLabel?: string
  ariaValueText?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  function updateFromClientX(clientX: number) {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    onChange(pct)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return
    if (e.button !== 0) return
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    updateFromClientX(e.clientX)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    updateFromClientX(e.clientX)
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    let delta = 0
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -1
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = 1
    else if (e.key === "Home") return onChange(0)
    else if (e.key === "End") return onChange(100)
    else if (e.key === "PageDown") delta = -10
    else if (e.key === "PageUp") delta = 10
    if (delta !== 0) {
      e.preventDefault()
      onChange(Math.max(0, Math.min(100, valuePercent + delta)))
    }
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(valuePercent)}
      aria-valuetext={ariaValueText}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "group/track relative h-5 w-full cursor-pointer touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full ring-1 ring-foreground/10 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
        style={{ background: gradient }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-background ring-1 ring-foreground/40 shadow-sm transition-transform group-active/track:scale-110"
        style={{
          left: `${valuePercent}%`,
          background: thumbColor,
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Typography control                                                    */
/* ------------------------------------------------------------------ */

function TypographyControl({
  sans,
  heading,
  mono,
  presetSets,
  onPatch,
}: {
  sans: FontKey
  heading: FontKey
  mono: FontKey
  presetSets: readonly {
    id: string
    label: string
    hint: string
    sans: FontKey
    heading: FontKey
    mono: FontKey
  }[]
  onPatch: (
    patch: Partial<{ sans: FontKey; heading: FontKey; mono: FontKey }>
  ) => void
}) {
  // A font set is "active" when all three fonts match.
  const activeSet =
    presetSets.find(
      (s) => s.sans === sans && s.heading === heading && s.mono === mono
    )?.id ?? null

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          <Type className="size-3" />
          typography
        </Label>
        <span
          className="truncate font-mono text-[10px] text-muted-foreground"
          title={fontLabel(heading)}
          style={{ maxWidth: "10rem" }}
        >
          {fontLabel(heading)}
        </span>
      </div>

      {presetSets.length > 0 && (
        <div className="flex flex-col gap-1">
          <SubLabel>curated sets</SubLabel>
          <div className="grid grid-cols-1 gap-1">
            {presetSets.map((set) => {
              const active = set.id === activeSet
              return (
                <button
                  type="button"
                  key={set.id}
                  onClick={() =>
                    onPatch({
                      sans: set.sans,
                      heading: set.heading,
                      mono: set.mono,
                    })
                  }
                  className={cn(
                    "group/font-set flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left transition-colors cursor-pointer",
                    active
                      ? "border-foreground/30 bg-muted"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs font-medium leading-none">
                      {set.label}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {set.hint}
                    </span>
                  </span>
                  <FontMiniPreview
                    headingKey={set.heading}
                    sansKey={set.sans}
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
        <SubLabel>sans</SubLabel>
        <FontPicker
          value={sans}
          onChange={(v) => onPatch({ sans: v })}
          categories={["sans", "serif", "display"]}
          pinned={[
            "geist-sans",
            "ibm-plex-sans",
            "google:Inter",
            "google:Manrope",
          ]}
        />
        <SubLabel>heading</SubLabel>
        <FontPicker
          value={heading}
          onChange={(v) => onPatch({ heading: v })}
          pinned={[
            "google:Fraunces",
            "google:Playfair Display",
            "google:Space Grotesk",
            "instrument-serif",
          ]}
        />
        <SubLabel>mono</SubLabel>
        <FontPicker
          value={mono}
          onChange={(v) => onPatch({ mono: v })}
          categories={["mono"]}
          pinned={["geist-mono", "ibm-plex-mono", "google:JetBrains Mono"]}
        />
      </div>
    </section>
  )
}

function FontMiniPreview({
  headingKey,
  sansKey,
}: {
  headingKey: FontKey
  sansKey: FontKey
}) {
  useEffect(() => {
    loadFontIfRemote(headingKey)
    loadFontIfRemote(sansKey)
  }, [headingKey, sansKey])

  return (
    <span className="shrink-0 text-right leading-tight">
      <span
        className="block text-sm font-semibold"
        style={{ fontFamily: resolveFontFamily(headingKey) }}
      >
        Ag
      </span>
      <span
        className="block text-[9px] text-muted-foreground"
        style={{ fontFamily: resolveFontFamily(sansKey) }}
      >
        abc 123
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Hex input + derivation control                                       */
/* ------------------------------------------------------------------ */

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
    const c = parsed.c
    const t = Math.max(0, Math.min(1, (c - 0.015) / 0.21))
    const vibrancy = Math.round(t ** (1 / 0.85) * 100)
    onChange({
      hue: Math.round(parsed.h),
      vibrancy,
    })
    void hue
  }

  return (
    <input
      value={draft}
      onChange={(e) => commit(e.target.value)}
      className="h-5 w-[70px] rounded-sm border-0 bg-transparent px-1 font-mono text-[10px] outline-none focus:bg-muted"
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
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">
          {value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <SliderTrack
        valuePercent={pct}
        gradient="linear-gradient(to right, var(--muted), var(--foreground))"
        thumbColor="var(--background)"
        ariaLabel={label}
        ariaValueText={value.toFixed(2)}
        onChange={(p) => {
          const next = min + (p / 100) * (max - min)
          const snapped = Math.round(next / step) * step
          onChange(Math.max(min, Math.min(max, snapped)))
        }}
      />
    </div>
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
        : (((primary.hue + (ACCENT_ANCHORS[accent.anchor] ?? 0)) % 360) + 360) %
          360,
  })
  const bgHex = mode === "dark" ? "#181818" : "#fafafa"
  const fgHex = mode === "dark" ? "#fafafa" : "#181818"

  const swatches = [
    { role: "bg", color: bgHex },
    { role: "fg", color: fgHex },
    { role: "primary", color: primaryHex },
    { role: "accent", color: accentHex },
  ]
  return (
    <div className="flex shrink-0 gap-0.5">
      {swatches.map((s) => (
        <span
          key={s.role}
          className="size-3 rounded-full border border-border"
          style={{ background: s.color }}
        />
      ))}
    </div>
  )
}
