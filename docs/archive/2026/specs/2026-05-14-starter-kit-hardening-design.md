> Archived: 2026-05-15. Reason: implemented; retained as historical design context.
> Current source of truth: [`AGENTS.md`](../../../../AGENTS.md), [`README.md`](../../../../README.md), [`docs/KNOWLEDGEBASE.md`](../../../KNOWLEDGEBASE.md), and inline READMEs.

# Client-Reusable Base System Hardening

**Status:** Design v2 — revised to lead with agent guidance; ready for implementation plan
**Date:** 2026-05-14
**Author:** David (with assistant)
**Driver:** Lookbook is the **base system for client projects** — every new client website starts as a clone of this repo, then a non-technical (or semi-technical) client uses Claude Code to shape it via natural-language prompts (theme tweaks, copy changes, block swaps, new sections, additional pages). The risk: a client request, well-meaning but ambiguous, can ripple into architecture changes that break the design system, the build, or the contract that makes the system reusable across projects. The fix is not to lock the agent down — nothing is strictly off-limits — but to ship **comprehensive, opinionated guidance** (AGENTS.md, CLAUDE.md, supporting `docs/`, and inline READMEs) that makes the correct path obvious, the risky path visible, and the off-limits path explicit. Operational scaffolding (Husky, Vitest, CI, marketing fundamentals, observability, dep hygiene) follows as supporting infrastructure. Future evolution to a Payload CMS-backed product is in scope as a design constraint, not an implementation.

---

## 1. Context

The current repo state:

- **Stack:** Next.js 16.2.6 (App Router, Cache Components), React 19.2.4, TypeScript 5 strict, Tailwind v4, Biome 2.4 (lint + format), pnpm 10.33, Node 22 (`.nvmrc`).
- **Architecture:** 27 block files (`src/components/blocks/<type>/{editorial,saas,bold}.tsx`), one brand data file (`src/lib/brand.ts`), a four-input theme derivation engine (`src/themes/derive.ts` consuming `presets.ts` + `controller-types.ts`), a typed Leva-driven dev panel (`src/components/dev-panel/`), shadcn primitives in `src/components/ui/**`, polish primitives in `src/components/motion/`.
- **Routes:** marketing routes in `src/app/(marketing)/`, examples in `src/app/examples/`, auth/dashboard scaffolding in `src/app/{login,signup,dashboard}/`, design-system reference at `/sandbox` and `/variants`.
- **Off-bounds surface already declared** in `biome.json` `experimentalScannerIgnores`: shadcn UI primitives + the patched shadcn blocks (data-table, nav-\*, team-switcher, app-sidebar, chart-area-interactive, section-cards, site-header, login-form, signup-form).
- **Polish system documented**: `docs/UI_POLISH.md` + 17 ADRs in `docs/adr/`.
- **Workflow gaps:** no `test`, `typecheck`, `prepare` scripts; no `.husky/`; no CI workflows; no AI/agent guides at repo root (`.claude/` is local state); no `.env.example`; no centralized env validation; no marketing fundamentals (sitemap/robots/OG/metadata helper); no health route; no top-level error boundaries; no Dependabot; no `SECURITY.md`.
- **Recent commit log** (`feat(route-transition):`, `fix(dev-panel):`, `docs(shaders):`) confirms Conventional Commits are already the de facto convention.

The system is already opinionated. This spec writes those opinions down where agents and clients can see them.

## 2. Goals

Three layers, in priority order:

### 2.1 Agent guidance (the headline)

- **AGENTS.md** — the comprehensive source-of-truth orientation. Architecture map, the surface taxonomy (safe / sensitive / off-bounds), invariants, design conventions, page/block/section playbook, content-vs-structure rules, common pitfalls, forward-compat constraints. Lives at repo root; auto-loaded by Claude Code, Cursor, Aider, Codex, and other agentic tools.
- **CLAUDE.md** — a short Claude-specific pointer file at repo root: "Read `AGENTS.md` first," plus Claude-specific extras (skills, slash commands, `.claude/` local state notes, dev panel verification workflow).
- **Supporting docs:**
  - `docs/CLIENT_PLAYBOOK.md` — client-facing: "what can I ask Claude to do for me, and how should I phrase it?" with worked examples.
  - `docs/PROJECT_SETUP.md` — the per-clone checklist (rename, swap brand, set env, link Vercel, update SECURITY contact, etc.).
  - `docs/PAYLOAD_CMS_FUTURE.md` — the architectural forward-compatibility contract for the eventual CMS migration.
- **Inline READMEs:**
  - `src/themes/README.md` — how the derivation engine works, what's safe to extend, what's load-bearing.
  - `src/components/blocks/README.md` — block conventions: file structure, variant naming, data contract, when to add a 4th variant.
  - `src/components/ui/README.md` — one paragraph: "shadcn primitives — do not edit; wrap them instead."
  - `src/config/README.md` — central config patterns, env validation, when to add a new env var.

**Definition of done for this layer:** A non-technical client running Claude Code on a fresh clone gets coherent, safe responses to a representative set of prompts (see §8) without needing to be told the rules out-of-band.

### 2.2 Operational backbone

- **Vitest** with targeted unit tests on `src/themes/derive.ts` and `src/lib/color.ts` (pure logic). Component tests are out of scope.
- **Husky + commitlint** — pre-commit (biome on staged files + `tsc --noEmit` + `vitest --changed`) and commit-msg (Conventional Commits via `@commitlint/config-conventional`).
- **GitHub Actions CI** — single workflow on PR + push to main: install → biome check → tsc → vitest → next build.
- **Scripts** — add `test`, `test:watch`, `test:changed`, `typecheck`, `prepare`. Existing `dev`/`build`/`start`/`format`/`lint`/`check`/`check:polish` stay.

### 2.3 Marketing fundamentals, observability lite, dep hygiene

