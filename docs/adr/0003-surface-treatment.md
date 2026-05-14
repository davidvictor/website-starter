# 0003 — Surface treatment per variant

**Status:** Accepted

## Decision

Each marketing variant has a canonical surface treatment for cards and elevated surfaces:

| Variant | Treatment |
| --- | --- |
| editorial | Minimal — no border, optional `border-b border-border/40` horizontal divider only |
| saas | `ring-1 ring-foreground/10` + `shadow-[var(--shadow-subtle)]` |
| bold | `border border-border` (1px hard edge) |

## Why

The three variants exist to express different design directions. If they all use the same surface treatment, they don't read as different directions — they read as the same site with different fonts. Locking distinct surface rules makes each variant feel like its own design language.

## How to apply

- New blocks in `src/components/blocks/<type>/<variant>.tsx` use the locked treatment for that variant.
- Don't mix: `editorial.tsx` should not import a saas-style ring; that's the saas variant's job.
- Bold's `border` can bump to `border-2` for marquee surfaces (hero CTA card) but stays `border-1` by default.
- Shadow tokens (`subtle`, `raised`, `overlay`) come from CSS variables, not hardcoded Tailwind classes.
