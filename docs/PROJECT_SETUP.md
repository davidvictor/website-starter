# Project setup — per-clone checklist

> Use this when spinning up a new client project from Lookbook. Order matters for some steps; ordered list is followed by per-step detail.

## The checklist

1. [ ] Clone Lookbook → new private GitHub repo
2. [ ] Rename in `package.json` (name, description, repository, homepage, author)
3. [ ] Update `LICENSE` if needed
4. [ ] Update `src/config/site.ts`: name, description, url, links, navLinks
5. [ ] Replace `src/lib/brand.ts` with the client's content
6. [ ] Pick a starting preset (dev panel `~` → copy JSON into `src/themes/registry.json`)
7. [ ] Copy `.env.example` → `.env.local`, set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
8. [ ] Update `SECURITY.md` contact if this clone ships one
9. [ ] `vercel link` — connect to a new Vercel project; set production domain
10. [ ] Configure GitHub branch protection (require CI green to merge)
11. [ ] Decide whether to keep, guard, or remove the internal reference routes
12. [ ] Review [`KNOWLEDGEBASE.md`](KNOWLEDGEBASE.md) and remove/archive stale inherited plans
13. [ ] Run through representative content/theme/composition requests from [`CLIENT_PLAYBOOK.md`](CLIENT_PLAYBOOK.md) to verify the playbook works on this clone
14. [ ] Hand off [`CLIENT_PLAYBOOK.md`](CLIENT_PLAYBOOK.md) + the deployed preview URL to the client

## Detail per step

### 1. Clone & create the new repo

```bash
# Locally
git clone https://github.com/davidvictor/lookbook.git client-foo
cd client-foo
rm -rf .git
git init
git add .
git commit -m "chore: initial commit from lookbook base"

# Create the new private repo on GitHub
gh repo create davidvictor/client-foo --private --source . --push
```

Pick a name that reflects the client, not the date (`client-foo`, not `client-2026-05-14`).

### 2. Rename in `package.json`

Open `package.json` and update:

- `"name"` — kebab-case project name (e.g., `"client-foo-site"`).
- `"version"` — reset to `"0.1.0"` for a fresh project.
- `"description"` — one sentence describing what the client does.
- `"repository.url"` — the new GitHub URL.
- `"homepage"` — the new GitHub URL or production domain.
- `"author"` — your name + email.
- Keep `"private": false` if the repo is genuinely public; flip to `true` for client work.
- Keep `"license": "MIT"` unless the client requires otherwise.

### 3. Update `LICENSE`

If MIT works, just update the copyright line. Otherwise, replace the file.

### 4. Update `src/config/site.ts`

Update the `siteConfig` object:

```ts
export const siteConfig = {
  name: "Client Foo",                                  // ← the brand name
  description: "Short tagline for the client.",        // ← used in meta + OG
  url: env.NEXT_PUBLIC_SITE_URL,                       // ← driven by .env.local
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
  links: {
    github: "https://github.com/davidvictor/client-foo",
    // x: "https://x.com/clientfoo",
    // linkedin: "https://linkedin.com/company/client-foo",
  },
  navLinks: [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const
```

### 5. Replace `src/lib/brand.ts`

This is where the demo "Nimbus" copy lives. Replace **wholesale** with the client's content. Keep the typed shape from `src/lib/brand-types.ts` — TypeScript will tell you if you miss a field.

The pattern:

- Keep object keys identical to the base file.
- Replace values with the client's real copy.
- Pricing tiers, FAQ, testimonials, customer logos — every section reads from here.

