# 0014 — Verification: manual visual diff per change

**Status:** Accepted

## Decision

Polish-related changes are verified by **manual visual diff** against `/variants` and `/sandbox/polish`, posted as screenshots in the PR description. No automated visual-regression tooling.

## Why

A polish change can pass typecheck and build while silently breaking the visual contract. The right safety net for that is the human eye on a rendered diff. A full Percy/Chromatic setup adds tooling overhead that doesn't pay off until polish work happens weekly; until then, the reviewer is the safety net.

## How to apply

- Touching a primitive (Phase 3) → screenshot every variant on `/sandbox/polish` before/after.
- Touching a block (Phase 4) → screenshot the affected block on `/variants` before/after.
- Touching a page (Phase 5) → screenshot the page in light + dark.
- Touching motion (any phase) → record a short screen capture, not just a still.
- PRs without screenshots for touched surfaces don't merge.
