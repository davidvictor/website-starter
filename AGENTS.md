# AGENTS.md

> Agent-oriented orientation for this codebase. Read this first.

## 1. What this is

Lookbook is the **base system** that every client website starts from. It ships:

- A full marketing-site composition (12 routes, 9 block types × 3 variants = 27 block files).
- A four-input theme derivation engine (Primary, Accent, Warmth, Preset → entire token surface).
- A typed Leva-driven dev panel (toggle with `~`) for live theming and content tweaks.
- The polish system documented in [`docs/UI_POLISH.md`](docs/UI_POLISH.md) + 17 ADRs in [`docs/adr/`](docs/adr/).

The repo is designed to be **cloned per client project**. Clients (and the developer running the agency) then use Claude Code to make changes via natural-language prompts — design tweaks, copy edits, new pages, new block variants. This document captures the conventions, invariants, and playbook that make those changes safe.

**There is no programmatic guardrail.** Nothing is strictly off-limits — this is a documentation contract, not a denylist. Your job as the agent is to follow these conventions, surface them when an instruction conflicts with them, and propose corrections rather than just refusing.

## 2. First-time orientation

In order:

1. **This file** end-to-end. It's the contract.
2. [`README.md`](README.md) — the human-facing project pitch (architecture diagram, "Where to look first," tech stack).
3. If you're the human client running Claude: [`docs/CLIENT_PLAYBOOK.md`](docs/CLIENT_PLAYBOOK.md) — what kinds of requests work well and how to phrase them.
4. If you're setting up a new clone for a client project: [`docs/PROJECT_SETUP.md`](docs/PROJECT_SETUP.md) — the per-clone checklist.
5. If you're working in `src/themes/`, `src/components/blocks/`, `src/components/ui/`, or `src/config/`, read the local README first.
6. Forward-compat context for the eventual Payload CMS migration: [`docs/PAYLOAD_CMS_FUTURE.md`](docs/PAYLOAD_CMS_FUTURE.md). It shapes how content is structured today.

## 3. Architecture map

| Path | What's there | Edit posture |
|---|---|---|
| `src/app/(marketing)/` | All marketing routes — home + variant homes + pricing/about/customers/changelog/blog/careers/contact + variants gallery | Safe |
| `src/app/(marketing)/page.tsx` | Default SaaS-variant home | Safe |
| `src/app/(marketing)/{editorial,bold}/page.tsx` | Sister homepages composed from other variants | Safe |
| `src/app/(marketing)/variants/page.tsx` | Block × style gallery — keep in sync when adding/removing variants | Care |
| `src/components/blocks/` | 27 block files: `<type>/{editorial,saas,bold}.tsx` per type. See [`src/components/blocks/README.md`](src/components/blocks/README.md) | Safe to edit; Care to add/remove |
| `src/components/dev-panel/` | The typed dev panel — uses `useDevControls(group, schema)` from `dev-panel/hooks/` | Care (hooks) / Sensitive (runtime) |
| `src/components/ui/` | shadcn primitives — **off-bounds** for direct edit. See [`src/components/ui/README.md`](src/components/ui/README.md) | Off-bounds |
| `src/components/motion/` | Polish primitives (`FadeIn`, `Stagger`, etc.) | Care |
| `src/components/shaders/` | Paper Design shader wrappers + the themed shader library | Care |
| `src/themes/` | OKLCH derivation engine — `derive.ts`, `tokens.ts`, `registry.ts`, `registry.json`, `derivation-axes.ts`, `types.ts`, `controller-types.ts`. See [`src/themes/README.md`](src/themes/README.md) | Sensitive |
| `src/lib/brand.ts` | All Nimbus copy in one file — swap per prototype | Safe |
| `src/lib/color.ts` | OKLCH math, hex conversions, vibrancy/warmth | Sensitive |
| `src/lib/{routes,fonts,format,utils,compositions}.ts` | Cross-cutting helpers | Care |
| `src/lib/brand-types.ts` | Brand data TypeScript shape — used by every block | Care |
| `src/providers/{theme-provider,theme-script}.tsx` | No-flash theme bootstrapping | Care |
| `src/config/` (post-Phase 2) | `site.ts`, `env.ts` — central config + zod-validated envs. See [`src/config/README.md`](src/config/README.md) | Care |
| `src/hooks/` | Custom hooks (e.g., `use-mobile.ts`) | Care |
| `src/app/layout.tsx`, `src/app/(marketing)/layout.tsx` | Root + marketing layouts | Care |
| `next.config.ts`, `tsconfig.json`, `biome.json` | Build / type / lint config | Sensitive |
| `scripts/check-polish.mjs` | The polish discipline script — load-bearing | Sensitive |
| `docs/UI_POLISH.md`, `docs/adr/` | Polish system documentation | Reference |

