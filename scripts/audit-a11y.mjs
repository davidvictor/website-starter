#!/usr/bin/env node
/**
 * Runtime-backed WCAG audit gate.
 *
 * The source of truth is `src/themes/a11y.ts` plus its Vitest coverage. This
 * wrapper intentionally avoids duplicating token derivation or pair catalogs;
 * `pnpm audit:a11y` now runs the runtime audit suite directly.
 */

import { spawnSync } from "node:child_process"

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm"
const env = { ...process.env }

if (env.NO_COLOR) {
  delete env.FORCE_COLOR
} else {
  env.FORCE_COLOR ??= "1"
}

const result = spawnSync(
  pnpm,
  ["exec", "vitest", "run", "src/themes/__tests__/a11y.test.ts"],
  {
    stdio: "inherit",
    env,
  }
)

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status ?? 1)
