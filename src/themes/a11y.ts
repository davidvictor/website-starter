/**
 * Accessibility audit module. The single place that knows which token
 * pairs to grade and how to grade them. Consumed by:
 * - the /accessibility overview page (server-rendered)
 * - the dev-panel live indicator (client-side reactive)
 * - scripts/audit-a11y.mjs (CI gate)
 *
 * Adding a pair = one entry in `PAIRS`. The overview page and the dev
 * panel pick it up automatically.
 */

import { hexToOklch } from "@/lib/color"
import {
  type Category,
  type Grade,
  gradeRatio,
  isBelowModerateBaseline,
  wcagRatioOklch,
} from "@/lib/contrast"

import type { ControllerTheme } from "./controller-types"
import { resolveTokens } from "./registry"
import type { ColorTokenKey, Mode } from "./tokens"

export type PairSpec = {
  /** Stable id used as DOM anchor in the overview page. */
  id: string
  label: string
  /** Foreground token (text or graphic). */
  fg: ColorTokenKey
  /** Background token. */
  bg: ColorTokenKey
  category: Category
  /**
   * If `displayOnly: true`, the pair grades at the AA-Large floor (3.0)
   * and a result of "AA-Large" is treated as PASS for the moderate
   * baseline. Used for brand-on-background where the usage is heading-
   * sized display only.
   */
  displayOnly?: boolean
}

/** The audit catalog. Adding a pair here surfaces it everywhere. */
export const PAIRS: readonly PairSpec[] = [
  // Body text on neutral surfaces
  {
    id: "fg-bg",
    label: "Body text on background",
    fg: "foreground",
    bg: "background",
    category: "text",
  },
  {
    id: "fg-card",
    label: "Body text on card",
    fg: "cardForeground",
    bg: "card",
    category: "text",
  },
  // Popover and card share the same neutral anchor today; fg-popover
  // always equals fg-card numerically. Kept separate so a future change
  // that diverges popover from card surfaces automatically.
  {
    id: "fg-popover",
    label: "Body text on popover",
    fg: "popoverForeground",
    bg: "popover",
    category: "text",
  },
  {
    id: "muted-bg",
    label: "Muted text on background",
    fg: "mutedForeground",
    bg: "background",
    category: "text",
  },
  {
    id: "muted-muted",
    label: "Muted text on muted surface",
    fg: "mutedForeground",
    bg: "muted",
    category: "text",
  },
  {
    id: "muted-card",
    label: "Muted text on card",
    fg: "mutedForeground",
    bg: "card",
    category: "text",
  },

  // Filled brand / surface affordances
  {
    id: "primary-fill",
    label: "Label on primary fill",
    fg: "primaryForeground",
    bg: "primary",
    category: "text",
  },
  {
    id: "secondary-fill",
    label: "Label on secondary fill",
    fg: "secondaryForeground",
    bg: "secondary",
    category: "text",
  },
  {
    id: "accent-fill",
    label: "Label on accent surface",
    fg: "accentForeground",
    bg: "accent",
    category: "text",
  },
  {
    id: "brand-fill",
    label: "Label on brand accent fill",
    fg: "brandAccentForeground",
    bg: "brandAccent",
    category: "text",
  },
  {
    id: "destr-fill",
    label: "Label on destructive fill",
    fg: "background",
    bg: "destructive",
    category: "text",
  },

  // Sidebar
  {
    id: "sb-fg",
    label: "Sidebar text",
    fg: "sidebarForeground",
    bg: "sidebar",
    category: "text",
  },
  {
    id: "sb-primary",
    label: "Sidebar active item",
    fg: "sidebarPrimaryForeground",
    bg: "sidebarPrimary",
    category: "text",
  },
  {
    id: "sb-accent",
    label: "Sidebar hover surface",
    fg: "sidebarAccentForeground",
    bg: "sidebarAccent",
    category: "text",
  },

  // Brand color used as text/link on neutral (display-only allowance)
  {
    id: "primary-link",
    label: "Primary as link / display",
    fg: "primary",
    bg: "background",
    category: "text",
    displayOnly: true,
  },
  // `accent-link` and `brand-link` both grade the vivid brand-accent
  // color used as link/display text on background. The `--accent` CSS
  // var is shadcn's *surface* accent (muted hover), so it would always
  // be near-bg lightness and produce a meaningless ~1.1:1 ratio. The
  // brand accent is exposed via `--brand-accent` (token key
  // `brandAccent`). The two ids are kept separate so the overview page
  // and dev panel can label "accent" and "brand accent" usage distinctly
  // if they diverge later; today they grade identically.
  {
    id: "accent-link",
    label: "Accent as link / display",
    fg: "brandAccent",
    bg: "background",
    category: "text",
    displayOnly: true,
  },
  {
    id: "brand-link",
    label: "Brand accent as display",
    fg: "brandAccent",
    bg: "background",
    category: "text",
    displayOnly: true,
  },

  // UI affordances (1.4.11 — 3:1 required)
  {
    id: "ring-bg",
    label: "Focus ring on background",
    fg: "ring",
    bg: "background",
    category: "ui",
  },
  {
    id: "input-bg",
    label: "Input border on background",
    fg: "input",
    bg: "background",
    category: "ui",
  },
  {
    id: "destr-bg",
    label: "Destructive blob on bg",
    fg: "destructive",
    bg: "background",
    category: "ui",
  },
  {
    id: "success-bg",
    label: "Success blob on bg",
    fg: "success",
    bg: "background",
    category: "ui",
  },
  {
    id: "warning-bg",
    label: "Warning blob on bg",
    fg: "warning",
    bg: "background",
    category: "ui",
  },
  {
    id: "info-bg",
    label: "Info blob on bg",
    fg: "info",
    bg: "background",
    category: "ui",
  },

  // Decorative (graded but never blocks the baseline)
  {
    id: "border-bg",
    label: "Decorative border on bg",
    fg: "border",
    bg: "background",
    category: "decorative",
  },
] as const