**Cache Components** is enabled (`cacheComponents: true` in `next.config.ts`). It affects rendering semantics; don't toggle without understanding the implications.

## 4. Surface taxonomy

Four tiers, from most to least free:

### 4.1 Safe (low risk, content-level)

Edit freely:

| Surface | Path | Typical request |
|---|---|---|
| Brand content | `src/lib/brand.ts` | Copy edits, feature lists, pricing tiers, testimonials |
| Page composition | `src/app/(marketing)/<route>/page.tsx` | Add/remove a section, swap a variant |
| Site config | `src/config/site.ts` (post-Phase 2) | Site name, nav links, social URLs |
| Active preset | `src/themes/registry.json`, dev panel | Switch starting preset, tune colors |
| Existing block variant content | `src/components/blocks/<type>/<variant>.tsx` | Visual tweaks within an existing variant |
| Page metadata | via `src/lib/metadata.ts` (post-Phase 3) | Page titles, descriptions, OG tags |
| Static assets | `public/`, `assets/` | New images, favicons |

### 4.2 Care (medium risk, structural)

Possible but ripples — confirm scope:

| Surface | Path | Why it's medium-risk |
|---|---|---|
| New page | new `src/app/(marketing)/<slug>/page.tsx` | Must register in sitemap + `src/lib/routes.ts` |
| New block variant | new `src/components/blocks/<type>/<new>.tsx` | Must update index, `src/lib/compositions.ts`, variants gallery |
| New theme preset | `src/themes/registry.json` | Affects all pages; needs visual review across variants |
| Routes registry | `src/lib/routes.ts` | Drives sitemap + nav |
| Compositions | `src/lib/compositions.ts` | Variant pairings shown in `/variants` |
| Brand types | `src/lib/brand-types.ts` | Change ripples through every block consumer |
| Polish primitives | `src/components/motion/` | Used across the system |
| Theme provider | `src/providers/{theme-provider,theme-script}.tsx` | No-flash logic is subtle |
| Dev panel hooks | `src/components/dev-panel/hooks/` | Typed Leva machinery |
| Global styles | `src/app/globals.css` | The CSS variable contract |
| Root layout | `src/app/layout.tsx` | All routes inherit |

### 4.3 Sensitive (high risk, require explicit justification)

Don't touch without a clear reason — and surface that reason in the PR description:

| Surface | Path | Why sensitive |
|---|---|---|
| Build config | `next.config.ts`, `tsconfig.json` | Stack defaults; ripples everywhere |
| Biome config | `biome.json` | Lint/format for every file |
| Package manifest | `package.json` (deps, scripts) | Workflow contract; new deps need justification |
| Theme derivation engine | `src/themes/derive.ts` | Touches every rendered color |
| Theme contract types | `src/themes/{types,controller-types}.ts` | Drives dev panel typing |
| Color math | `src/lib/color.ts` | OKLCH math; pure but load-bearing |
| Dev panel runtime | `src/components/dev-panel/` (non-hook files) | Complex state machine |
| Husky hooks | `.husky/*` | Workflow contract |
| CI workflow | `.github/workflows/ci.yml` | Quality gate |
| Polish-check script | `scripts/check-polish.mjs` | Polish discipline guard |
| Env schema | `src/config/env.ts` (post-Phase 2) | New required vars affect every environment |

