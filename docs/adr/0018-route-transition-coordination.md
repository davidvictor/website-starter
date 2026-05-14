# 0018 — Route-transition coordination via state machine

**Status:** Accepted

## Decision

Route transitions are coordinated by a client-side state machine owned by `<RouteTransitionProvider>`. The provider sits inside the `(marketing)` layout — **never the root layout** — so admin/dashboard/Payload routes are physically outside its scope.

Three phases:

| Phase | Meaning |
| --- | --- |
| `idle` | No navigation in flight. Page entrance primitives (`FadeIn`, `Stagger`) animate on viewport entry as normal. |
| `pending` | A `<TransitionLink>` reported `useLinkStatus().pending === true`. The old route is still mounted; React/Next is preparing the new route in the background. |
| `entering` | Pathname has changed and the new route's content is mounted. The macro `<RouteTransition>` animation is running. |

Pieces:

| Piece | Responsibility |
| --- | --- |
| `<RouteTransitionProvider>` | Owns the phase state machine, scroll choreography, `popstate` direction detection, reduced-motion fallthrough. |
| `<RouteTransition>` | The `AnimatePresence` macro animator. Reports `entering → idle` on enter-complete so consumers can release deferred entrances. |
| `<TransitionLink>` | Drop-in for `next/link` that reports its `useLinkStatus().pending` to the provider. Used in the marketing tree; optional. |
| `useRouteTransitionPhase()` | Public hook read by `FadeIn`/`Stagger` to defer their own animations while `phase !== "idle"`. |

## Why

The previous setup keyed `AnimatePresence` on `pathname` only — three independent timelines (router commit, macro animation, in-view entrances) ran without a shared clock. With Next 16 + Cache Components + Payload's async Local API, the failure modes were:

- **Compounded jank** — macro enter fades the wrapper *while* `FadeIn` children re-fade themselves on viewport entry.
- **Scroll snap mid-animation** — Next's default scroll-to-top fired during the exit, not in the gap between exit and enter.
- **Async hole** — exit/enter ran against a Suspense fallback when the new route hadn't finished streaming.
- **No `pending` signal** — no place to mount a top progress bar or dim the page during slow loads.

The state machine gives every coordinated surface (the macro wrapper, scroll, entrances, future progress UI) one phase to subscribe to.

## Why a state machine, not native View Transitions

The native View Transitions API (`document.startViewTransition`) is the cleanest answer architecturally — but in this codebase it would conflict with Payload. Payload's admin runs as a Next.js route group in the same app and uses its own DOM-mutating routing; a global VT layer would either snapshot the admin's modals mid-state or require careful per-route scoping that VT's API doesn't offer cleanly. The state-machine approach scopes to the marketing route group via React context and ignores `router.refresh()` (which Payload's Live Preview fires on every save), so admin behavior and Live Preview are uncoupled from frontend transitions.

If View Transitions stabilize and the conflict surfaces resolve, swapping the provider's implementation is a single-file change — the public API (`<TransitionLink>`, `<RouteTransition>`, `useRouteTransitionPhase`) stays the same.

## Sync with content readiness

The `pending → entering` transition is gated by **pathname change**, which Next.js 16 + React 19 + `<Link>`'s internal `useTransition` only fire once the new route's RSC payload (including Suspense/streaming) has resolved. The macro animation therefore plays against **already-painted content**, not against a fallback that pops in mid-animation.

For Payload-backed pages, `await payload.find(...)` inside async server components is naturally part of the route's resolution — the provider needs no Payload-specific integration.

## Scroll

`scroll: "reset" | "preserve" | "smooth"` (default `"reset"`) on the provider.

- `reset` — instant scroll to top on forward navigation. Default for marketing.
- `preserve` — leave scroll alone. Use for hash navigations or scroll-spy routes.
- `smooth` — animate to top.

Scroll fires on the `pathname` change effect, in the same render as the `entering` phase transition. Browser back/forward is detected via `popstate` and skipped — the browser's own scroll restoration is the right behavior there.

## Reduced motion

Reduced motion (per [ADR 0011](./0011-reduced-motion.md)) collapses the macro animation to `none` in `<RouteTransition>`, which immediately reports `enterComplete` to keep the state machine from sticking on `entering`. Scroll uses `instant` regardless of `scroll: "smooth"` config when reduced motion is active.

## Payload compatibility

The provider is mounted in `app/(marketing)/layout.tsx`, not `app/layout.tsx`. The admin route group (when Payload is added) sits outside the provider's scope:

- Admin links use plain `next/link` and bypass the state machine.
- `router.refresh()` from Live Preview's `RefreshRouteOnSave` causes no `pathname` change → no transition replays.
- `revalidatePath` / `revalidateTag` from Payload hooks → same: no `pathname` change, no replay.
- Draft Mode toggle redirects use server-side `redirect()` → first client paint runs through `AnimatePresence`'s `initial={false}`, no exit/enter on entry.

## How to apply

```tsx
// app/(marketing)/layout.tsx
import { RouteTransition } from "@/components/motion/route-transition"
import { RouteTransitionProvider } from "@/components/motion/route-transition-context"

export default function MarketingLayout({ children }) {
  return (
    <RouteTransitionProvider>
      <SiteHeader />
      <main><RouteTransition>{children}</RouteTransition></main>
    </RouteTransitionProvider>
  )
}
```

For marketing-tree links:

```tsx
import { TransitionLink as Link } from "@/components/motion/transition-link"

<Link href="/pricing">Pricing</Link>
```

For pages that should not transition (`/sandbox`, `/dashboard`, `/variants`), the route's theme sets `routeTransition: "none"`, or wrap explicitly with `<RouteTransition mode="none">`.

`useRouteTransitionPhase()` returns `"idle"` outside the provider — components like `FadeIn` and `Stagger` work everywhere, with the deferral only active inside the marketing tree.

## Risks and edge cases

- **Rapid double-click on a Link** — provider re-promotes to `pending` on the second click; AnimatePresence with `mode="wait"` handles the rest correctly.
- **Anchor jump on same route** — `pathname` doesn't change, so no transition; scroll stays where the browser puts it.
- **Tab inactive during a transition** — `motion/react` pauses animations off-screen; `reportEnterComplete` fires when the tab is visible again.
- **`router.refresh()`** — no pathname change → no transition. This is the desired behavior for Payload Live Preview.
- **Direct entry / hard refresh** — first paint uses `AnimatePresence initial={false}`, so the first page render doesn't animate.

## When to revisit

- React 19 `<ViewTransition>` stabilizes and integrates with Suspense streaming → consider migrating the provider's implementation to native VT while keeping the public API.
- Payload admin lands in this codebase → audit whether the marketing tree's provider is mistakenly mounted at the root.
- Loading indicators or a top progress bar get added → consume `useRouteTransitionPhase()` for the `pending` signal.
