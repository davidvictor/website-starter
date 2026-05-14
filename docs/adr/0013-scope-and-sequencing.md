# 0013 — Scope: all 7 phases, sequenced

**Status:** Accepted

## Decision

The polish system is rolled out across **all 7 phases** of the original plan: ADRs, foundation tokens, motion primitives, shadcn primitive sweep, brand data + block variants, pages + features, dev panel polish, guardrails.

## Why

Lookbook is a prototyping starter — anyone who clones it inherits the polish defaults. Partial coverage means new prototypes ship with mixed motion strategies, half-applied tabular numbers, and inconsistent surface treatments. The cost of doing 80% is that the remaining 20% becomes the visible delta on every clone.

## How to apply

- Treat the 7 phases as the canonical roadmap.
- New polish work goes into the corresponding phase's surface area (motion → Phase 2, primitives → Phase 3, etc.).
- Don't introduce new polish-shaped patterns without picking the phase they belong to and a corresponding ADR.