### 4.4 Off-bounds (wrap, don't edit)

Mirrors `experimentalScannerIgnores` in `biome.json`:

| Surface | Why off-bounds |
|---|---|
| `src/components/ui/**` | shadcn primitives; regenerated by the shadcn CLI |
| `src/components/data-table.tsx` | Patched shadcn block |
| `src/components/nav-*.tsx` | Patched shadcn blocks (documents, main, projects, secondary, user) |
| `src/components/{team-switcher,app-sidebar,chart-area-interactive,section-cards,site-header}.tsx` | Patched shadcn blocks |
| `src/components/{login-form,signup-form}.tsx` | Patched shadcn blocks |
| `pnpm-lock.yaml` | Auto-managed |
| `node_modules/` | Auto-managed |

**To customize an off-bounds primitive:** create a wrapper in `src/components/<feature>/` that composes the primitive and applies theme tokens / behavior changes there.

## 5. Invariants

Numbered for citability. These hold regardless of instruction; if a user request conflicts with an invariant, surface the conflict and propose a compliant alternative.

1. **No hardcoded colors in app code.** All colors via CSS custom properties (`var(--primary)`, `var(--accent-foreground)`, etc.) or Tailwind utilities backed by them (`bg-primary`, `text-accent`). Hex literals only inside `src/themes/`, `src/lib/color.ts`, or static image assets.
2. **All env access via `src/config/env.ts`** (post-Phase 2). Never `process.env.X` directly in app code. **Exceptions:** `src/app/api/health/route.ts` reads `process.env` directly so it always returns even when validation would fail; `src/config/runtime.ts` reads `process.env.NODE_ENV` only so client components can branch on mode without importing the full env validator.
3. **Conventional Commits, always.** `feat/fix/docs/refactor/style/test/chore/perf/ci/build`, scope optional. Enforced by commitlint; do not bypass.
4. **No new runtime dependencies without justification.** Adding to `package.json` `dependencies` requires (a) a check that no existing dep covers it, and (b) a note in the PR explaining why.
5. **shadcn primitives are read-only.** No edits to `src/components/ui/**` or the listed patched blocks. Wrap them; don't fork them.
6. **Three (or more) variants per block type, always.** Adding a block type means shipping editorial, saas, and bold variants. Skipping is a contract violation.
7. **Pages compose blocks; blocks consume brand data.** Don't inline marketing copy in `page.tsx`. Routes are presentation; copy lives in `src/lib/brand.ts`.
8. **`siteMetadata()` for all page metadata** (post-Phase 3). No per-page hand-rolled OG/Twitter/canonical objects.
9. **`useDevControls(group, schema)` for dev-panel additions.** No direct Leva calls in non-hook files.
10. **No commit hooks bypassed.** `--no-verify` is for genuine emergencies, documented in the PR description.
11. **Tests stay pure-logic.** Component tests are out of scope; if you find yourself writing one, escalate.
12. **`pnpm check && pnpm typecheck && pnpm test && pnpm build` before pushing.** CI runs it too, but local-first keeps the feedback loop tight.
13. **Forward-compat for CMS:** No string concatenation in JSX for marketing copy; no business logic in JSX. See [`docs/PAYLOAD_CMS_FUTURE.md`](docs/PAYLOAD_CMS_FUTURE.md).
14. **The polish-check script (`scripts/check-polish.mjs`) is load-bearing.** Don't disable or trivially relax its checks.
15. **Cache Components stays on** (`cacheComponents: true` in `next.config.ts`). It affects rendering semantics; don't toggle without understanding the implications.

## 6. Design conventions

