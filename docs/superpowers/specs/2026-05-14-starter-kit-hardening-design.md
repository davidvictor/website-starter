# Starter-Kit Hardening

**Status:** Design accepted, ready for implementation plan
**Date:** 2026-05-14
**Author:** David (with assistant)
**Driver:** Lookbook is the starter kit — the base every new prototype gets cloned from. Right now it ships a strong design surface (themes, blocks, dev panel, shaders) but lacks the workflow scaffolding that makes a project safe to extend without re-thinking conventions each time: AI/agent guides, automated tests, commit hooks, CI, env handling, marketing-site fundamentals (sitemap/robots/OG), and dependency hygiene. This spec adds those layers, intentionally minimal and intentionally Lookbook-flavored (Biome over ESLint, Vitest over Jest, no `vercel.json` because framework detection covers it).

---

## 1. Context

The current repo state, summarized:

- **Stack:** Next.js 16.2.6, React 19.2.4, TypeScript 5, Tailwind v4, Biome 2.4 (one tool for lint + format), pnpm 10.33, Node 22 (`.nvmrc`).
- **Scripts present:** `dev`, `build`, `start`, `format` (biome), `lint` (biome), `check` (`biome check . && pnpm check:polish`), `check:polish` (`node scripts/check-polish.mjs`).
- **Scripts absent:** `test`, `typecheck`, `prepare`.
- **Git hooks:** none (`.husky/` does not exist).
- **CI:** none. `.github/` contains only `PULL_REQUEST_TEMPLATE.md`.
- **AI/agent guides:** none at repo root (`.claude/` is local agent state, gitignored).
- **Vercel:** no `vercel.json` / `vercel.ts` — relies on framework detection (correct default for Next.js).
- **Env:** no `.env.example`; no centralized env validation.
- **Marketing fundamentals:** no `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, or centralized metadata helper. Pages presumably define their own `metadata` exports.
- **Observability:** no health route, no top-level `error.tsx` / `global-error.tsx`, no analytics wiring.
- **Repo health:** no `SECURITY.md`, no Dependabot/Renovate, no issue templates.

The recent commit log (`feat(route-transition):`, `fix(dev-panel):`, `docs(shaders):`) shows Conventional Commits are already the de facto convention; this spec just enforces what's already happening.

The existing `scripts/check-polish.mjs` and its Biome ignores for shadcn-derived components stay as-is — they're load-bearing for this project's polish discipline.

## 2. Goals

- A **first-commit-ready repo**: pull, `pnpm i`, `pnpm dev`, and every guardrail (lint, types, tests, hooks, CI) is live with zero extra steps.
- **AI/agent guides** (`AGENTS.md` as source of truth, `CLAUDE.md` as a thin pointer) so any agent picking up the repo gets the same orientation.
- **Husky + commitlint** enforcing Conventional Commits and a fast pre-commit check (≤ 5s on a clean checkout for typical diffs).
- **Vitest** with a small, valuable test surface — the OKLCH derivation engine and the (forthcoming) shader registry. Not component tests.
- **GitHub Actions CI** running the full verify on PRs in a single workflow.
- **Marketing-site fundamentals** — sitemap, robots (prod-aware), OG image, centralized `siteMetadata()` helper.
- **Observability lite** — health route, error boundaries, Vercel Analytics + Speed Insights.
- **Central site config + env validation** via a single `siteConfig` object and a zod-validated `env` module.
- **Dep hygiene** — weekly Dependabot, `SECURITY.md`, minimal issue templates.

## 3. Non-goals

- Replacing Biome with ESLint + Prettier. Biome is faster and already configured.
- Component tests / visual regression. Lookbook is a design surface; UI variants are exercised by eye in the dev panel and by Vercel preview deploys.
- E2E tests (Playwright/Cypress). Too heavy for the value at this stage.
- Sentry or any third-party error monitoring. Vercel logs + the in-built error boundary are enough until real users land.
- Multi-environment env management beyond `.env.local` + `.env.example`. No staging/prod env split inside the repo — Vercel handles that.
- Changesets / SemVer / CHANGELOG automation. Lookbook isn't a published library.
- Custom GitHub Actions for preview URL comments. Vercel's GitHub integration already does this.
- `vercel.json` or `vercel.ts`. Next.js framework detection covers it; revisit if/when crons or custom routes appear.

## 4. Decisions resolved upfront

| Open question | Resolution |
|---|---|
| Where does the starter kit live? | **Lookbook itself.** This is hardening, not a new repo. |
| Lint/format | **Keep Biome.** Wire into Husky; do not introduce ESLint or Prettier. |
| Testing framework | **Vitest.** ESM-native, matches the Vite/Next 16 world, Jest-compatible API. |
| Test scope | **Pure logic only.** Theme derivation engine, shader registry. No component / E2E tests. |
| Hook + CI shape | **Standard.** Local pre-commit: biome (staged) + `tsc --noEmit` + `vitest --changed`. commit-msg: commitlint. CI: full verify on PR. |
| Commit convention | **Conventional Commits**, enforced via `@commitlint/config-conventional`. |
| AGENTS.md vs CLAUDE.md | **AGENTS.md is source of truth.** `CLAUDE.md` is a short pointer file plus Claude-specific extras (skills, slash commands you actually use). Avoids drift. |
| Vercel config file | **None.** Framework detection is correct for Next.js. Add only when a real need (cron, custom routing) appears. |
| Env management | **`.env.example` + zod-validated `src/config/env.ts`.** Throws at import time on missing required vars. |
| Analytics | **`@vercel/analytics` + `@vercel/speed-insights`.** Two one-liners in root layout. No GA, no PostHog at this stage. |
| Dep updates | **Dependabot** (built into GitHub) over Renovate. Weekly, grouped by `npm` ecosystem and `github-actions` ecosystem. |
| Rollout shape | **Three phases.** Foundation → content layer → polish. Each phase independently mergeable. |

## 5. Prerequisites — package installs

```bash
# Test runner
pnpm add -D vitest @vitest/coverage-v8

