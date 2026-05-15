# Client playbook

> A practical guide to asking Claude Code to make changes to your website. Plain-language, with worked examples.

## What this is

You cloned a website from the **Website Starter**, and you're using **Claude Code** or another coding agent to make changes — copy edits, design tweaks, new pages, new sections. This document shows what kinds of requests work well, how to phrase them, and what to expect back.

Claude follows a set of conventions documented in [`AGENTS.md`](../AGENTS.md). You don't need to read that file — but knowing it exists explains why Claude sometimes says "let me put this in the brand file" instead of editing the visible page directly. Those conventions are what keeps the site stable when you make a lot of changes quickly.

**There's no list of forbidden requests.** Some requests are smaller than others; some ripple across the site; a few are big enough that Claude will pause and ask "are you sure?" before starting. This document orients you so you know which is which.

## The three change categories

Most requests fall into one of three buckets.

### Content changes — small, fast, safe

Things like:

- "Change the headline on the home page."
- "Update the pricing to $29 / $79 / $199."
- "Use these new customer logos."
- "Change the contact email."
- "Rewrite the FAQ answers in our brand voice."

These are edits to your *words and numbers*. They live in one file and don't change how the site is structured. They're fast (seconds to a minute) and very safe.

### Design changes — also fast, but they touch the whole site

Things like:

- "Use teal as our brand color."
- "Make everything more rounded."
- "Make it feel more editorial."
- "More contrast — the gray text is too soft."
- "Warmer overall — the site feels cold."
- "Use a serif font for headings."

These are *theme* changes. They live in a small handful of files but **apply everywhere on the site simultaneously**. That's a feature: change once, see it everywhere. It's also why Claude usually asks "do you want to see this on all pages first, or just the home page?" — the answer is almost always "all pages."

### Structural changes — heavier, ripple across multiple files

Things like:

- "Add a partners page."
- "Move testimonials to before pricing."
- "Add an FAQ section to the about page."
- "Add a new block style — minimal, very tight."
- "Remove the careers page."

These reorganize where things live or add new types of sections. They're not dangerous, but they touch several files at once. Claude will usually summarize what it's going to change before doing it.

## Example requests, ordered by ambition

The further you go down this list, the more careful you (or Claude) should be.

### Tier 1: copy and small content edits

Examples:

- "Change the headline to 'Stop guessing what your customers want.'"
- "Use these features instead: [list]."
- "The 'Pro' tier should be $99/mo, not $79/mo."
- "Replace the customer logos with these: [list]."
- "Update the contact email to hello@yourdomain.com."

What to expect: Claude edits one file (usually `src/lib/brand.ts`) and saves. Done in seconds.

### Tier 2: theme and preset tweaks

Examples:

- "Our brand color is teal — make the site use teal."
- "More rounded buttons, please."
- "Less of the accent color — it's overused."
- "Use a serif for headings."
- "Higher contrast overall."

What to expect: Claude updates the theme presets (or asks you to open the dev panel — press `~` while running the site — to tune visually, then copy the resolved JSON back into `src/themes/registry.json`). Changes apply to every page at once.

### Tier 3: page composition changes

Examples:

- "Show the bold variant on the home page instead of the default."
- "Move testimonials above pricing on the home page."
- "Add an FAQ section to the about page."
- "Remove the careers page entirely."
- "Add a new page for our partners."

What to expect: Claude edits the relevant page file (`src/app/(marketing)/<route>/page.tsx`), possibly the route registry, possibly the navigation. Done in a minute or two.

### Tier 4: new variants and new block types

Examples:

- "I want a fourth, minimal variant of the hero — very stripped down, big type, no shader."
- "Add a comparison table block — like a feature matrix vs competitors."
- "Add a stats block that animates the numbers when you scroll to it."

What to expect: Claude scaffolds three style variants (editorial / saas / bold) for any new block type, updates the gallery, and might ask you which of the existing pages should use it.

### Tier 5: bigger-picture redesigns

Examples:

- "Make this feel like Linear's site."
- "Reinvent the home page — we want something dramatic."
- "Switch from a marketing site to a documentation hub."

What to expect: Claude will probably pause and ask for a designer conversation first. These requests cross enough surfaces (theme, blocks, copy, structure) that getting them right benefits from a quick alignment before a 30-minute edit session.

## How to phrase requests well

Three habits that make Claude's output match what you wanted:

### 1. Reference the surface

Bad: "The thing at the top looks bad."

Good: "The hero on the home page — the big section with the headline and CTA — feels too pastel."

Mention which page, which section, which element. The site has a lot of surfaces.

### 2. Show, don't just tell

If you have an image, a screenshot, or a reference site that captures what you want — paste the URL or describe it specifically:

Bad: "More modern."

Good: "More like Linear's home page — tight typography, lots of white space, a single deep accent color."