### 6.1 Component structure

- Blocks live at `src/components/blocks/<type>/<variant>.tsx`.
- One component default-exported per file. The export name follows the file: `hero/saas.tsx` → `export default function SaasHero(...)`.
- Each type has an `index.ts` re-exporting all variants and a default.
- Block components are server components by default. Add `"use client"` only when a hook or motion API requires it (typically the interactive shader heroes).

### 6.2 Styling

- **Tailwind v4** utilities. Theme tokens consumed via CSS variables (`bg-primary`, `text-foreground`, `border-border`) or `var(--*)` directly when not on a utility.
- **No hex literals in JSX or CSS modules.** Hex is only allowed in `src/lib/color.ts` (color math) and `src/themes/derive.ts` (the engine). Theme inputs in `src/themes/registry.json` are stored as hue + vibrancy numerics, not hex — paste hex into the dev panel and it auto-decomposes.
- **No arbitrary spacing values** (`p-[13px]`) unless reproducing a precise specced detail. Snap to the Tailwind scale.
- **Tabular numbers** via `tabular-nums` utility wherever digits align (pricing tables, stats, dashboards).
- **Borders + radius** from theme tokens (`rounded-lg`, `border`) — radius is a derivation output, never per-component magic.

### 6.3 Typography

- Font stack defined in `src/lib/fonts.ts`. Heading vs body fonts are theme outputs; the preset's `DerivationProfile` picks them.
- Type scale via Tailwind utilities (`text-4xl`, `text-lg`, etc.). No arbitrary `text-[19.2px]`.
- Headings use the heading font; body uses the body font. The `<html>` element applies them as CSS variables.

### 6.4 Motion

- Use `FadeIn` and `Stagger` from `src/components/motion/`. Don't introduce raw `framer-motion` variants outside the primitives module.
- Respect `prefers-reduced-motion`. The primitives already do; don't override.

### 6.5 Surfaces (polish system)

Cards, surfaces, focus rings, hit areas, and tabular numbers are documented in [`docs/UI_POLISH.md`](docs/UI_POLISH.md). Read it before designing new surfaces; reference the live `/sandbox/polish` page for every primitive side-by-side.

### 6.6 Extending vs overriding

- **Extend** by adding a new variant file or a new theme preset. The system is variant-and-preset-driven; new is cheap.
- **Override locally** only by reading existing tokens (e.g., compose `bg-card` + `text-card-foreground`), never by hardcoding alternates.
- If a real one-off override is needed, add a new semantic token in the theme derivation — don't sprinkle hex.

## 7. Page / section / component playbook

The exact patterns for the most common changes:

### 7.1 Add a new page

1. Create `src/app/(marketing)/<slug>/page.tsx`.
2. Compose existing blocks. Pattern:
   ```tsx
   import HeroSaas from "@/components/blocks/hero/saas"
   import FeaturesSaas from "@/components/blocks/features/saas"
   import CtaSaas from "@/components/blocks/cta/saas"
   import { siteMetadata } from "@/lib/metadata" // post-Phase 3

   export const metadata = siteMetadata({
     title: "Pricing",
     description: "Plans and pricing for Nimbus.",
     path: "/pricing",
   })

   export default function PricingPage() {
     return (
       <>
         <HeroSaas />
         <FeaturesSaas />
         <CtaSaas />
       </>
     )
   }
   ```
3. Add the route to `src/lib/routes.ts` (if a registry pattern is present) and to `src/app/sitemap.ts` (post-Phase 3).
4. Add to nav: `src/config/site.ts` `navLinks` (post-Phase 2).

### 7.2 Edit copy on the home page

1. Find the relevant field in `src/lib/brand.ts`.
2. Edit in place. The page reads from `brand.ts`; never inline copy in `page.tsx`.
3. If the copy doesn't yet have a field (it's currently inlined somewhere), add the field to `brand.ts`, update `brand-types.ts` if shape changes, and reference from the block.

