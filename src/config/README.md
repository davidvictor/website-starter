# `src/config/` — central config + env

> **Module ships in Phase 2 of the starter-kit-hardening plan.** This README is in place; the `site.ts` and `env.ts` modules land alongside it.

## What's here

| File | Role |
|---|---|
| `site.ts` | Project-wide source of truth: `name`, `description`, `url`, `links`, `navLinks` |
| `env.ts` | zod-validated access to `process.env`. Throws at import time if a required var is missing. |
| `runtime.ts` | Client-safe runtime mode helper for `NODE_ENV` only. Do not add app-specific env vars here. |

## Why

Three things were getting awkward without a central config:

1. **Project name lived in three places** — `package.json`, the document `<title>`, the footer copyright. Per-clone, that's three edits to remember.
2. **`process.env.X` was sprinkled across the app.** No type safety, no fail-fast on missing vars, no clear "what envs does this project need."
3. **Site URL was hardcoded** for OG / canonical / sitemap. Different per environment, but each consumer figured it out independently.

`site.ts` collapses (1) and (3). `env.ts` solves (2).

## Using `site.ts`

```tsx
import { siteConfig } from "@/config/site"

<footer>© {siteConfig.name} 2026</footer>
<nav>
  {siteConfig.navLinks.map((link) => (
    <Link key={link.href} href={link.href}>{link.label}</Link>
  ))}
</nav>
```

The shape (post-Phase 2):

```ts
export const siteConfig = {
  name: "Lookbook",                              // Brand / project name
  description: "…",                              // One-sentence pitch (used in meta)
  url: env.NEXT_PUBLIC_SITE_URL,                 // Base URL (no trailing slash)
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
  links: { github: "…" },
  navLinks: [{ href: "/", label: "Home" }, …],
} as const
```

When cloning for a client, update this file in [`PROJECT_SETUP.md`](../../docs/PROJECT_SETUP.md) step 4.

## Using `env.ts`

```ts
import { env } from "@/config/env"

const siteUrl = env.NEXT_PUBLIC_SITE_URL    // typed, validated, never undefined
```

**Never** `process.env.NEXT_PUBLIC_SITE_URL` directly in app code. The schema in `env.ts` validates at module load — missing or malformed values throw before the app even starts.

The schema (post-Phase 2):

```ts
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),                                  // required
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(), // Vercel-injected
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),                            // Vercel-injected
})
```

## Adding a new env var

1. **Extend the schema** in `env.ts`. Required vs optional matters — required vars throw on missing; optional vars are `T | undefined`.
2. **Document it in `.env.example`** at the repo root with a one-line comment explaining what it's for.
3. **Use it via `env.X`** — never `process.env.X`.
4. **For client-side vars, prefix with `NEXT_PUBLIC_`** so Next.js bundles them into the client. The schema enforces nothing here — Next.js does — but be deliberate: client-side vars are visible to anyone who views your source.

## Documented exceptions

`src/app/api/health/route.ts` reads `process.env` directly because the health route must respond even when `env.ts` validation would throw. If `NEXT_PUBLIC_SITE_URL` is missing in production, you want the health route to return `{ status: "ok" }` so the platform's healthcheck still passes — you don't want the entire app to crash at module load and the healthcheck to fail too.

`src/config/runtime.ts` reads `process.env.NODE_ENV` only. Next inlines that
value in client bundles, which makes it safe for client components that need a
development/production mode branch. Do not import `env.ts` into client
components; full env validation belongs on server-only config paths.

These are the only files allowed to read `process.env` directly. The exception
is documented in [`AGENTS.md`](../../AGENTS.md) §5 invariant #2.

## Public vs server

- `NEXT_PUBLIC_*` → bundled into the client JS. Visible to users.
- Everything else → server-only. Never sent to the client.

The schema is the contract; respect the naming convention so the contract is enforceable by inspection.

## See also

- [`AGENTS.md`](../../AGENTS.md) §5 invariant #2 — the env access rule.
- [`docs/PROJECT_SETUP.md`](../../docs/PROJECT_SETUP.md) §7 — env setup for new clones.
- `.env.example` at the repo root — the human-readable list of required + optional vars.
