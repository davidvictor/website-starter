# Website Starter

A reusable Next.js starter for building polished marketing websites quickly.
Clone it for a new project, replace the seed content, tune the theme, and keep
the base updated as the starter improves over time.

The included demo company is **Nimbus**. It gives every route realistic copy,
pricing, testimonials, blog posts, jobs, FAQs, and customer stories out of the
box, so a fresh clone renders like a real website instead of a placeholder page.
New projects should replace the Nimbus data in `src/lib/brand.ts`.

## What is included

- A complete marketing site: home, pricing, about, customers, changelog, blog,
  careers, and contact.
- Three required style variants for each block type: `editorial`, `saas`, and
  `bold`.
- A controller-driven theme system that derives the token surface from primary
  color, accent color, warmth, and preset settings.
- A dev-mode floating panel, opened with `~`, for live theme and content
  controls.
- Internal review routes for the build workflow: `/variants`, `/sandbox`,
  `/accessibility`, `/dashboard`, `/login`, `/signup`, and `/examples/*`.
- A WCAG contrast audit that runs in the app at `/accessibility` and in CI with
  `pnpm audit:a11y`.
- Polish primitives for motion, surfaces, focus states, hit areas, and tabular
  numbers.
- Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, Motion, Paper Design
  Shaders, Biome, Vitest, Husky, and pnpm.

## How to use it

Use this repository as the upstream base for new websites.

1. Clone the starter into a new project repository.
2. Rename project metadata in `package.json`, `src/config/site.ts`, and
   `SECURITY.md`.
3. Replace the Nimbus seed content in `src/lib/brand.ts`.
4. Pick or tune a theme with the dev panel and persist useful presets in
   `src/themes/registry.json`.
5. Compose pages from block variants in `src/components/blocks/`.
6. Decide what to do with internal review routes before launch: keep them
   noindexed, protect them, or remove them from the deployed client site.
7. Run the verification loop that matches the change before shipping.

For a detailed clone checklist, see `docs/PROJECT_SETUP.md`.

## Quick start

```bash
git clone https://github.com/davidvictor/website-starter.git
cd website-starter
pnpm install
cp .env.example .env.local
pnpm dev
```

Set the local site URL in `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000). Press `~` to open the dev
panel.

## Common commands

```bash
pnpm dev          # next dev
pnpm build        # production build
pnpm start        # production preview after build
pnpm format       # biome format --write .
pnpm lint         # biome lint .
pnpm check        # biome check . && pnpm check:polish
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm audit:a11y   # WCAG contrast audit
```

Before a pull request or upstream starter release, run the full local chain:

```bash
pnpm check && pnpm typecheck && pnpm test && pnpm audit:a11y && pnpm build
```

## Where to look first

| Path | Purpose |
| --- | --- |
| `src/lib/brand.ts` | Nimbus seed content. Replace this for a new project. |
| `src/config/site.ts` | Site name, description, URL, nav, and social links. |
| `src/app/(marketing)/` | Public marketing routes. |
| `src/components/blocks/` | Marketing block variants organized by type. |
| `src/lib/compositions.ts` | Recommended block pairings and variant stacks. |
| `src/themes/` | Theme derivation, presets, token definitions, and audits. |
| `src/components/dev-panel/` | Dev panel runtime and typed control hooks. |
| `src/app/(internal)/variants/page.tsx` | Block variant gallery. |
| `src/app/(internal)/sandbox/` | Component and design-system review surfaces. |
| `src/app/(internal)/accessibility/page.tsx` | Live contrast audit. |
| `docs/` | Starter guidance, setup docs, ADRs, and documentation lifecycle. |
| `AGENTS.md` | Agent operating contract for this codebase. |

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Default marketing home. |
| `/editorial` | Editorial-style home composition. |
| `/bold` | Bold-style home composition. |
| `/pricing` | Pricing page. |
| `/about` | Company story page. |
| `/customers` | Customer-story page. |
| `/changelog` | Release-notes page. |
| `/blog` and `/blog/[slug]` | Blog index and sample post template. |
| `/careers` | Careers page. |
| `/contact` | Contact page and form. |

## Internal review routes

The `(internal)` route group exists to help people build, review, and maintain
projects cloned from the starter.

| Route | Purpose |
| --- | --- |
| `/variants` | Every block variant side by side. |
| `/sandbox` | Index of component review surfaces. |
| `/sandbox/{colors,typography,forms,surfaces,navigation,overlays,polish}` | Focused review pages. |
| `/sandbox/all` | One-page sandbox aggregator. |
| `/accessibility` | WCAG contrast audit across themes and modes. |
| `/examples/{motion,shaders,blocks}` | Motion, shader, and block playgrounds. |
| `/login`, `/signup`, `/dashboard` | shadcn auth and dashboard examples under the live theme. |

Internal routes are noindexed and excluded from the sitemap. Before a client
launch, choose whether they stay available, move behind auth, or are removed.

## Customizing a new project

### Content

All seed marketing content lives in `src/lib/brand.ts` and follows the typed
shape in `src/lib/brand-types.ts`. Replace fields there instead of inlining copy
inside route files or block components.

### Theme

Open the dev panel with `~`, tune Primary, Accent, Warmth, and Preset, then
persist durable choices in `src/themes/registry.json`.

The theme engine derives semantic colors, foregrounds, surfaces, focus rings,
radii, and typography from those inputs. App code should consume tokens through
Tailwind utilities or CSS variables, not hardcoded colors.

### Pages and blocks

Pages compose block variants from `src/components/blocks/`. When changing a page
direction, prefer swapping variants or updating shared content before adding
one-off local overrides.

Each block type ships the `editorial`, `saas`, and `bold` variants. New block
types should include the full required set and be added to `/variants`.

## Maintaining the starter

This repository is the living upstream base. Keep general improvements here so
future projects inherit them.

- Put reusable decisions in ADRs, READMEs, source-adjacent docs, or `AGENTS.md`.
- Keep `docs/specs/` and `docs/plans/` for active work only.
- Archive or delete stale planning artifacts once durable knowledge has moved.
- Avoid project-specific copy, routes, domains, or branding in the upstream
  starter.
- Keep clone setup docs current when workflow or tooling changes.

For downstream client projects, add this repo as an upstream remote or use your
preferred template-sync process so improvements can be merged deliberately.

## Deployment

The starter is ready for Vercel.

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`.
4. Add the production domain in Vercel settings.

No `vercel.json` is required for the default setup.

## Verification guide

- Content or docs edits: `pnpm check` and `pnpm typecheck`.
- Visual edits: inspect the affected route plus `/variants` or `/sandbox`, then
  run `pnpm check`, `pnpm typecheck`, and `pnpm audit:a11y`.
- Structural, theme, or runtime edits: run `pnpm check`, `pnpm typecheck`,
  `pnpm test`, `pnpm audit:a11y`, and `pnpm build`.
- PRs and upstream base changes should match CI locally whenever practical.

## License

MIT - see `LICENSE`.