### 7.3 Add a new section to a page

1. Pick the block + variant that matches: import from `@/components/blocks/<type>/<variant>`.
2. Drop it into the page composition between existing blocks.
3. Check `src/lib/compositions.ts` for which variants pair well — the gallery (`/variants`) is the live reference.

### 7.4 Add a new block variant (e.g., a 4th `minimal`)

1. Clone an existing variant: `cp src/components/blocks/hero/editorial.tsx src/components/blocks/hero/minimal.tsx`.
2. Edit `minimal.tsx` for the new design.
3. Export it from the type's `index.ts`.
4. Update `src/lib/compositions.ts` if the new variant should appear in any composition.
5. Update `src/app/(marketing)/variants/page.tsx` to include the new variant in the gallery.
6. The expectation per invariant #6 is **three variants minimum**; a fourth is allowed and may stay project-specific.

### 7.5 Add a new block *type* (e.g., a comparison table)

This is a larger move. All of:

1. Create `src/components/blocks/comparison/{editorial,saas,bold}.tsx` — all three required.
2. Create `src/components/blocks/comparison/index.ts` re-exporting all three.
3. Add the data shape to `src/lib/brand-types.ts`.
4. Add example data to `src/lib/brand.ts`.
5. Add to `src/lib/compositions.ts`.
6. Add to `src/app/(marketing)/variants/page.tsx` gallery.
7. Use it on at least one page so it's visually exercised.

### 7.6 Change the theme

- **Quick tune:** open the dev panel (`~`), adjust Primary / Accent / Warmth / Preset, save to a slot.
- **Persist as a built-in:** update `src/themes/registry.json` for the four built-in presets (editorial/saas/bold/cyber).
- **Persist as a custom theme:** save via the dev panel; it writes to `src/themes/registry.json`.

### 7.7 Add a new dev-panel control

Use `useDevControls(group, schema)` from `src/components/dev-panel/hooks/`. Pattern:

```tsx
const { value } = useDevControls("MyFeature", {
  intensity: { value: 1, min: 0, max: 2, step: 0.1 },
})
```