- **Marketing fundamentals:** `src/app/{sitemap,robots,opengraph-image,twitter-image}.tsx`, `src/lib/metadata.ts` (`siteMetadata()` helper), `src/config/site.ts`, `src/config/env.ts` (zod-validated), `.env.example`.
- **Observability lite:** `src/app/api/health/route.ts`, `src/app/error.tsx`, `src/app/global-error.tsx`, `@vercel/analytics` + `@vercel/speed-insights` mounted in root layout.
- **Dep hygiene + repo health:** `.github/dependabot.yml`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/{bug,feature}.md`.

## 3. Non-goals

- **Implementing Payload CMS integration.** Forward-compat constraints only; the migration itself is a separate spec.
- **Replacing Biome with ESLint + Prettier.** Biome stays.
- **Component tests, visual regression, E2E.** Out of scope. The dev panel + Vercel previews are the visual verification surface.
- **Sentry or third-party error monitoring.** Vercel logs + error boundaries cover it until real users land.
- **Multi-environment env split inside the repo.** Vercel handles staging/prod env separation.
- **Changesets / SemVer / CHANGELOG automation.** Lookbook isn't a published library.
- **i18n / multi-language routing.** Out of scope; would need a routing redesign.
- **`vercel.json` / `vercel.ts`.** Framework detection handles this; introduce only when crons or custom routes appear.
- **Auto-comment Vercel preview URL workflow.** Vercel's GitHub integration already does this.
- **Locking the agent down via tool denylists or programmatic guards.** The mechanism is documentation + clarity, not restriction. The agent retains full edit access; the guidance steers behavior.

## 4. Decisions resolved upfront

| Open question | Resolution |
|---|---|
| Where does the starter kit live? | **Lookbook itself.** This is hardening, not a new repo. Clients clone lookbook to start a project. |
| Lint/format | **Keep Biome.** Wire into Husky; no ESLint, no Prettier. |
| Testing framework | **Vitest.** ESM-native, Jest-API-compatible. |
| Test scope | **Pure logic only.** `src/themes/derive.ts`, `src/lib/color.ts`. No component / E2E tests. |
| Hook + CI shape | **Standard.** Local pre-commit: biome (staged) + `tsc --noEmit` + `vitest --changed`. commit-msg: commitlint. CI: full verify on PR + push-to-main. |
| Commit convention | **Conventional Commits**, enforced via `@commitlint/config-conventional`. |
| AGENTS.md vs CLAUDE.md | **AGENTS.md is source of truth.** `CLAUDE.md` is a thin pointer to AGENTS.md plus Claude-specific extras. Avoids drift. |
| Doc taxonomy | **AGENTS.md + CLAUDE.md at root, supporting docs in `docs/`, inline READMEs alongside the code they describe.** Each doc has one clear audience (agent / client / developer / forward-looking). |
| Vercel config file | **None.** Framework detection. Revisit when crons or custom routes appear. |
| Env management | **`.env.example` + zod-validated `src/config/env.ts`.** Throws at import time on missing required vars. |
| Analytics | **`@vercel/analytics` + `@vercel/speed-insights`.** Two one-liners. No GA, PostHog, Sentry at this stage. |
| Dep updates | **Dependabot** (built-in) over Renovate. Weekly, grouped by ecosystem. |
| Restriction mechanism | **Documentation, not denylists.** No tool-level guards on the agent. Invariants are written down and reinforced in AGENTS.md. |
| Per-clone configuration | **Checklist-driven** via `docs/PROJECT_SETUP.md`. No auto-rename script in v1. |
| Payload CMS handling | **Forward-compat contract in `docs/PAYLOAD_CMS_FUTURE.md`.** No CMS code today; constraints today preserve cheap migration tomorrow. |
| Rollout shape | **Three phases.** Agent guidance → operational backbone → polish. Each independently mergeable. |

## 5. The agent guidance architecture

This is the headline section. The doc set:

```
/                                # repo root
  AGENTS.md                      # NEW — source of truth, ~450 lines
  CLAUDE.md                      # NEW — pointer + Claude-specific, ~60 lines

docs/
  CLIENT_PLAYBOOK.md             # NEW — client-facing examples, ~250 lines
  PROJECT_SETUP.md               # NEW — per-clone checklist, ~120 lines
  PAYLOAD_CMS_FUTURE.md          # NEW — forward-compat contract, ~150 lines
  UI_POLISH.md                   # existing — referenced from AGENTS.md
  adr/                           # existing — referenced from AGENTS.md
  specs/                         # active specs only
  plans/                         # active plans only
    specs/...
    plans/...

src/themes/
  README.md                      # NEW — theme system handbook, ~150 lines

src/components/blocks/
  README.md                      # NEW — block conventions, ~100 lines

src/components/ui/
  README.md                      # NEW — out-of-bounds notice, ~20 lines

src/config/
  README.md                      # NEW — config + env patterns, ~80 lines
