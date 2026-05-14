<!--
PR template — see docs/adr/0014-verification-strategy.md.

Polish-touching PRs must include screenshots of the affected surfaces.
-->

## Summary

<!-- 1–3 bullets on what changed and why. -->

## Screenshots

<!--
For each surface area touched, paste a before/after pair (light + dark).
Use Cmd+Shift+5 (macOS) on the relevant page.
-->

- [ ] Touching a primitive in `src/components/ui/`? Screenshots of `/sandbox/polish` (light + dark).
- [ ] Touching a block in `src/components/blocks/`? Screenshots of `/variants` for the affected block.
- [ ] Touching a marketing page? Screenshots of the page (light + dark).
- [ ] Touching motion? A short screen capture (≤5s) of the animation.

> If no surface changed (docs, lint, tests only), say so and skip the screenshots.

## Polish checklist

- [ ] `pnpm tsc --noEmit` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm check` passes (Biome + polish guardrails).
- [ ] If any new ADR landed, README link added.

## Notes

<!-- Anything reviewer-facing: trade-offs, follow-ups, open questions. -->
