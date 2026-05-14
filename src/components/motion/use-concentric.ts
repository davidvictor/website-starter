/**
 * Compute the inner radius Tailwind class given an outer radius class and
 * padding in pixels. See docs/adr/0010-radius-enforcement.md.
 *
 * The codebase's radius scale (in globals.css):
 *   --radius:   0.625rem  (10px)  → rounded-lg
 *   sm = radius × 0.6    ( 6px)  → rounded-sm
 *   md = radius × 0.8    ( 8px)  → rounded-md
 *   xl = radius × 1.4    (14px)  → rounded-xl
 *   2xl = radius × 1.8   (18px)  → rounded-2xl
 *   3xl = radius × 2.2   (22px)  → rounded-3xl
 *   4xl = radius × 2.6   (26px)  → rounded-4xl
 *
 * The default `--radius` is 0.625rem but is theme-overridable; this helper
 * uses px values that match the default. Themes that change `--radius`
 * scale their tokens proportionally, so the *class* you pick stays correct.
 */

const RADIUS_PX: Record<string, number> = {
  "rounded-none": 0,
  "rounded-sm": 6,
  "rounded-md": 8,
  "rounded-lg": 10,
  "rounded-xl": 14,
  "rounded-2xl": 18,
  "rounded-3xl": 22,
  "rounded-4xl": 26,
}

const RADIUS_ORDER = [
  "rounded-none",
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
] as const

/**
 * Given outer radius and padding (px), return the closest inner radius class.
 * `innerRadius = outerRadius − padding`, rounded to the nearest token.
 */
export function useConcentric(
  outerRadiusClass: keyof typeof RADIUS_PX,
  paddingPx: number
): string {
  const outerPx = RADIUS_PX[outerRadiusClass] ?? 10
  const targetPx = Math.max(0, outerPx - paddingPx)

  let bestClass: string = RADIUS_ORDER[0]
  let bestDelta = Number.POSITIVE_INFINITY

  for (const cls of RADIUS_ORDER) {
    const delta = Math.abs(RADIUS_PX[cls] - targetPx)
    if (delta < bestDelta) {
      bestDelta = delta
      bestClass = cls
    }
  }

  return bestClass
}
