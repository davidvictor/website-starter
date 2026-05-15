# 0016 — Feature scope: count-up stats + pricing toggle + route transitions

**Status:** Accepted

## Decision

The polish rollout includes three feature additions (not just parity):

1. **Animated stats count-up** — stats blocks use `AnimatedNumber` on scroll-in.
2. **Pricing monthly/annual toggle** — cross-fade between prices via `AnimatePresence`, URL-synced (`?period=annual`).
3. **Route transitions** — marketing layout wraps children in `<RouteTransition>` with three modes (`none`, `vertical-translate`, `blur-scale-fade`).

## Why

This repo is a starter people clone for prototypes and client sites. Shipping the typed data layer without using it for anything visible means future contributors won't see what it unlocks. The three features validate the full motion + data stack in real surfaces, and they're the kind of things every "polished" marketing site has.

## How to apply

- Stats use `AnimatedNumber` by default; pass `playOn="manual"` if scroll-in isn't right for the context.
- Pricing reads the URL period via `usePricingPeriod()` and renders `tier.price` or `tier.priceYearly` accordingly.
- Marketing routes inherit the layout's `RouteTransition` mode. Reference pages (`/sandbox`, `/variants`, `/dashboard`) sit outside the marketing layout and are naturally exempt.