# Hooks + commit-msg
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Validation
pnpm add zod

# Observability
pnpm add @vercel/analytics @vercel/speed-insights

# OG image generation (likely already transitive; pin explicitly)
pnpm add @vercel/og
```

All new dev dependencies; runtime adds are `zod`, `@vercel/analytics`, `@vercel/speed-insights`, `@vercel/og`. All are negligible bundle impact (analytics is client-only, og is server-only, zod tree-shakes well).

## 6. Architecture

### 6.1 File layout (new + modified)

```
/                                # repo root
  AGENTS.md                      # NEW — source of truth for agents
  CLAUDE.md                      # NEW — pointer to AGENTS.md + Claude extras
  SECURITY.md                    # NEW
  .env.example                   # NEW
  commitlint.config.cjs          # NEW
  vitest.config.ts               # NEW
  package.json                   # MODIFIED — scripts, lint-staged block, deps
  README.md                      # MODIFIED — deploy + setup section refreshed

.husky/                          # NEW
  pre-commit
  commit-msg

.github/
  PULL_REQUEST_TEMPLATE.md       # existing
  dependabot.yml                 # NEW
  workflows/
    ci.yml                       # NEW
  ISSUE_TEMPLATE/                # NEW
    bug.md
    feature.md

src/app/
  sitemap.ts                     # NEW
  robots.ts                      # NEW
  opengraph-image.tsx            # NEW
  twitter-image.tsx              # NEW
  error.tsx                      # NEW
  global-error.tsx               # NEW
  layout.tsx                     # MODIFIED — mount Analytics + SpeedInsights
  api/
    health/
      route.ts                   # NEW

src/config/                      # NEW
  site.ts
  env.ts

src/lib/
  metadata.ts                    # NEW

src/themes/__tests__/            # NEW
  derive.test.ts
  registry.test.ts               # placeholder (real coverage lands with shader spec)
