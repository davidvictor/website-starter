# Premium Foundation Audit

Date: 2026-05-15

Scope: full Lookbook front-end architecture audit against the goal of serving
as a premium, reusable foundation for high-end client websites.

## Executive Summary

Lookbook is now in the right foundation posture: the theme engine is strong,
the route and block surface is complete, internal reference routes are
explicitly separated from the public marketing sitemap, and the major UI polish
patterns are reusable instead of scattered across one-off call sites.

The audit found that the largest risks were not visual ambition gaps. They
were drift risks: metadata bypasses, direct environment reads, direct brand
imports inside reusable blocks, duplicated a11y audit logic, hardcoded fallback
colors outside the theme layer, and micro-interactions implemented locally
instead of as a system. This pass closed those gaps where the path was obvious
and narrowed the remaining work to deliberate product choices.

## Closed In This Pass

- Metadata: marketing routes now use `siteMetadata()` and internal routes share
  a noindex layout.
- Routing: `/sandbox`, `/variants`, `/accessibility`, `/dashboard`, `/login`,
  `/signup`, and `/examples/*` are excluded from `sitemap.ts`; setup docs now
  require an explicit keep/guard/remove decision before client launch.
- Environment access: client/runtime environment reads flow through
  `src/config/runtime.ts` and validated env config instead of direct
  `process.env` reads.
- Theme output: `data-accent-usage` is emitted by both runtime theme application
  and the pre-paint script.
- Theme fallbacks: literal color fallbacks were moved into
  `src/themes/fallback-colors.ts`; shader/dev-panel consumers resolve through
  token-aware helpers.
- Shader live edits: themed shaders re-resolve colors when theme inputs change.
- Block data contract: every block family now accepts typed props from
  `src/components/blocks/props.ts`; `getBlockProps(kind)` is the canonical
  bridge from `src/lib/brand.ts`.
- Gallery parity: `/variants` and composed pages now exercise the same
  `getBlockProps(kind)` path.
- Micro-interactions: `MarketingButton`, `AnimatedSwap`, checkbox indicator
  motion, input feedback, status states, and form validation/success patterns
  are documented and reusable.
- Text effects: `TextEffect` supports `gradient`, `shimmer`, and `accent`
  treatments with reduced-motion handling for shimmer.
- Pricing interaction: period changes use shared animated swaps, not local
  `AnimatePresence` logic in each pricing variant.
- Forms: the contact page now uses a stateful, accessible form pattern; the
  sandbox includes a control-state matrix for checked, invalid, disabled, and
  enabled states.
- A11y audit: `scripts/audit-a11y.mjs` now delegates to the canonical Vitest
  audit instead of duplicating contrast math.
- Motion hygiene: macro primitives respect reduced motion and route-transition
  coordination; ad-hoc motion in pricing blocks was replaced with a primitive.

## Key Issues And Risks

1. Internal references are intentionally available unless a client clone removes
   or guards them.
   They are noindexed and removed from the sitemap, but the launch decision is
   still project-specific. This is now documented as a required setup step.

2. shadcn primitives remain off-bounds.
   Lowest-level interaction styling must keep flowing through wrappers,
   `data-slot` selectors, global token styles, or a deliberate regeneration
   step. This is safe, but it needs discipline.

3. Bespoke content routes still read page-specific data directly.
   This is acceptable for blog, careers, customers, and about page content, but
   if those become CMS-managed pages they should get their own resolver layer
   rather than pushing business logic into JSX.

4. Visual regression coverage is still mostly manual.
   The system has `/variants`, `/sandbox`, `/accessibility`, and production
   build checks, but no screenshot baseline suite. Add one before high-volume
   client work.

## Recommended Improvements And Refactors

1. Add Playwright visual smoke tests for `/`, `/editorial`, `/bold`,
   `/pricing`, `/variants`, `/sandbox/forms`, and `/accessibility`.

2. Create a small route policy helper or config flag for internal routes if
   client launches frequently keep the internal playgrounds deployed.

3. Add a content resolver layer for bespoke route data when moving beyond the
   starter: blog posts, jobs, customer stories, and company stats.

4. Expand text effects only through `TextEffect`; add new effects there before
   using them in blocks.

5. Keep micro-interactions centralized: CTA links use `MarketingButton`, value
   swaps use `AnimatedSwap`, numeric stats use `AnimatedNumber`, and validation
   copy uses `FieldError`.

## Prioritized Next Steps

1. Production smoke: run the full local chain
   `pnpm check && pnpm typecheck && pnpm test && pnpm audit:a11y && pnpm build`
   before any push.
2. Browser pass: verify the main marketing stack, variant gallery, forms
   sandbox, and accessibility page under light/dark themes.
3. Visual automation: add Playwright screenshot smoke for the routes listed
   above.
4. Clone policy: before each client launch, complete the internal-route
   keep/guard/remove step in `docs/PROJECT_SETUP.md`.
5. CMS preparation: when Payload work starts, lift bespoke page collections into
   resolvers that mirror the block `getBlockProps(kind)` pattern.

## Structural Changes Needed For Best-In-Class

- A visual regression lane with route-level screenshot assertions.
- A clone-time internal-route policy switch or documented removal script.
- A future CMS adapter that preserves the current block prop contract rather
  than letting CMS fields leak directly into JSX.
- Optional design-token snapshots for each preset so theme changes can be
  reviewed as diffs, not only by eye.

## Current Verdict

Approved as a premium front-end architecture baseline after the fixes in this
pass. The remaining work is not a hidden launch blocker; it is the next layer of
scale hardening for repeated client launches.