```

### 5.1 AGENTS.md content map

This is the spine. Section by section:

1. **What this is.** One paragraph: lookbook is the client-base; clones become real projects; expect to be edited by both humans and AI agents.
2. **First-time orientation.** Pointers: read this file, then `README.md`, then `docs/CLIENT_PLAYBOOK.md` if you're the human client, then `docs/PROJECT_SETUP.md` if you're spinning up a new clone. Cross-link to inline READMEs.
3. **Architecture map.** Table mirroring README's "Where to look first" but agent-oriented (file-paths, what each module owns, what depends on what). Include the cache-components note and the polish system.
4. **The surface taxonomy** (§6 of this spec — see below). Four tiers: safe / requires-care / sensitive / off-bounds.
5. **The invariants** (§7 of this spec — see below). Numbered list of rules that must hold regardless of instruction.
6. **Design conventions:**
   - 6.1 Component structure: blocks live at `src/components/blocks/<type>/<variant>.tsx`; one component default-exported per file; the variant prop is the filename.
   - 6.2 Styling: Tailwind v4 utilities, theme tokens via CSS custom properties; no hex literals in JSX or CSS modules; tabular numbers via `tabular-nums` utility; spacing snaps to the Tailwind scale (no arbitrary values for spacing unless reproducing a precise specced detail).
   - 6.3 Typography: font stack defined in `src/lib/fonts.ts`; type scale via Tailwind utilities; headings use heading-font, body uses body-font.
   - 6.4 Motion: use `FadeIn` and `Stagger` primitives from `src/components/motion/`; respect `prefers-reduced-motion`; no ad-hoc framer-motion variants outside the primitives module.
   - 6.5 Surfaces: the polish system (rings, shadows, focus rings, hit areas) is documented in `docs/UI_POLISH.md` — read it before designing new surfaces.
   - 6.6 Extending vs overriding: extend by adding a new variant file or a new theme preset; override locally only by reading existing tokens, never by hardcoding alternates.
7. **Page / section / component playbook:**
   - 7.1 "Add a new page" — exact pattern: route file at `src/app/(marketing)/<slug>/page.tsx`, compose existing blocks, use `siteMetadata({ title, description, path })`, register route in `src/lib/routes.ts` and `src/app/sitemap.ts`.
   - 7.2 "Edit copy on the home page" — go to `src/lib/brand.ts`, find the relevant field, change in place. The page reads from `brand.ts`; never inline copy in `page.tsx`.
   - 7.3 "Add a new section to a page" — import the relevant block variant, drop it into the page composition. Check `src/lib/compositions.ts` for the existing variant pairings.
   - 7.4 "Add a new block variant (e.g., 'minimal')" — clone `editorial.tsx` to `minimal.tsx` in the same folder, update the variant index, update `compositions.ts`, update the variants gallery (`src/app/(marketing)/variants/page.tsx`).
   - 7.5 "Add a new block *type* (e.g., a comparison table)" — create `src/components/blocks/<new-type>/{editorial,saas,bold}.tsx` (all three required), define its data shape in `src/lib/brand-types.ts`, add the data to `brand.ts`, export from `src/components/blocks/<new-type>/index.ts`, update compositions and the variants gallery.
   - 7.6 "Change the theme" — open the dev panel (`~`), tune inputs, save to a preset slot. To persist defaults: update `src/themes/registry.json` for built-in presets, or `src/themes/registry.json` for custom-saved themes.
   - 7.7 "Add a new dev-panel control" — use `useDevControls(group, schema)` from `src/components/dev-panel/hooks/`; never push direct Leva calls.
8. **Content vs structure:**
   - **Content edit** = string values inside `brand.ts`, image sources, anchor `href`s, button labels, semantic colors in presets. No structural risk; can be done at any time.
   - **Structural edit** = adding/removing/reordering components in a page, changing block composition, renaming exports, modifying types. Higher review weight; might need a `pnpm typecheck` pass.
   - **Architectural edit** = touching `next.config.ts`, `tsconfig.json`, `biome.json`, the theme derivation engine, the dev panel runtime, or anything in `experimentalScannerIgnores`. Requires justification + careful review.
9. **Client-request examples** (full table in §8 of this spec — AGENTS.md links to and excerpts it).
10. **Conventions:**
    - Conventional Commits (`feat/fix/docs/refactor/style/test/chore/perf/ci/build`), scope optional.
    - All env vars via `src/config/env.ts`; never `process.env.X` directly in app code.
    - All page metadata via `siteMetadata()` helper.
    - All theme reads via CSS variables / Tailwind utilities; never inline hex.
    - Three variants per block type, always.
    - Don't edit files in `experimentalScannerIgnores`.
11. **Common pitfalls:**
    - Importing client-only shaders in a Server Component without `"use client"`.
    - Bypassing `useDevControls` for dev-panel additions.
    - Hardcoding a color "just for this one section."
    - Adding new top-level deps without checking what's already available.
    - Skipping the variant-gallery update when adding a block.
    - Committing without running `pnpm check` (commit-msg will reject anyway).
12. **Forward-compat for Payload CMS** (excerpted from `docs/PAYLOAD_CMS_FUTURE.md`):
    - Content stays in `brand.ts` shapes; no string-concat or business logic in JSX for marketing copy.
    - Block components take a single typed data prop — easy to re-source from a Payload query later.
    - Page composition stays in code (it's a designer concern, not a CMS concern).
13. **Verifying changes:** `pnpm dev`, open `~` for dev panel, exercise the modified surface; `pnpm check && pnpm typecheck && pnpm test && pnpm build` before pushing.
14. **Useful commands.** Block of `pnpm` commands with one-line descriptions.

### 5.2 CLAUDE.md content map

Short, pointer-style. Sections:

1. "Read `AGENTS.md` first" — single sentence with link.
2. Claude-specific skills useful in this repo: `make-interfaces-feel-better`, `hostile-review`, `frontend-design`, `b95178c7d8df:shadcn`, `b95178c7d8df:nextjs`, `b95178c7d8df:next-cache-components`. (List the ones you actually want Claude to invoke.)
3. The `.claude/` directory is gitignored local agent state — don't commit it; don't depend on it being present.
4. Dev panel verification: when making visual changes, prefer the `preview_*` MCP tools workflow (`preview_start`, `preview_screenshot`, `preview_snapshot`) over manual browser testing.
5. Conventional Commits enforced by commitlint; the `--no-verify` flag is available but should be a last resort.
6. Pre-commit runs `lint-staged` + `tsc --noEmit` + `vitest --changed`. If pre-commit is slow on your machine, narrow `lint-staged` scope; do not bypass.

### 5.3 docs/CLIENT_PLAYBOOK.md content map

Audience: the human client running Claude Code on their cloned lookbook. Sections:

1. **What this document is.** "If you cloned lookbook for a client project and you're using Claude to make changes, this file shows you what kinds of requests work well, how to phrase them, and what to expect back."
2. **The three change categories** (with examples):
   - **Content changes** (copy, images, links, prices): low-risk, fast.
   - **Design changes** (colors, fonts, spacing, radius, motion intensity): medium-risk, applies sitewide.
   - **Structural changes** (new pages, new sections, new block variants): higher-risk, may require multiple file edits.
3. **Example requests, ordered by ambition:**
   - Tier 1: copy and small content edits.
   - Tier 2: theme + preset tweaks.
   - Tier 3: page composition changes.
   - Tier 4: new variants, new block types.
   - Tier 5: bigger-picture redesigns (worth a designer conversation first).
4. **How to phrase requests well.** Specifics over abstractions. Reference the surface ("the hero on the home page", "the testimonials section", "the pricing tier list"). Show, don't tell, when possible (paste an image, link to a reference).
5. **What Claude will probably do for each request.** Mirror of §8 in this spec.
6. **What Claude probably won't do without pushback.** Architectural changes, new top-level dependencies, edits to shadcn primitives, disabling commit hooks.
7. **When something feels wrong.** "If Claude proposes a change that looks like it touches the theme engine, the dev panel, or the build config — pause and confirm. Those are sensitive."

### 5.4 docs/PROJECT_SETUP.md content map

Audience: the developer (David, or whoever's running the agency workflow) when spinning up a new client project from lookbook. A checklist, not prose:

1. **Clone & rename.** Clone lookbook → new repo. In `package.json`: change `name`, `description`, `repository`, `homepage`, `author`. Update `LICENSE` if needed.
2. **Site config.** Edit `src/config/site.ts`: `name`, `description`, `url`, `links.github`, `navLinks`. (Phase 2 deliverable.)
3. **Brand content.** Wholesale replace `src/lib/brand.ts` with the client's content. Keep the typed shape; replace the values.
4. **Theme.** Pick a starting preset in the dev panel. Either save back to `presets.ts` (overriding the built-in) or save as a new entry in `registry.json`.
5. **Env.** Copy `.env.example` → `.env.local`. Set `NEXT_PUBLIC_SITE_URL`.
6. **Security contact.** Edit `SECURITY.md` to point to the right contact.
7. **Vercel link.** `vercel link`, set the project name, set the production domain.
8. **GitHub.** New private repo, push, configure branch protection (require CI green to merge).
9. **First custom block / page.** Run through `AGENTS.md §7` to verify the playbook works on this clone.
10. **Hand-off to client.** Send them `docs/CLIENT_PLAYBOOK.md` + the deployed preview URL. Tell them how to run Claude Code locally if they want to.

### 5.5 docs/PAYLOAD_CMS_FUTURE.md content map

Audience: future-self when migrating, plus today's agent for forward-compat checks. Sections:

1. **Context.** Lookbook will likely become CMS-backed via Payload. This doc captures the design constraints today that preserve cheap migration tomorrow.
2. **The migration trajectory.** Brand content (`src/lib/brand.ts`) becomes Payload collections. Block variants stay in code. Page composition stays in code. Theme stays in code. The dev panel stays in code (it's a tool, not content).
3. **Today's constraints to preserve forward-compat:**
   - 3.1 No string concatenation in JSX for marketing copy. `"Welcome to " + name` is harder to template than two separate fields.
   - 3.2 No business logic in JSX for content. Push transforms to `src/lib/format.ts` (or similar pure modules) so the JSX is data-binding only.
   - 3.3 Each block variant takes a single typed data prop (or destructures from a single shape). Don't sprinkle five separate string props.
   - 3.4 Images use `next/image` with URL-string sources (not imports). Future media URLs will come from Payload.
   - 3.5 The `brand.ts` shape *is* the early schema design. Be deliberate about field names.
   - 3.6 No inline `<a href="...">` for cross-page nav; use `next/link` with paths from `src/lib/routes.ts`. Routes will eventually be CMS-managed or generated.
4. **What's explicitly NOT a forward-compat constraint:**
   - The theme system. CMS-backed theming is interesting but distant; don't compromise today's derivation engine for it.
   - The dev panel. Stays a designer/developer tool.
   - The block variants. They're presentation, not content.
5. **Migration sketch (when the time comes).** Bullet-point sequence; not a plan.

### 5.6 Inline READMEs

**`src/themes/README.md`** — the theme system handbook:
- The derivation pipeline (mirrors README §How-it-works but with file-level detail).
- The four inputs: Primary, Accent, Warmth, Preset. What each controls.
- `derive.ts` is pure: any change here requires unit tests.
- `presets.ts` is where you tune the four built-in presets.
- `registry.json` is the persisted custom-theme list — humans edit this via the dev panel, not by hand (usually).
- `types.ts` + `controller-types.ts` are the contract — change with extreme care; they ripple through the dev panel typing.
- "How to add a new built-in preset" — exact code pattern.
- "How to retune an existing preset" — open dev panel, save, copy the `DerivationProfile` back into `presets.ts`.

**`src/components/blocks/README.md`** — block conventions:
- File layout: `<type>/<variant>.tsx` + an `index.ts` re-exporter per type.
- The three required variants per type (editorial/saas/bold). A fourth (cyber) is being added per the shader spec.
- Data contract: blocks read from `src/lib/brand.ts` via typed shapes in `src/lib/brand-types.ts`.
- "How to add a new variant" — clone an existing variant, register in the type's `index.ts`, update `src/lib/compositions.ts`, update the variants gallery page.
- "How to add a new block type" — file pattern, all-three-variants requirement, data shape, compositions, gallery registration.
- Don't import from `src/components/ui/**` other than the documented primitives.
- Block components are server components by default; add `"use client"` only when a hook or motion API requires it.

**`src/components/ui/README.md`** — out-of-bounds notice (~20 lines):
- These are shadcn/ui primitives, regenerated from the shadcn CLI.
- Do not edit them directly. The Biome ignore list in `biome.json` reflects this.
- To customize a shadcn primitive: create a wrapper in `src/components/<feature>/` that composes the primitive.
- Theme tokens flow through `globals.css` and are consumed by these primitives via CSS variables — that's where to make sitewide changes.

**`src/config/README.md`** — central config + env patterns (~80 lines):
- `site.ts` is the project-wide source of truth for project name, URL, navigation, social links. Read from here; don't duplicate.
- `env.ts` uses zod to validate `process.env` at module load. Add new env vars by extending the schema; document required ones in `.env.example`.
- Adding a new env var: schema first, then `.env.example`, then use via `import { env } from '@/config/env'`. Never `process.env.X` in app code.
- Public vs server: `NEXT_PUBLIC_*` prefix is bundled into the client; everything else is server-only. The schema enforces this distinction.

## 6. The surface taxonomy

This is the table that ships in AGENTS.md §4. Four tiers:

### 6.1 Safe to modify (low risk, content-level)

| Surface | Path | Typical request |
|---|---|---|
| Brand content | `src/lib/brand.ts` | Copy edits, feature lists, pricing tiers, testimonials |
| Page composition | `src/app/(marketing)/<route>/page.tsx` | Add/remove a section, swap a variant |
| Site config | `src/config/site.ts` (post-Phase 2) | Site name, nav links, social URLs |
| Active preset | `src/themes/registry.json`, dev panel | Switch starting preset, tune colors |
| Existing block variant content | `src/components/blocks/<type>/<variant>.tsx` | Visual variant tweaks within an existing variant |
| Metadata | via `src/lib/metadata.ts` helper (post-Phase 2) | Page titles, descriptions, OG tags |
| Static assets | `public/`, `assets/` | New images, favicons |
| Polish-system reference | `docs/UI_POLISH.md`, `/sandbox/polish` route | Reference reading; not normally edited |

### 6.2 Modify with care (medium risk, structural)

| Surface | Path | Why it's medium-risk |
|---|---|---|
| New page | new `src/app/(marketing)/<slug>/page.tsx` | Must register in sitemap + routes.ts |
| New block variant | new `src/components/blocks/<type>/<new-variant>.tsx` | Must update index, compositions, variants gallery |
| New theme preset | `src/themes/registry.json` | Affects all pages; needs visual review across variants |
| Routes registry | `src/lib/routes.ts` | Drives sitemap + nav; consistency matters |
| Compositions | `src/lib/compositions.ts` | Defines which variant pairings ship in `/variants` |
| Brand types | `src/lib/brand-types.ts` | Change ripples through every block consumer |
| Polish primitives | `src/components/motion/` | Used across the system; back-compat matters |
| Theme provider | `src/providers/theme-provider.tsx`, `theme-script.tsx` | No-flash logic is subtle |
| Dev panel hooks | `src/components/dev-panel/hooks/` | Typed Leva machinery; type errors propagate |
| Global styles | `src/app/globals.css` | The CSS variable contract |
| Root layout | `src/app/layout.tsx` | All routes inherit |

### 6.3 Sensitive (high risk, require explicit justification)

| Surface | Path | Why it's sensitive |
|---|---|---|
| Build config | `next.config.ts`, `tsconfig.json` | Stack defaults; ripples everywhere |
| Biome config | `biome.json` | Affects every file's lint/format |
| Package manifest | `package.json` (deps, scripts) | New deps need justification; scripts are workflow contract |
| Theme derivation engine | `src/themes/derive.ts` | Touches every rendered color; needs unit tests |
| Theme contract types | `src/themes/types.ts`, `controller-types.ts` | Type contract for dev panel + presets |
| Color math | `src/lib/color.ts` | OKLCH math; needs unit tests |
| Dev panel runtime | `src/components/dev-panel/` (non-hook files) | Complex state machine |
| Husky hooks | `.husky/*` | Workflow contract |
| CI workflow | `.github/workflows/ci.yml` | Quality gate |
| Polish-check script | `scripts/check-polish.mjs` | Load-bearing for polish discipline |
| Env schema | `src/config/env.ts` | Adding required vars affects all environments |

### 6.4 Off-bounds (don't touch directly; wrap instead)

Mirrors `experimentalScannerIgnores` in `biome.json`:

| Surface | Why off-bounds |
|---|---|
| `src/components/ui/**` | shadcn primitives, regenerated by CLI |
| `src/components/data-table.tsx` | Patched shadcn block |
| `src/components/nav-*.tsx` (documents, main, projects, secondary, user) | Patched shadcn blocks |
| `src/components/{team-switcher,app-sidebar,chart-area-interactive,section-cards,site-header}.tsx` | Patched shadcn blocks |
| `src/components/{login-form,signup-form}.tsx` | Patched shadcn blocks |
| `pnpm-lock.yaml` | Auto-managed; never hand-edit |
| `node_modules/` | Auto-managed |

To customize these: create a wrapper component in `src/components/<feature>/` that composes the primitive, and apply theme tokens / behavior changes there.

## 7. The invariants

These are the always-hold rules that ship in AGENTS.md §5. Numbered for citability:

1. **No hardcoded colors in app code.** All colors via CSS custom properties (`var(--primary)`, `var(--accent-foreground)`, etc.) or Tailwind utilities backed by them (`bg-primary`, `text-accent`). Hex literals only inside `src/themes/`, `src/lib/color.ts`, or in static image assets.
2. **All env access via `src/config/env.ts`.** Never `process.env.X` directly in app code (post-Phase 2).
3. **Conventional Commits, always.** No `wip`, no plain `update`. Enforced by commitlint; do not bypass.
4. **No new runtime dependencies without justification.** Adding to `package.json` `dependencies` requires (a) a check that no existing dep covers it, and (b) a note in the PR explaining why.
5. **shadcn primitives are read-only.** No edits to `src/components/ui/**` or the listed patched blocks. Wrap them; don't fork them.
6. **Three (or more) variants per block type, always.** Adding a block type means shipping editorial, saas, and bold variants. Skipping is a contract violation.
7. **Pages compose blocks; blocks consume brand data.** Don't inline marketing copy in `page.tsx`. Routes are presentation; copy lives in `brand.ts`.
8. **`siteMetadata()` for all page metadata** (post-Phase 2). No per-page hand-rolled OG/Twitter/canonical objects.
9. **`useDevControls(group, schema)` for dev-panel additions.** No direct Leva calls in non-hook files.
10. **No commit hooks bypassed.** `--no-verify` is for genuine emergencies, documented in the PR.
11. **Tests stay pure-logic.** Component tests are out of scope; if you find yourself writing one, escalate.
12. **`pnpm check && pnpm typecheck && pnpm test && pnpm build` before pushing.** Even though CI runs it.
13. **Forward-compat for CMS:** No string concatenation in JSX for marketing copy; no business logic in JSX. (See `docs/PAYLOAD_CMS_FUTURE.md`.)
14. **The polish-check script (`scripts/check-polish.mjs`) is load-bearing.** Don't disable or trivially relax its checks.
15. **Cache Components stays on** (`cacheComponents: true` in `next.config.ts`). It affects rendering semantics; don't toggle without understanding the implications.

## 8. Client-request playbook (excerpted into AGENTS.md §9 and docs/CLIENT_PLAYBOOK.md)

The mapping table from natural-language request to expected code change. Tiered by risk:

### Tier 1 — Content (safe, fast)

| Request | Code change | Files |
|---|---|---|
| "Change the homepage headline to *X*" | Edit a string field in brand data | `src/lib/brand.ts` |
| "Use this list of features instead" | Replace the `features` array | `src/lib/brand.ts` |
| "Show four pricing tiers instead of three" | Add an entry to `pricingTiers` | `src/lib/brand.ts` |
| "Swap the customer logos" | Update `customers` array | `src/lib/brand.ts` |
| "Change the contact email" | Update `contact` field | `src/lib/brand.ts` or `src/config/site.ts` |
| "Update the OG description" | Edit `description` in site config | `src/config/site.ts` (post-Phase 2) |

### Tier 2 — Theme (safe, sitewide)

| Request | Code change | Files |
|---|---|---|
| "Use teal as the primary color" | Update preset's `primary` or set in dev panel and save | `src/themes/registry.json` |
| "Make buttons more rounded" | Adjust `radius` in active preset | `src/themes/registry.json` |
| "Tone down the accent — use it less" | Set `accentUsage` to `rare` or `rare-plus` | `src/themes/registry.json` |
| "Change to a serif heading" | Update font choice in preset's `fonts.heading` | `src/themes/registry.json`, `src/lib/fonts.ts` |
| "More contrast" | Set `contrast: 'high'` in active preset | `src/themes/registry.json` |
| "I want a warmer feel" | Tune `warmth` upward in dev panel, save | `src/themes/registry.json` |

### Tier 3 — Composition (medium risk)

| Request | Code change | Files |
|---|---|---|
| "Use the bold variant on the homepage" | Swap variant imports | `src/app/(marketing)/page.tsx` |
| "Move testimonials above pricing" | Reorder JSX | `src/app/(marketing)/<page>.tsx` |
| "Add an FAQ section to the about page" | Import FAQ block, drop into composition | `src/app/(marketing)/about/page.tsx` |
| "Remove the careers page" | Delete route file, update routes registry, update sitemap, update navLinks | `src/app/(marketing)/careers/`, `src/lib/routes.ts`, `src/app/sitemap.ts`, `src/config/site.ts` |
| "Add a new page for our partners" | New route file, register in routes + sitemap + nav | `src/app/(marketing)/partners/page.tsx`, registry files |

### Tier 4 — Variants & new blocks (higher risk)

| Request | Code change | Files |
|---|---|---|
| "I want a fourth, minimal variant of the hero" | Clone an existing variant, register | `src/components/blocks/hero/minimal.tsx`, `hero/index.ts`, `compositions.ts`, `variants/page.tsx` |
| "Add a comparison table block" | New block type with three variants, data shape, composition entries, gallery entry | `src/components/blocks/comparison/{editorial,saas,bold}.tsx`, `comparison/index.ts`, `brand-types.ts`, `brand.ts`, `compositions.ts`, `variants/page.tsx` |
| "Add an animation when the hero loads" | Use `FadeIn` / `Stagger` primitives; do not introduce raw framer-motion variants | `src/components/blocks/hero/<variant>.tsx`, possibly `src/components/motion/` |

### Tier 5 — Architectural (high risk, push back)

| Request | What to do |
|---|---|
| "Add a CMS so editors can update copy" | Point at `docs/PAYLOAD_CMS_FUTURE.md`; flag as a major project; require explicit sign-off before starting. |
| "Make the site multi-language" | i18n is a routing redesign. Flag and require designer/developer planning first. |
| "Switch to Chakra / MUI / Mantine" | Tailwind v4 + shadcn is the contract. Push back. |
| "Disable commit hooks; they're slow" | Investigate the slowness; do not disable. |
| "Add Stripe checkout" | Possible but architectural; needs an explicit spec; flag for sign-off. |
| "Just inline this color hex here" | Invariant #1 violation; refuse and route through a theme token. |
| "Edit the shadcn primitive directly" | Invariant #5 violation; wrap instead. |

## 9. Cross-project consistency (excerpted into AGENTS.md §14)

When lookbook is cloned to become Client X's project:

**Stays consistent across all client projects:**
- Tech stack and version pins (Next.js 16, React 19, Tailwind v4, shadcn/ui, Biome, Vitest, Husky, Node 22, pnpm 10).
- Folder structure (`src/{app,components,themes,lib,config,providers,hooks}`).
- Block taxonomy (≥3 variants per type, file-naming convention).
- Theme system (the four-input derivation pipeline).
- Polish primitives + the polish-check script.
- Dev panel architecture.
- CI gates, Husky hooks, Conventional Commits.
- Agent guidance docs (AGENTS.md, CLAUDE.md, docs/, inline READMEs).

**Becomes project-specific:**
- Brand content (`src/lib/brand.ts`).
- Active preset / theme tuning.
- Site config (`src/config/site.ts`).
- Routes (additions beyond the base set; possible deletions).
- Custom block variants the client requested (a 4th `minimal.tsx`, say).
- `package.json` `name`, `description`, `repository`, `homepage`.
- `SECURITY.md` contact.
- Vercel project + domain.

**Should never diverge across projects:**
- The invariants in §7.
- The off-bounds surface in §6.4.
- The forward-compat constraints for Payload CMS in §5.5.

## 10. Operational backbone

### 10.1 Vitest

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

Add `vite-tsconfig-paths` to devDeps so `@/*` resolves in tests.

Initial test files:
- `src/themes/__tests__/derive.test.ts` — exercises `deriveTokens()`. Cases: determinism (same inputs → same outputs), range (derived semantics within OKLCH bounds), preset stamping (each of editorial/saas/bold/cyber yields distinct tokens), warmth swing (-1 vs +1 produces different neutrals), hex round-trip stability.
- `src/lib/__tests__/color.test.ts` — exercises `src/lib/color.ts`. Cases: OKLCH↔hex round-trip, vibrancy curve monotonicity, warmth-to-neutral mapping continuity, edge cases (pure black, pure white, near-greys).

Scripts in `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:changed": "vitest run --changed origin/main",
    "typecheck": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

### 10.2 Husky + commitlint

`pnpm dlx husky init`, then:

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

`commitlint.config.cjs`:
```js
module.exports = { extends: ['@commitlint/config-conventional'] }
```

`lint-staged` block in `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx,json}": ["biome check --write --no-errors-on-unmatched --files-ignore-unknown=true"]
  }
}
```

Note: `biome check --write` applies fixes; `lint-staged` re-stages them. The `--no-errors-on-unmatched` flag prevents errors when files are matched by `lint-staged` glob but ignored by Biome (the shadcn-ignored set).

### 10.3 GitHub Actions CI

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

Single job, sequential steps. Target ≤ 90s on a warm cache.

### 10.4 Vercel deployment baseline

No `vercel.json`. Framework detection covers Next.js. README's "Deploy" section gets refreshed in Phase 3 (one-click Vercel button + manual `vercel` CLI + setting `NEXT_PUBLIC_SITE_URL` in project Settings).

## 11. Marketing fundamentals

### 11.1 sitemap, robots, OG

`src/app/sitemap.ts` — reads from `src/lib/routes.ts` (existing) or a small local registry; returns `MetadataRoute.Sitemap`.

`src/app/robots.ts` — prod-aware via `VERCEL_ENV === 'production'`. Non-prod disallows everything.

`src/app/opengraph-image.tsx` — `@vercel/og`-rendered. Static-ish gradient + site name. **Limitation**: cannot read live theme CSS variables at OG render time; uses a representative gradient from the active preset's static defaults. Per-page themed OG is future work.

`src/app/twitter-image.tsx` — same image, twitter card dimensions.

### 11.2 Metadata helper

`src/lib/metadata.ts`:
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

Phase 3 requires migrating one existing page (`src/app/(marketing)/page.tsx`) to `siteMetadata()` as a working demonstration. Remaining pages migrate opportunistically post-Phase 3.

## 12. Observability lite

### 12.1 Health route

`src/app/api/health/route.ts`:
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

(Note: this is a deliberate exception to invariant #2 — the health route reads `process.env` directly because `env.ts` would throw if vars are missing on a fresh deploy, and the health route should always return.)

### 12.2 Error boundaries

`src/app/error.tsx` — per-route boundary with a Reset button, minimal UI in project typography.

`src/app/global-error.tsx` — root-level fallback (replaces `<html>` per Next.js convention).

### 12.3 Analytics

Mount in root layout (`src/app/layout.tsx`):
```tsx
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

// inside <body> just before </body>:
<Analytics />
<SpeedInsights />
```

Both no-op in dev.

## 13. Central site config + env validation

### 13.1 site.ts

`src/config/site.ts`:
```ts
import { env } from './env'

export const siteConfig = {
  name: 'Lookbook',
  description: 'A Next.js base for going from design direction to clickable page in one sitting.',
  url: env.NEXT_PUBLIC_SITE_URL,
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
  links: { github: 'https://github.com/davidvictor/lookbook' },
  navLinks: [
    { href: '/', label: 'Home' },
    { href: '/variants', label: 'Variants' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
} as const
```

### 13.2 env.ts

`src/config/env.ts`:
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

### 13.3 .env.example

```
# Public — bundled into the client
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 14. Dep hygiene + repo health

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

`SECURITY.md` — 1-paragraph intro + reporting section (security@davidvictor.me + GitHub Security Advisories tab).

`.github/ISSUE_TEMPLATE/bug.md`, `feature.md` — minimal templates.

## 15. Prerequisites — installs, by phase

Phase 1 (docs only): no new dependencies.

Phase 2 (operational backbone + central config):
```bash
pnpm add -D vitest @vitest/coverage-v8 vite-tsconfig-paths \
            husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm add zod
```

Phase 3 (marketing fundamentals + observability):
```bash
pnpm add @vercel/analytics @vercel/speed-insights @vercel/og
```

Runtime additions: `zod` (Phase 2), `@vercel/analytics` + `@vercel/speed-insights` + `@vercel/og` (Phase 3). All have negligible bundle impact — analytics is client-only and tiny, og is server-only, zod tree-shakes well.

## 16. Rollout — three phases

### Phase 1 — Agent guidance (highest priority)

The headline. Everything an agent or client needs to operate safely.

- `AGENTS.md` (full content per §5.1)
- `CLAUDE.md` (full content per §5.2)
- `docs/CLIENT_PLAYBOOK.md` (per §5.3)
- `docs/PROJECT_SETUP.md` (per §5.4)
- `docs/PAYLOAD_CMS_FUTURE.md` (per §5.5)
- `src/themes/README.md` (per §5.6)
- `src/components/blocks/README.md` (per §5.6)
- `src/components/ui/README.md` (per §5.6)
- `src/config/README.md` (per §5.6). Note: `src/config/` doesn't exist yet; create the directory and ship the README in Phase 1 with a "module ships in Phase 2" header line, so the doc is in place when the code arrives.

**Done when:** A fresh clone with these docs lets an agent answer at least 80% of the Tier 1-3 client requests in §8 correctly without rule-priming.

### Phase 2 — Operational backbone

- `vitest.config.ts` + `src/themes/__tests__/derive.test.ts` + `src/lib/__tests__/color.test.ts`
- `.husky/pre-commit`, `.husky/commit-msg`
- `commitlint.config.cjs`
- `lint-staged` block in `package.json`
- New scripts: `test`, `test:watch`, `test:changed`, `typecheck`, `prepare`
- `.github/workflows/ci.yml`
- `src/config/site.ts`, `src/config/env.ts`
- `.env.example`
- `src/lib/metadata.ts`

**Done when:** A new commit on a fresh clone triggers all hooks, PR creates a green CI run, `pnpm test` passes, env validation throws at boot on missing `NEXT_PUBLIC_SITE_URL`.

### Phase 3 — Marketing fundamentals + observability + dep hygiene

- `src/app/sitemap.ts`, `src/app/robots.ts`
- `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`
- `src/app/api/health/route.ts`
- `src/app/error.tsx`, `src/app/global-error.tsx`
- Root layout: mount `<Analytics />` and `<SpeedInsights />`
- `.github/dependabot.yml`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/bug.md`, `feature.md`
- README "Deploy" section refresh
- Migrate at least one existing page (`src/app/(marketing)/page.tsx`) to `siteMetadata()` as a demonstration.

**Done when:** `curl /api/health` on a preview deploy returns JSON with the current commit SHA; `/sitemap.xml` returns valid XML; `/robots.txt` is prod-aware; throwing in a page renders `error.tsx`; Dependabot's first PR opens within 7 days.

Each phase is its own PR. Phase 2 depends on `src/config/site.ts` from Phase 2 itself (no cross-phase ordering issue). Phase 3's marketing fundamentals read from `siteConfig` and `env`, so Phase 3 strictly requires Phase 2 first.

## 17. Risks and open questions

- **AGENTS.md drift.** A 450-line doc is a maintenance liability. Mitigation: AGENTS.md is the contract; changes to the spec require updating AGENTS.md in the same PR. A `docs:` commit type covers it cleanly.
- **Agent guidance vs. agent autonomy.** Too prescriptive = agents over-refuse; too loose = agents over-edit. Mitigation: the surface taxonomy explicitly says "nothing is strictly off-limits — escalate, don't refuse" in §6 framing. Tune the doc as we see actual interaction patterns.
- **`opengraph-image.tsx` cannot read live CSS variables.** Static representative gradient ships in v1. Per-page themed OG is future work; would require rendering theme tokens server-side.
- **`vitest --changed origin/main` on fresh branches.** If `origin/main` isn't fetched, the diff target fails. Hook script needs `git fetch origin main --depth=1` fallback, or default to running the full suite when no diff target available.
- **`lint-staged` + Biome staged-file semantics.** Biome rewrites files; `lint-staged` re-adds them. Confirm no double-write issue when `--write` is used. If problematic, split into `biome format --write` followed by `biome lint`.
- **Health route's process.env exception.** Documented in §12.1 as a deliberate carve-out; AGENTS.md invariant #2 should note this exception so future agents don't "fix" it.
- **Cross-clone divergence over time.** The §9 contract says certain things stay consistent. Without a sync mechanism (template-sync GitHub Action, or periodic rebase), client projects will drift from base lookbook over time. Mitigation: keep this spec's §9 list short and load-bearing; don't promise consistency for things that genuinely should diverge per client.
- **CLIENT_PLAYBOOK.md tone calibration.** Non-technical readers need plain language; over-explaining patronizes. Will need a draft → real-client read → revise cycle.

## 18. Test plan

### Phase 1 verify (agent guidance)

- Manual: spin up Claude Code in a fresh clone with only Phase 1 changes; issue a representative prompt set:
  - "Change the homepage headline to 'X'" → Claude edits `brand.ts`.
  - "Use teal as the primary color" → Claude updates `presets.ts`.
  - "Make buttons more rounded" → Claude updates `radius` in active preset.
  - "Add a comparison table block" → Claude scaffolds three variants, updates compositions, gallery.
  - "Edit the shadcn Button directly" → Claude refuses or proposes a wrapper.
  - "Add a CMS" → Claude points to `docs/PAYLOAD_CMS_FUTURE.md` and asks for explicit sign-off.
  - "Disable the commit hooks" → Claude pushes back per invariant #3 / #10.
- Document the responses; iterate on AGENTS.md/CLAUDE.md text until ≥80% are handled correctly without additional prompting.

### Phase 2 verify (operational backbone)

- Fresh clone → `pnpm i` → `.husky/_/` is created (`prepare` ran).
- `git commit -m "wip"` → rejected by commitlint.
- `git commit -m "chore: ok"` → accepted; runs lint-staged + tsc + vitest.
- Open a PR → CI workflow runs all four steps, green.
- Break a test on purpose → CI red.
- Remove `NEXT_PUBLIC_SITE_URL` from `.env.local` → `pnpm dev` fails at boot with a readable error.

### Phase 3 verify (marketing + observability)

- `pnpm dev` → `/sitemap.xml` returns valid XML covering all marketing routes.
- `pnpm dev` → `/robots.txt` shows `Disallow: /`.
- Preview deploy → `/robots.txt` still disallows (preview ≠ production).
- Prod deploy → `/robots.txt` allows.
- `/opengraph-image` returns a PNG of expected dimensions.
- `curl /api/health` returns `{ status: 'ok', commit: <sha>, ... }`.
- Throw an artificial error in a page → `error.tsx` renders Reset button.
- Throw in `layout.tsx` → `global-error.tsx` renders.
- Vercel Analytics dashboard shows traffic from a preview.
- Dependabot's first PR appears within 7 days.

## 19. Future work (out of scope)

- **Payload CMS integration.** Per `docs/PAYLOAD_CMS_FUTURE.md`; separate spec.
- **Migrating all pages to `siteMetadata()`.** Incremental, post-Phase 3.
- **Per-page themed OG images.** Requires rendering theme tokens server-side; non-trivial.
- **i18n / multi-language routing.** Routing redesign required.
- **Auto-rename script** for per-clone setup. `docs/PROJECT_SETUP.md` is a manual checklist for v1.
- **Template-sync GitHub Action** to pull base-lookbook changes into client clones. Worth doing once we have ≥3 active client clones.
- **Component tests** if/when a shared logic-bearing component (e.g., the dev panel state machine) grows complex enough.
- **E2E smoke tests** via Playwright on the variants gallery.
- **Structured logging** via `src/lib/log.ts` wrapper. Defer until there's a real need.
- **Storybook** — `/sandbox` and `/variants` arguably cover this already.
- **A "drift check" CI job** that diffs key files against base lookbook and flags divergence.