```

### 6.2 What each new module does

- `AGENTS.md` — Stack summary, file-map ("where to look for X"), conventions (Conventional Commits, Biome rules, theme tokens, no component tests), and a "common pitfalls" section. ~150 lines.
- `CLAUDE.md` — 20-line pointer: "Read `AGENTS.md` first." Plus Claude-specific bits: which skills are relevant (`make-interfaces-feel-better`, `hostile-review`, etc.) and notes about the `.claude/` local state directory.
- `vitest.config.ts` — Node env (no jsdom needed for pure-logic tests). Test globbing `src/**/*.{test,spec}.ts`. Path alias `@/*` mirrors `tsconfig.json`.
- `src/themes/__tests__/derive.test.ts` — exercises the OKLCH derivation engine: given (primaryHex, accentHex, warmth, preset), assert resolved tokens are stable and within expected ranges.
- `.husky/pre-commit` — runs `pnpm exec lint-staged && pnpm exec tsc --noEmit && pnpm exec vitest --run --changed origin/main`. Note: `--changed origin/main` skips the whole suite when nothing touched test-dependencies; falls back to running tests near changed source files.
- `.husky/commit-msg` — `pnpm exec commitlint --edit "$1"`.
- `commitlint.config.cjs` — `module.exports = { extends: ['@commitlint/config-conventional'] }`.
- `lint-staged` (in package.json) — `"*.{ts,tsx,json}": ["biome check --no-errors-on-unmatched --files-ignore-unknown=true"]`.
- `.github/workflows/ci.yml` — single workflow, single job, sequential steps: checkout → pnpm setup → install → `pnpm check` → `pnpm typecheck` → `pnpm test` → `pnpm build`. Node 22 from `.nvmrc`. pnpm store cached.
- `src/app/sitemap.ts` — reads from a small route registry (homepage + 3 variant homes + pricing/about/customers/changelog/blog/post/careers/contact/sandbox/variants), returns Next.js sitemap entries with `lastModified` from build time.
- `src/app/robots.ts` — prod: `User-agent: *`, `Allow: /`; non-prod (`VERCEL_ENV !== 'production'`): `Disallow: /`. Always points sitemap to `${siteConfig.url}/sitemap.xml`.
- `src/app/opengraph-image.tsx` — `@vercel/og` rendering: site name + accent gradient (reads `--primary` / `--accent` tokens at build time? or static fallback — see §7.6.1).
- `src/app/twitter-image.tsx` — re-exports the OG image, sets `size` to twitter card dims.
- `src/lib/metadata.ts` — `siteMetadata({ title, description, path })` returning a complete Next.js `Metadata` object (canonical URL, OG, Twitter, robots).
- `src/app/api/health/route.ts` — GET → `{ status: 'ok', version, commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev', timestamp: new Date().toISOString() }`. No auth. Cached `no-store`.
- `src/app/error.tsx` — Next.js per-route error boundary with a Reset button and a tiny "something went wrong" UI in the project's typography.
- `src/app/global-error.tsx` — root-level fallback (replaces `<html>` per Next.js convention).
- `src/config/site.ts` — `siteConfig` constant: `{ name, description, url, ogImage, links: { github }, navLinks: [...] }`.
- `src/config/env.ts` — zod schema parses `process.env` at module load. Required: `NEXT_PUBLIC_SITE_URL`. Optional: `VERCEL_GIT_COMMIT_SHA`, `VERCEL_ENV`. Throws at boot if required vars missing.
- `.env.example` — currently one line: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Document new vars here as they appear.
- `.github/dependabot.yml` — two ecosystems: `npm` (weekly, grouped: dev-deps, runtime-deps, types) and `github-actions` (weekly).
- `SECURITY.md` — points to security@davidvictor.me + GitHub Security Advisories. ~15 lines.

## 7. Component specs

### 7.1 AI / agent guides

**`AGENTS.md` outline:**

```
# AGENTS.md

## Stack
- Next.js 16 App Router with Cache Components
- React 19, TypeScript 5
- Tailwind v4, shadcn/ui (Base UI variant), Motion, Paper Design Shaders, Leva
- pnpm 10, Node 22 (.nvmrc)

## Where to look
- src/themes/         — OKLCH derivation engine + presets
- src/components/blocks/ — 27 marketing blocks, 3 variants each (editorial/saas/bold)
- src/components/dev-panel/ — typed Leva-driven dev panel
- src/components/ui/  — shadcn/ui primitives (DO NOT edit — Biome ignores them)
- src/components/shaders/ — Paper Design wrappers (legacy) + shaders/ themed library
- docs/superpowers/specs/ — accepted design docs
- docs/superpowers/plans/ — implementation plans

## Conventions
- Conventional Commits (feat/fix/docs/refactor/style/test/chore/perf/ci/build), scope optional
- Biome handles lint + format; do NOT introduce ESLint or Prettier
- No component tests; pure-logic only via Vitest
- Theme tokens flow through CSS custom properties (--primary, --accent, --brand-accent, ...)
- shadcn components in src/components/ui/* are out-of-bounds for restyling; build new components alongside

## Pre-commit
biome check (staged) + tsc --noEmit + vitest --changed. Hook configured via Husky.

## Common pitfalls
- Don't import client-only shaders into Server Components without "use client"
- Don't bypass siteMetadata() for page-level metadata
- Don't read process.env directly — import env from src/config/env.ts

## Useful commands
pnpm dev | pnpm build | pnpm test | pnpm check | pnpm typecheck
```

**`CLAUDE.md`:** 20-line pointer file that reads `AGENTS.md`. Adds: "Useful skills: `make-interfaces-feel-better`, `hostile-review`, `frontend-design`. `.claude/` holds local agent state — gitignored."

### 7.2 Testing

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
})
```

(Add `vite-tsconfig-paths` to devDeps so `@/*` resolves.)

`src/themes/__tests__/derive.test.ts` covers:
- Identity: pure-fn determinism (same inputs → same outputs)
- Range: derived semantic colors stay within OKLCH chroma/lightness bounds
- Preset stamping: each preset (`editorial`, `saas`, `bold`, `cyber`) produces tokens distinct from neighbors
- Warmth swing: `warmth=-1` vs `warmth=+1` produces different neutral hues
- Hex round-trip: any input hex decomposes to OKLCH and back without drift > 1 unit

`src/themes/__tests__/registry.test.ts` is a placeholder (one passing test that registers a stub entry and reads it back) — real coverage arrives with the shader-system implementation plan.

### 7.3 Husky + commitlint

`pnpm dlx husky init` does the boilerplate (creates `.husky/`, adds the `prepare` script). Then customize hooks:

`.husky/pre-commit`:
```sh
pnpm exec lint-staged
pnpm exec tsc --noEmit
pnpm exec vitest --run --changed origin/main
```

`.husky/commit-msg`:
```sh
pnpm exec commitlint --edit "$1"
```

`package.json` additions:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:changed": "vitest run --changed origin/main",
    "typecheck": "tsc --noEmit",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,json}": ["biome check --no-errors-on-unmatched --files-ignore-unknown=true"]
  }
}
```

### 7.4 GitHub Actions CI

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

Single job, sequential steps (each step is fast enough that parallelization isn't worth the cache splitting). Run time target: ≤ 90s on a cold cache.

### 7.5 Vercel deployment baseline

No `vercel.json` / `vercel.ts`. Next.js framework detection handles:
- Build command: `next build`
- Output directory: `.next`
- Dev command: `next dev`
- Install command: auto-detected from `pnpm-lock.yaml`

What we DO add:
- `.env.example` documenting required variables (currently just `NEXT_PUBLIC_SITE_URL`)
- Update README's "Deploy" section: "Click the Vercel button, then in project settings → Environment Variables, add `NEXT_PUBLIC_SITE_URL=https://<your-domain>`."

When/if we add crons or custom rewrites, that's the trigger to introduce `vercel.ts` (preferred over `vercel.json` per current Vercel guidance).

### 7.6 Marketing fundamentals

**`src/app/sitemap.ts`:**
```ts
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

const routes = [
  '', '/editorial', '/bold', '/variants',
  '/pricing', '/about', '/customers', '/changelog',
  '/blog', '/careers', '/contact', '/sandbox',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return routes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))
}
```

**`src/app/robots.ts`:**
```ts
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === 'production'
  return {
    rules: { userAgent: '*', [isProd ? 'allow' : 'disallow']: '/' },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
```

**`src/app/opengraph-image.tsx`** — uses `@vercel/og` with a static-ish gradient + site name. To keep things simple, this v1 does NOT read the live theme tokens (which are CSS variables, not available at OG render time on the edge). Instead it picks a representative gradient from the default preset. Note this as a future enhancement: per-page OG with current theme.

**`src/lib/metadata.ts`:**
```ts
import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'

type Args = { title?: string; description?: string; path?: string }

export function siteMetadata({ title, description, path = '' }: Args = {}): Metadata {
  const url = `${siteConfig.url}${path}`
  const fullTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name
  return {
    title: fullTitle,
    description: description ?? siteConfig.description,
    alternates: { canonical: url },
    openGraph: { title: fullTitle, description, url, siteName: siteConfig.name, type: 'website' },
    twitter: { card: 'summary_large_image', title: fullTitle, description },
  }
}
```

Existing pages migrate to this helper opportunistically (not required by phase 2; can be incremental).

### 7.7 Observability lite

**`src/app/api/health/route.ts`:**
```ts
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({
    status: 'ok',
    version: process.env.npm_package_version ?? '0.0.0',
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev',
    env: process.env.VERCEL_ENV ?? 'local',
    timestamp: new Date().toISOString(),
  })
}
```

**`src/app/error.tsx`** and **`src/app/global-error.tsx`** — per Next.js conventions. Minimal: heading, sub, Reset button. Style consistent with project typography. No external error reporting.

**Root layout** — mount `<Analytics />` and `<SpeedInsights />` from `@vercel/analytics/next` and `@vercel/speed-insights/next` at the end of `<body>`. Both no-op in dev.

### 7.8 Central site config + env validation

**`src/config/site.ts`:**
```ts
import { env } from './env'

export const siteConfig = {
  name: 'Lookbook',
  description: 'A Next.js base for going from design direction to clickable page in one sitting.',
  url: env.NEXT_PUBLIC_SITE_URL,
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
  links: {
    github: 'https://github.com/davidvictor/lookbook',
  },
  navLinks: [
    { href: '/', label: 'Home' },
    { href: '/variants', label: 'Variants' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
} as const
```

**`src/config/env.ts`:**
```ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
```

`.env.example`:
```
# Public — bundled into the client
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 7.9 Dep hygiene + repo health

`.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
    groups:
      dev-deps: { dependency-type: development }
      runtime-deps: { dependency-type: production }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
```

`SECURITY.md`: 1-paragraph intro + "Reporting" section pointing to security@davidvictor.me and the GitHub Security Advisories tab.

`.github/ISSUE_TEMPLATE/bug.md` and `feature.md`: minimal templates (current behavior / expected / repro for bug; problem / proposal / alternatives for feature).

## 8. Rollout — three phases

### Phase 1 — Foundation
- AGENTS.md + CLAUDE.md
- Vitest config + 3 derive tests
- Husky init + pre-commit + commit-msg
- commitlint config
- lint-staged config in package.json
- New scripts: `test`, `test:watch`, `test:changed`, `typecheck`, `prepare`
- `.github/workflows/ci.yml`

**Done when:** A new commit on a fresh clone triggers all hooks, PR creates a green CI run, `pnpm test` runs (and passes).

### Phase 2 — Content layer
- `src/config/site.ts`, `src/config/env.ts`
- `.env.example`
- `src/lib/metadata.ts`
- `src/app/sitemap.ts`, `src/app/robots.ts`
- `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`
- README "Deploy" section refresh

**Done when:** `curl /sitemap.xml` returns valid XML on a preview deploy, `curl /robots.txt` returns prod-correct rules, `curl /opengraph-image` returns a PNG, at least one existing page migrated to `siteMetadata()` as a demo.

### Phase 3 — Polish
- `src/app/api/health/route.ts`
- `src/app/error.tsx`, `src/app/global-error.tsx`
- Root layout: mount `<Analytics />` and `<SpeedInsights />`
- `.github/dependabot.yml`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/bug.md`, `feature.md`

**Done when:** `curl /api/health` returns JSON with the current commit SHA on preview, an artificial throw in a page renders the error boundary, Dependabot's first scheduled PR opens.

Each phase is its own PR. Phases are sequential (Phase 2 depends on `src/config/env.ts` which is part of Phase 2, but its absence doesn't block Phase 1).

## 9. Risks and open questions

- **OG image limitation.** `opengraph-image.tsx` won't render with the live theme tokens — those are runtime CSS variables. A static representative gradient ships in v1; per-page themed OG is a future enhancement (would require rendering theme tokens server-side, likely via a route handler that reads `presets.ts` directly).
- **`vitest --changed origin/main` on fresh branches.** If `origin/main` isn't fetched, the diff target fails. The hook script will need a fallback (`git fetch origin main --depth=1` before, or default to running the full suite when no diff target available). Implementation detail for the plan.
- **`lint-staged` + Biome staged-file semantics.** Biome rewrites files; `lint-staged` re-adds them. Confirm no double-write issue when biome's formatter and linter both run. If problematic, split into `biome format --write` followed by `biome lint`.
- **Conventional Commits enforcement on existing tooling.** `git commit -m "wip"` will be rejected. Document the bypass (`git commit --no-verify`) in AGENTS.md so it's not a surprise. Default stance: don't bypass.
- **Bundle size from `@vercel/og`.** Server-only, no client-bundle impact. Safe.

## 10. Test plan

**Phase 1 verify:**
- Fresh clone → `pnpm i` → `.husky/_/` is created, `prepare` ran
- `git commit -m "wip"` → rejected by commitlint
- `git commit -m "chore: ok"` → accepted, runs lint-staged + tsc + vitest
- Push a PR → CI workflow runs all four steps, green
- Intentionally break a test → CI red

**Phase 2 verify:**
- `pnpm dev` → `/sitemap.xml` returns valid XML covering 12 routes
- `pnpm dev` → `/robots.txt` shows `Disallow: /` (because `VERCEL_ENV !== 'production'`)
- Preview deploy → `/robots.txt` still disallows (preview is not production)
- Prod deploy → `/robots.txt` allows
- `/opengraph-image` returns a PNG of expected dimensions
- Importing `env` without `NEXT_PUBLIC_SITE_URL` in `.env.local` → app fails fast with a readable error

**Phase 3 verify:**
- `curl /api/health` returns `{ status: 'ok', commit: <sha>, ... }`
- Throw an artificial error in a page → `error.tsx` renders Reset button
- Throw in `layout.tsx` → `global-error.tsx` renders
- Vercel Analytics dashboard shows traffic from a preview
- Dependabot's first PR appears within 7 days

## 11. Future work (out of scope)

- Migrating all existing pages to `siteMetadata()` (currently we only require demonstrating it on one page in Phase 2; rest is incremental).
- Per-page themed OG images (see §9).
- Component tests if/when a shared logic-bearing component (e.g., the dev panel state machine) gets complex enough.
- E2E smoke tests via Playwright on the variant gallery.
- Structured logging via a `src/lib/log.ts` wrapper. Skip until there's a real need.
- Storybook-style component catalog (the `/sandbox` route arguably already covers this for shadcn primitives).