Never push direct Leva calls in non-hook files (invariant #9).

## 8. Content vs structure

Three categories, in increasing risk:

- **Content edit.** String values inside `src/lib/brand.ts`, image sources, anchor `href`s, button labels, semantic colors in presets. No structural risk. Examples: "change the tagline," "use these new logos," "set the price to $29."
- **Structural edit.** Adding/removing/reordering components in a page, changing block composition, renaming exports, modifying types. Higher review weight. Run `pnpm typecheck` before pushing. Examples: "move testimonials above pricing," "add an FAQ section to the about page," "remove the careers page."
- **Architectural edit.** Anything in §4.3 Sensitive or §4.4 Off-bounds. Requires justification + careful review. Examples: changing `next.config.ts`, editing `derive.ts`, adding a new top-level dependency.

When in doubt, ask the requester whether they understand which category their request falls into.

## 9. Client-request examples

What a typical request maps to in code. Five tiers, ordered by risk. See also [`docs/CLIENT_PLAYBOOK.md`](docs/CLIENT_PLAYBOOK.md) for the human-facing version.

### Tier 1 — Content (safe, fast)

| Request | Files |
|---|---|
| "Change the homepage headline to *X*" | `src/lib/brand.ts` |
| "Use this list of features instead" | `src/lib/brand.ts` |
| "Show four pricing tiers instead of three" | `src/lib/brand.ts` |
| "Swap the customer logos" | `src/lib/brand.ts` |
| "Change the contact email" | `src/lib/brand.ts` or `src/config/site.ts` |
| "Update the OG description" | `src/config/site.ts` (post-Phase 2) |

### Tier 2 — Theme (safe, sitewide)

| Request | Files |
|---|---|
| "Use teal as the primary color" | `src/themes/registry.json` (or dev panel + save) |
| "Make buttons more rounded" | `src/themes/registry.json` (`radius`) |
| "Tone down the accent — use it less" | `src/themes/registry.json` (`accentUsage`) |
| "Change to a serif heading" | `src/themes/registry.json` (`fonts.heading`), maybe `src/lib/fonts.ts` |
| "More contrast" | `src/themes/registry.json` (`contrast`) |
| "I want a warmer feel" | `src/themes/registry.json` (`warmth` input) |

### Tier 3 — Composition (medium risk)

| Request | Files |
|---|---|
| "Use the bold variant on the homepage" | `src/app/(marketing)/page.tsx` |
| "Move testimonials above pricing" | `src/app/(marketing)/<page>.tsx` |
| "Add an FAQ section to the about page" | `src/app/(marketing)/about/page.tsx` |
| "Remove the careers page" | `src/app/(marketing)/careers/`, `src/lib/routes.ts`, `src/app/sitemap.ts`, `src/config/site.ts` |
| "Add a new page for our partners" | `src/app/(marketing)/partners/page.tsx` + registry files |

### Tier 4 — Variants & new blocks (higher risk)

| Request | Files |
|---|---|
| "I want a fourth, minimal variant of the hero" | `src/components/blocks/hero/minimal.tsx`, `hero/index.ts`, `compositions.ts`, `variants/page.tsx` |
| "Add a comparison table block" | New `src/components/blocks/comparison/{editorial,saas,bold}.tsx` + `index.ts` + `brand-types.ts` + `brand.ts` + `compositions.ts` + `variants/page.tsx` |
| "Add an animation when the hero loads" | `src/components/blocks/hero/<variant>.tsx` using `FadeIn`/`Stagger` from `src/components/motion/` |

### Tier 5 — Architectural (high risk, push back)

| Request | Response |
|---|---|
| "Add a CMS so editors can update copy" | Point at [`docs/PAYLOAD_CMS_FUTURE.md`](docs/PAYLOAD_CMS_FUTURE.md); flag as a major project; require explicit sign-off before starting. |
| "Make the site multi-language" | i18n is a routing redesign. Flag and require designer/developer planning first. |
| "Switch to Chakra / MUI / Mantine" | Tailwind v4 + shadcn is the contract. Push back; explain the cost. |
| "Disable commit hooks; they're slow" | Investigate the slowness; do not disable. Per invariant #10. |
| "Add Stripe checkout" | Possible but architectural; needs an explicit spec; flag for sign-off. |
| "Just inline this color hex here" | Invariant #1 violation. Refuse and route through a theme token. |
| "Edit the shadcn Button directly" | Invariant #5 violation. Wrap it instead. |

## 10. Conventions

- **Commits:** Conventional Commits — `feat/fix/docs/refactor/style/test/chore/perf/ci/build`. Scope optional but encouraged (e.g., `feat(hero): add minimal variant`). Enforced by commitlint.
- **Env vars:** `import { env } from "@/config/env"` (post-Phase 2). Never `process.env.X` in app code. Health route and the `NODE_ENV`-only runtime helper are the documented exceptions.
- **Page metadata:** `import { siteMetadata } from "@/lib/metadata"` (post-Phase 3). Pass `{ title, description, path }`.
- **Theme reads:** CSS variables (`var(--primary)`) or Tailwind utilities (`bg-primary`). No hex.
- **Block variants:** three minimum per type. File names = variant names.
- **Dev panel:** `useDevControls(group, schema)` for any new control.
- **Off-bounds files:** never edit. Wrap. The Biome ignore list in `biome.json` is the authoritative list.

## 11. Common pitfalls

- **Importing client-only code in a Server Component without `"use client"`.** Shaders, motion APIs, Leva, anything stateful needs the directive on the consuming file.
- **Bypassing `useDevControls` for dev-panel additions.** Direct Leva calls break the typed state machine.
- **Hardcoding a color "just for this one section."** That's invariant #1. Use or add a theme token.
- **Adding new top-level deps without checking what's already available.** Look in `package.json` first. The repo already ships Motion, shaders, Base UI, dnd-kit, sonner, recharts, etc.
- **Skipping the variants-gallery update when adding a block variant.** The gallery is the contract that "every variant is visible side-by-side."
- **Committing without running the local check chain.** `pnpm check && pnpm typecheck && pnpm test` first; the commit hook will catch you otherwise.
- **Editing `src/components/ui/**` directly.** The Biome ignore list lets the change pass; the next shadcn CLI upgrade will obliterate it. Wrap instead.

## 12. Forward-compat for Payload CMS

Lookbook will likely become CMS-backed via Payload. The constraints below today preserve a cheap migration tomorrow. Full doc: [`docs/PAYLOAD_CMS_FUTURE.md`](docs/PAYLOAD_CMS_FUTURE.md).

- **Content lives in `src/lib/brand.ts`** with discrete typed fields. No string concatenation in JSX for marketing copy (`"Welcome to " + name` is harder to template than two fields).
- **No business logic in JSX for content.** Transforms go in `src/lib/format.ts` (or similar pure modules).
- **Block components take a single typed data prop** (or destructure from a single shape). Don't sprinkle five separate string props.
- **Images use `next/image` with URL-string sources** (not imports). Future media URLs will come from Payload.
- **The `brand.ts` shape *is* the early schema design.** Be deliberate about field names.
- **Cross-page nav uses `next/link` with paths from `src/lib/routes.ts`.** Routes will eventually be CMS-managed or generated.

## 13. Verifying changes

After making changes, before declaring done:

1. `pnpm dev` — open the modified surface in the browser. Toggle the dev panel with `~`.
2. If the change is visual, exercise the relevant block in all three variants (`/`, `/editorial`, `/bold`).
3. `pnpm check` — Biome lint + format + the polish-check script.
4. `pnpm typecheck` — `tsc --noEmit`.
5. `pnpm test` — Vitest (post-Phase 2).
6. `pnpm build` — Next.js production build.

If you're using Claude Code with the `preview_*` MCP tools, prefer them over manual browser testing for visual verification (`preview_start`, `preview_screenshot`, `preview_snapshot`, `preview_inspect`).

## 14. Working in worktrees

For isolated parallel work — long-running features, risky refactors, anything you don't want to interrupt the current branch with — use git worktrees rather than stashing or branch-switching.

- **Location:** `.worktrees/<branch-name>/` (already gitignored at the repo root). Don't put worktrees elsewhere; the gitignore entry is the contract.
- **Create:** `git worktree add .worktrees/<branch-name> -b <branch-name>`
- **Set up:** `cd .worktrees/<branch-name>` then `pnpm install`. Worktrees share `.git/` but each needs its own `node_modules/`.
- **Verify clean baseline:** Before touching anything, run `pnpm check && pnpm typecheck && pnpm test` so any later failures are unambiguously yours.
- **Cleanup:** `git worktree remove .worktrees/<branch-name>` once the branch is merged or abandoned. Stale worktrees pin `.git/` objects.
- **List:** `git worktree list` to see what's active.

Every invariant in §5 applies identically inside a worktree — same commit hooks, same Conventional Commit format, same surface tiers.

## 15. Useful commands

```bash
pnpm dev          # next dev
pnpm build        # next build
pnpm start        # next start (production-mode preview locally)
pnpm format       # biome format --write .
pnpm lint         # biome lint .
pnpm check        # biome check . && pnpm check:polish
pnpm check:polish # node scripts/check-polish.mjs
pnpm typecheck    # tsc --noEmit (post-Phase 2)
pnpm test         # vitest run (post-Phase 2)
pnpm test:watch   # vitest (post-Phase 2)
pnpm test:changed # vitest run --changed origin/main (post-Phase 2)
```
