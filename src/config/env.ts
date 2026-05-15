/**
 * zod-validated access to `process.env`. Required vars throw at module
 * load — fail fast at boot rather than crashing on first use.
 *
 * Never import `process.env.X` directly in app code; use `env.X` from
 * here. The one documented exception is `src/app/api/health/route.ts`,
 * which must respond even when validation would throw.
 */

import { z } from "zod"

const envSchema = z.object({
  /** Public site URL — used for canonical, OG, sitemap, robots. No trailing slash. */
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  /** Vercel-injected — "production" | "preview" | "development". */
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),

  /** Vercel-injected — short SHA of the deploy's commit. */
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  )
  throw new Error("Invalid environment variables — see .env.example")
}

export const env = parsed.data