If a block on the home page is irrelevant to the client (e.g., they don't want a testimonials section), remove the block from the page composition (`src/app/(marketing)/page.tsx`) rather than emptying the testimonials array.

### 6. Pick a starting preset

Two paths:

**Quick:** open `pnpm dev`, hit `~` to open the dev panel, tune Primary / Accent / Warmth, pick a preset that matches the client's brand neighborhood. Copy the resolved JSON back into `src/themes/registry.json` when the direction is worth keeping.

**Code:** edit `src/themes/registry.json` directly — each entry in `themes[]` has `inputs` (Primary / Accent / Warmth) and a `derivation` (DerivationProfile). Add a new entry for a custom theme, or override an existing one.

For a brand-new client project, treat this as a 15-minute design sprint, not a quick decision. The site's character is mostly determined here.

### 7. Set environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For the deployed site, set `NEXT_PUBLIC_SITE_URL` in Vercel project settings → Environment Variables.

### 8. Update `SECURITY.md` contact

Point at the right email for the new project. If unclear, leave at the agency contact. If the clone does not ship `SECURITY.md`, skip this step.

### 9. Link Vercel

```bash
pnpm dlx vercel link
pnpm dlx vercel domains add yourdomain.com
```

Set production environment variables in the dashboard:

- `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

For preview deploys, Vercel auto-sets `VERCEL_URL`. The `siteConfig.url` is driven by `NEXT_PUBLIC_SITE_URL` so it stays consistent.

### 10. Configure branch protection

On GitHub: Settings → Branches → Add branch protection rule for `main`:

- Require pull request before merging
- Require status checks: CI workflow
- Require branches to be up to date before merging
- (Optional) Require linear history

### 11. Internal reference routes

Lookbook ships `/sandbox`, `/variants`, `/accessibility`, `/dashboard`,
`/login`, `/signup`, and `/examples/*` inside the `(internal)` route group.
They are useful while building a client site and are noindexed by the shared
internal layout, and they are intentionally excluded from `sitemap.ts`.

Before production launch, choose one policy:

- **Keep:** leave them available but noindexed for the agency/operator.
- **Guard:** add middleware/auth before sharing the production URL broadly.
- **Remove:** delete the routes from `src/app/(internal)/` and prune matching
  entries from `src/lib/routes.ts` plus the internal sidebar config.

Do not expose these as public marketing links in a client launch unless the
client explicitly wants a visible design-system/reference area.

### 12. Knowledgebase freshness

Review [`KNOWLEDGEBASE.md`](KNOWLEDGEBASE.md) before handoff. The clone should
not inherit active plans/specs that are already complete or irrelevant to the
client. Move useful historical context to `docs/archive/<year>/`, delete
completed plans that no longer carry unique context, and update `docs/README.md`
so the current source of truth is obvious.

### 13. Smoke-test the playbook

Pick representative content and theme requests from [`CLIENT_PLAYBOOK.md`](CLIENT_PLAYBOOK.md) and run them through Claude on the fresh clone. Confirm Claude finds the right files and the changes apply cleanly. If something feels off, that's a signal to update AGENTS.md or the relevant inline README.

### 14. Hand off

Send the client:

- The preview URL (or production URL).
- A link to [`CLIENT_PLAYBOOK.md`](CLIENT_PLAYBOOK.md) — the human-facing guide for what to ask Claude.
- Instructions for running Claude Code locally if they want to (https://claude.com/claude-code).
- Optionally: a 30-minute walkthrough of the dev panel (`~`), explaining that live theme tweaks persist in localStorage until copied into `src/themes/registry.json`.

## After hand-off — keeping the project healthy

- Periodically `git pull` from the original Lookbook for upstream improvements. This will be manual until we ship a template-sync action.
- Watch for the common pitfalls in [`AGENTS.md`](../AGENTS.md) — they're the failure modes that come back across clients.
- If the client requests an architectural/high-risk change from [`CLIENT_PLAYBOOK.md`](CLIENT_PLAYBOOK.md), it's a separate engagement, not a vibe-coding session.

## Things that stay consistent across all clones

- Tech stack (Next.js 16, React 19, Tailwind v4, shadcn, Biome, Vitest, Husky, Node 22, pnpm 10).
- Folder structure (`src/{app,components,themes,lib,config,providers,hooks}`).
- Block taxonomy (≥3 variants per type, file naming convention).
- Theme system (controller-driven derivation pipeline).
- Polish primitives + the polish-check script.
- Dev panel architecture.
- CI gates, Husky hooks, Conventional Commits.
- Agent guidance docs ([`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), `docs/`, inline READMEs).
- Knowledgebase lifecycle (`docs/README.md`, `docs/KNOWLEDGEBASE.md`, active plans/specs only while current).

## Things that become project-specific

- Brand content (`src/lib/brand.ts`).
- Active preset / theme tuning.
- Site config (`src/config/site.ts`).
- Routes (additions / deletions beyond the base set).
- Custom block variants the client requested (a `minimal.tsx`, say).
- `package.json` `name`, `description`, `repository`, `homepage`.
- `SECURITY.md` contact.
- Vercel project + domain.

## Things that should never diverge

- The invariants in [`AGENTS.md`](../AGENTS.md).
- The off-bounds surface in `biome.json` `experimentalScannerIgnores`.
- The forward-compat constraints in [`PAYLOAD_CMS_FUTURE.md`](PAYLOAD_CMS_FUTURE.md).
