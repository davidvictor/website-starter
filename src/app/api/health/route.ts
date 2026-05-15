/**
 * Health check endpoint.
 *
 * NOTE: This file is the documented exception to the env contract ("all env
 * access via src/config/env.ts"). The health route reads `process.env`
 * directly so it always responds — even when `env.ts` validation would
 * throw on a misconfigured deploy. Platform healthchecks should always
 * hear back from us.
 */

// Dynamic by nature (reads process.env + Date.now); no `dynamic` export needed
// — it's incompatible with `next.config.ts: { cacheComponents: true }`.

export function GET() {
  return Response.json({
    status: "ok",
    version: process.env.npm_package_version ?? "0.0.0",
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    env: process.env.VERCEL_ENV ?? "local",
    timestamp: new Date().toISOString(),
  })
}