export type PairResult = {
  pair: PairSpec
  ratio: number
  grade: Grade
  /** True when the pair is below the moderate baseline for its category. */
  fails: boolean
  fgCss: string
  bgCss: string
}

export type AuditResult = {
  themeId: string
  themeName: string
  mode: Mode
  pairs: PairResult[]
  /** Pair ids that fail the moderate baseline. */
  failures: string[]
  /** Worst (lowest) ratio across all non-decorative pairs. */
  worstRatio: number
}

/**
 * Parse an `oklch(L C H)` or `oklch(L C H / a)` string to an OKLCH triple.
 *
 * NOTE: alpha is intentionally dropped. The audit grades the
 * un-composited color, which is an upper bound on perceived contrast.
 * If a token uses alpha < 1 against a background, the rendered contrast
 * is LOWER than what `auditTheme` reports. The convention in this repo
 * is therefore: tokens used as `fg` in PAIRS must be opaque (alpha=1).
 * The decorative `border` token is exempt because it grades as category
 * "decorative" (always PASS).
 *
 * As of Task 4b, all audited tokens are opaque — `--input` derives from
 * `neutral.inputBorder` with no alpha so the audit number matches the
 * perceived contrast exactly.
 */
export function parseOklch(s: string): { l: number; c: number; h: number } {
  // Accept "oklch(0.62 0.18 290)" or "oklch(0.62 0.18 290 / 0.6)".
  const m = s.match(
    /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*[0-9.]+)?\s*\)/i
  )
  if (m) {
    return { l: +m[1], c: +m[2], h: +m[3] }
  }
  // Hex fallback — tolerate `#abc`, `#aabbcc`, or trimmed hex without `#`.
  if (/^#?[0-9a-f]{3,6}$/i.test(s.trim())) {
    return hexToOklch(s)
  }
  // Unknown CSS format. Throw so the audit fails loudly rather than
  // silently grading against pure black (which would produce a false
  // PASS for any non-black bg). If a new color function is introduced
  // upstream, this is where it surfaces.
  throw new Error(
    `parseOklch: unrecognized color string "${s}". Expected oklch(L C H) ` +
      `or oklch(L C H / alpha), or a hex literal. The audit module needs ` +
      `to be updated to handle the new format.`
  )
}

export function auditTheme(theme: ControllerTheme, mode: Mode): AuditResult {
  const tokens = resolveTokens(theme, mode)
  const pairs: PairResult[] = PAIRS.map((p) => {
    const fgCss = tokens[p.fg]
    const bgCss = tokens[p.bg]
    // Note: alpha is dropped — see parseOklch JSDoc. Tokens used as fg in
    // PAIRS should be opaque for the audit number to match perceived
    // contrast.
    const r = wcagRatioOklch(parseOklch(fgCss), parseOklch(bgCss))
    const grade = gradeRatio(r, p.category)
    // For display-only text pairs, AA-Large counts as PASS.
    const fails =
      p.category === "decorative"
        ? false
        : p.displayOnly
          ? r < 3.0
          : isBelowModerateBaseline(r, p.category)
    return { pair: p, ratio: r, grade, fails, fgCss, bgCss }
  })
  const failures = pairs.filter((p) => p.fails).map((p) => p.pair.id)
  const nonDecorative = pairs.filter((p) => p.pair.category !== "decorative")
  // Worst ratio across non-decorative pairs. When there are no such pairs
  // (only possible during catalog refactoring), return 21 — the WCAG
  // maximum — so threshold comparisons treat the audit as a pass rather
  // than spuriously firing on Infinity.
  const worstRatio =
    nonDecorative.length === 0
      ? 21
      : nonDecorative.reduce(
          (m, p) => Math.min(m, p.ratio),
          Number.POSITIVE_INFINITY
        )
  return {
    themeId: theme.id,
    themeName: theme.name,
    mode,
    pairs,
    failures,
    worstRatio,
  }
}

export function auditAllPresets(
  themes: readonly ControllerTheme[]
): AuditResult[] {
  const out: AuditResult[] = []
  for (const t of themes) {
    out.push(auditTheme(t, "light"))
    out.push(auditTheme(t, "dark"))
  }
  return out
}
