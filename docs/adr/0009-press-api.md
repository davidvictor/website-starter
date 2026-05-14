# 0009 — Press API: `render` prop (base-ui pattern)

**Status:** Accepted

## Decision

`<Press>` uses base-ui's `useRender` composition pattern, which is the codebase convention (see Badge, Item, Breadcrumb). The `render` prop accepts a JSX element; press classes and props merge onto that element directly. Default render is a `<span>`.

```tsx
<Press render={<Link href="/pricing">See pricing</Link>} />
<Press static>Drag handle</Press>  // disable feedback
```

## Why

A wrapper `<div>` breaks flex/grid layouts and adds a useless DOM node. The `render` prop composes cleanly with `<Link>`, `<button>`, and any other interactive element while adding the press classes — same outcome as Radix `asChild` but matching the base-ui pattern used elsewhere in the codebase.

## How to apply

- Wrap anything that should have press feedback but isn't a Button (Links, custom cards, image tiles).
- Use `static` to disable feedback (drag handles, long-press targets).
- Button already includes the press classes inline — don't double-wrap.
