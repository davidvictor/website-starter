# 0012 — Three route-transition modes

**Status:** Accepted

## Decision

`<RouteTransition>` ships three modes, picked per-deployment (or via dev panel preview):

| Mode | Effect |
| --- | --- |
| `none` | Instant swap (default for reference routes: `/sandbox`, `/variants`, `/dashboard`) |
| `vertical-translate` | Fade + 16px upward translate on enter, 8px downward on exit, macro spring |
| `blur-scale-fade` | Opacity 0→1, scale 0.98→1, blur 4px→0 — the canonical polish-kit feel, macro spring |

Defaults per preset: editorial = `none`, saas = `vertical-translate`, bold = `blur-scale-fade`.

## Why

Different design directions warrant different page-change feels. Editorial sites usually shouldn't transition; saas sites benefit from subtle motion that hints at app-shell behavior; bold sites want the dramatic crossfade. Shipping all three avoids picking one canonical answer where the right answer is "depends on the design."

## How to apply

- Set the mode in `(marketing)/layout.tsx` via theme controller (defaults by preset).
- For one-off pages that shouldn't transition (reference docs, sandboxes), set `mode="none"`.
- Reduced-motion: all three modes collapse to `none` automatically via the policy in ADR 0011.