### 3. Specify the scope

Bad: "Make the buttons rounder."

Good: "Across the whole site, make the buttons more rounded — the current radius feels too tight."

Or: "On the home page only, make this specific CTA button more rounded."

The default for design changes is *sitewide* because that's how the theme system works. If you want a local exception, say so — but expect Claude to suggest a theme-level change instead, because local exceptions usually become technical debt.

## What Claude will probably do for each request

Mapping from common requests to what changes:

| You ask | Claude changes |
|---|---|
| "Change the homepage headline" | One string in `src/lib/brand.ts` |
| "Use these features instead" | The features array in `src/lib/brand.ts` |
| "Add a fourth pricing tier" | The pricing tiers array in `src/lib/brand.ts` |
| "Use teal as the primary" | The active preset in `src/themes/registry.json` |
| "More rounded buttons" | The `radius` value in the active preset |
| "Less accent color" | The `accentUsage` value in the active preset |
| "Higher contrast" | The `contrast` value in the active preset |
| "Move testimonials above pricing" | The JSX order on the page file |
| "Add an FAQ to the about page" | An import + composition tweak on `about/page.tsx` |
| "Add a partners page" | A new page file + route registry + nav update |
| "Remove careers" | Delete the page folder + remove from registry + nav |
| "A new minimal hero variant" | A new `hero/minimal.tsx` file + gallery update |
| "Add a comparison block" | A new block type folder with three variants + data shape + gallery |

## What Claude probably won't do without pushback

These requests will trigger a pause. They're not refusals — they're "let me confirm" moments because the change is bigger than it sounds:

- **"Add a CMS so we can edit copy in a browser."** The starter is designed to grow into a CMS-backed product eventually (using Payload), but adding one is a separate project. Claude will point you at the future-state document and ask for a sign-off before starting.
- **"Make the site multi-language."** Internationalization touches every route. Worth a designer/developer conversation first.
- **"Switch to a different design system (Chakra, MUI, Mantine)."** The site is built on Tailwind + shadcn. Claude will explain the cost before proceeding.
- **"Disable the commit hooks; they're slow."** The hooks are guardrails. If they're slow, Claude will investigate the cause rather than disable them.
- **"Add online payments / Stripe."** Possible, but it's a real feature with security implications. Needs explicit planning.
- **"Just inline this specific color hex right here."** The site has a theme system; one-off colors are a sign the theme should be tuned. Claude will route through the theme instead.
- **"Edit one of the shadcn UI components directly."** Those are off-bounds — they get regenerated when shadcn updates. Claude will wrap the component in a new one instead.

## When something feels wrong

A few flags that mean it's worth pausing:

- **Claude proposes touching files in `src/themes/derive.ts`, `src/themes/types.ts`, `src/lib/color.ts`, or anything in `next.config.ts` / `tsconfig.json` / `biome.json`.** These are sensitive — edits here can ripple unexpectedly. Confirm before proceeding.
- **Claude proposes adding a new top-level dependency** (anything in the `dependencies` block of `package.json`). New deps add weight and maintenance. Ask what existing tools could solve the problem first.
- **Claude proposes bypassing the commit hooks.** Don't. Find the real cause.
- **The dev panel (press `~`) starts behaving oddly after a change.** Revert the most recent change and try a different approach.

When in doubt: **ask Claude to summarize the changes it's about to make before it makes them.** A 30-second summary catches most surprises.

## Tools and habits

A few suggestions for working effectively:

- **Run `pnpm dev` in a terminal and keep the site open in a browser.** Press `~` to open the dev panel — instant visual tweaks without code edits.
- **For visual changes, ask Claude to take a screenshot after the change.** Claude can drive the browser via the `preview_*` tools and send you the result before you have to switch tabs.
- **For content changes, work in batches.** "Change all the pricing copy + the FAQ + the testimonials" is a fine single prompt; Claude will do them all in one pass.
- **Persist the dev panel settings.** When you tune theme inputs and find something that works, copy the resolved JSON from the panel into `src/themes/registry.json`. The panel keeps runtime edits in localStorage; the codebase changes only when the registry file changes.
- **Commit often.** Each Conventional Commit (`feat: change pricing copy`, `fix: bold variant alignment`, etc.) gives you a checkpoint to revert to if a change goes sideways.

## Further reading

- [`AGENTS.md`](../AGENTS.md) — the agent contract. Required reading if you're modifying conventions, not just using them.
- [`README.md`](../README.md) — the starter overview, setup flow, routes, and commands.
- [`docs/UI_POLISH.md`](UI_POLISH.md) — the polish primitives (motion, surfaces, hit areas, tabular numbers).
- [`docs/PAYLOAD_CMS_FUTURE.md`](PAYLOAD_CMS_FUTURE.md) — what the eventual CMS migration looks like, and why content stays in `brand.ts` for now.
