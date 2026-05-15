# Sandbox Navigation & Component Exploration

**Status:** Design v1 — ready for implementation plan
**Date:** 2026-05-14
**Author:** David (with assistant)
**Driver:** The `/sandbox` route is the canonical design-system reference, but today it's one long-scroll page with no internal navigation, chunky color swatches that make scan-and-compare slow, and no relationship to the other dev-only surfaces in the app (`/dashboard`, `/login`, `/signup`, `/examples/*`, `/variants`). This spec restructures the sandbox into a navigable section with focused subpages, a dense color view, and a unified sidebar layout shared by every internal page. No marketing-page behavior changes.

---

## 1. Context

The current repo state:

- **Sandbox today:** `src/app/sandbox/page.tsx` is one client-rendered page with ten inline sections (Color tokens, Typography, Radii, Buttons, Form controls, Feedback, Surfaces, Navigation, Overlays, Data display). One sibling exists: `src/app/sandbox/polish/page.tsx`. No layout wrapper.
- **Color view:** `ColorSwatch` component renders 4:3-aspect tiles in a `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` grid. Each tile is ~150px wide with the swatch on top and `--var-name` + value below. Useful but visually heavy for comparing 40+ tokens.
- **Other dev-only routes:** `/dashboard` (uses `AppSidebar` with sample team-switcher / nav-projects / nav-user chrome and placeholder `#` URLs), `/login`, `/signup`, `/examples/{motion,shaders,blocks}`, `/variants` (block × style gallery with its own anchor TOC).
- **Marketing nav:** `src/components/blocks/site-header.tsx` consumes `navLinks` from `src/lib/brand.ts`, uses `usePathname` for active state (exact match on `/`, `startsWith` elsewhere), wraps links in `TransitionLink` from `src/components/motion/transition-link.tsx`. The marketing layout (`src/app/(marketing)/layout.tsx`) wraps children in `RouteTransitionProvider` + `RouteTransition`.
- **Sidebar primitives:** `src/components/ui/sidebar.tsx` ships `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarHeader`, `SidebarFooter`, `SidebarRail`, plus `collapsible="icon"` support. The existing `AppSidebar` composition demonstrates the pattern but carries sample data that's wrong for sandbox use.
- **Color tokens:** `COLOR_TOKEN_KEYS` and `COLOR_TOKEN_TO_CSS_VAR` are exported from `src/themes/types`; `resolveTokens(theme, mode)` returns the resolved values. `src/lib/color.ts` provides OKLCH ↔ hex conversion.
- **Dev panel:** Global, toggled with `~`, unaffected by route changes.

The structural issue: every new dev-only surface that gets added (a future shader playground, a typography ramp explorer, a motion-curve picker) currently has no shared home — it either lands under `/sandbox` ad-hoc or floats as a top-level route. There's no spine.

## 2. Goals

Three layers, in priority order:

### 2.1 Navigable sandbox (the headline)

- Replace the single long-scroll `/sandbox` page with a **lightweight index** that lands the user inside a navigable section.
- Split the design-system surface into **focused subpages** (`colors`, `typography`, `forms`, `surfaces`, `navigation`, `overlays`) plus the existing `polish` and a new `all` aggregator.
- Provide a **compact, scannable color view** as the default treatment everywhere colors appear inside the sandbox.

### 2.2 Unified internal layout

- A single **`(internal)` route group** owns the layout for every dev-only surface: sandbox subpages, `dashboard`, `login`, `signup`, `examples/*`, `variants`. URLs do not change.
- A **shared sidebar** (`InternalSidebar`) is the spine. It reuses the shadcn `Sidebar` primitives, drops the dashboard-sample chrome (team-switcher, nav-projects, nav-user), and renders a static link tree from a single typed config.

### 2.3 Shared section components

- Each subpage's content lives in small, focused section components under `src/app/(internal)/sandbox/_components/`. `/sandbox/all` composes those same components into one long page with a sticky TOC — no duplication.
- `Section` / `SubSection` / `TypeRow` helpers extracted from today's monolithic `/sandbox/page.tsx`.

## 3. Non-goals

- **Filters on `/all`.** Originally considered; replaced by the per-subpage split. Each subpage *is* the filter.
- **Search inside the sidebar.** Out of scope.
- **State filters (default / hover / focus / disabled).** Out of scope.
- **Marketing nav changes.** `SiteHeader` and `(marketing)/layout.tsx` are untouched.
- **Blocks in sandbox.** Sandbox is primitives + tokens only. `/variants` remains the composition gallery.
- **Thumbnails / preview images on the index page.** Text cards only — no asset work.
- **Dev panel changes.** Still global, still `~`.
- **`RouteTransition` inside `(internal)`.** Sidebar navigation should feel snappy; no enter/exit animation between subpages.
- **Mobile-first redesign of the sidebar.** The shadcn `Sidebar` primitive already handles responsive collapse; we accept its default behavior.
- **Splitting `/login` and `/signup` out of the sidebar layout** (they're prototyping references here; if a downstream client wants standalone auth pages, that's a per-clone change).

## 4. Decisions resolved upfront

| Open question | Resolution |
|---|---|
| What does `/sandbox` (the root) become? | **Lightweight index page.** Card grid linking to each subpage. Today's long-scroll content moves to `/sandbox/all`. |
| Scope of the sandbox | **Primitives + tokens only.** Marketing blocks (Hero, Features, etc.) stay in `/variants`. |
| Subpage granularity | **6 pages (hybrid grouping).** Colors, Typography, Forms, Surfaces, Navigation, Overlays. Plus `polish` (existing) and `all` (aggregator). |
| Color view density | **Row-based table.** One row per token, grouped by category. Used on both `/sandbox/colors` and `/sandbox/all`. |
| Navigation pattern | **Left sidebar.** No inherited `SiteHeader` inside `(internal)`. Sandbox is distinctly its own area. |
| Sidebar scope | **Every internal page.** Sandbox subpages + `/dashboard` + `/login` + `/signup` + `/examples/*` + `/variants`. |
| Filters | **Replaced by subpages.** Each filter would have been a subpage; we made it one. |
| URL changes | **None.** Route group `(internal)` doesn't affect URLs. Existing links (README, ADRs, deep links) keep working. |
| Sidebar component | **Reuse `Sidebar` primitives + write a new `InternalSidebar` composition.** Don't reuse `AppSidebar` directly (its sample data is wrong for this context). |
| Sidebar header | **Brand mark + "lookbook" wordmark, links to `/`.** Acts as the "back to site" affordance. |
| Sidebar footer | **`SidebarRail` only.** No user widget, no team switcher. |
| Demo data | **Lightweight and generic-but-specific.** Reuse the patterns already in today's `/sandbox/page.tsx`. No fake users or fake APIs. |

## 5. Architecture

### 5.1 Routing

```
src/app/
  (marketing)/                # unchanged
    layout.tsx                # SiteHeader, RouteTransition
    page.tsx
    pricing/page.tsx
    ...

  (internal)/                 # NEW route group — sidebar layout
    layout.tsx                # SidebarProvider + InternalSidebar + main
    sandbox/
      page.tsx                # NEW — index (cards)
      all/page.tsx            # NEW — long-scroll aggregator
      colors/page.tsx         # NEW
      typography/page.tsx     # NEW
      forms/page.tsx          # NEW
      surfaces/page.tsx       # NEW
      navigation/page.tsx     # NEW
      overlays/page.tsx       # NEW
      polish/page.tsx         # MOVED — same URL
      _components/            # NEW — shared section components
        page-header.tsx
        section.tsx
        sub-section.tsx
        type-row.tsx
        color-table.tsx
        sections/             # one file per content section
          colors-section.tsx
          typography-section.tsx
          radii-section.tsx
          forms-section.tsx
          surfaces-section.tsx
          navigation-section.tsx
          overlays-section.tsx
    dashboard/page.tsx        # MOVED — same URL
    login/page.tsx            # MOVED — same URL
    signup/page.tsx           # MOVED — same URL
    examples/
      motion/page.tsx         # MOVED
      shaders/page.tsx        # MOVED
      blocks/page.tsx         # MOVED
    variants/page.tsx         # MOVED — same URL
```

Route groups in Next.js App Router do not affect URLs, so `(internal)/sandbox/colors/page.tsx` serves at `/sandbox/colors`. The `(internal)/layout.tsx` becomes the default layout for every page inside that group; nested layouts can override per-route if needed (none planned).

### 5.2 Internal layout

```tsx
// src/app/(internal)/layout.tsx
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { InternalSidebar } from "@/components/internal-sidebar/internal-sidebar"

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <InternalSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

No `RouteTransitionProvider`, no `SiteHeader`. The sidebar persists across navigation inside the group.

### 5.3 Sidebar component

```
src/components/internal-sidebar/
  internal-sidebar.tsx        # the composition
  nav-config.ts               # typed link tree
```

`nav-config.ts` exports a typed tree:

```ts
export type InternalNavLink = {
  label: string
  href: string
}

export type InternalNavGroup = {
  label: string
  items: InternalNavLink[]
}

export const internalNav: InternalNavGroup[] = [
  {
    label: "Design system",
    items: [
      { label: "Index", href: "/sandbox" },
      { label: "Colors", href: "/sandbox/colors" },
      { label: "Typography", href: "/sandbox/typography" },
      { label: "Forms", href: "/sandbox/forms" },
      { label: "Surfaces", href: "/sandbox/surfaces" },
      { label: "Navigation", href: "/sandbox/navigation" },
      { label: "Overlays", href: "/sandbox/overlays" },
      { label: "Polish", href: "/sandbox/polish" },
      { label: "All components", href: "/sandbox/all" },
    ],
  },
  {
    label: "Compositions",
    items: [{ label: "Variants", href: "/variants" }],
  },
  {
    label: "App templates",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Login", href: "/login" },
      { label: "Signup", href: "/signup" },
    ],
  },
  {
    label: "Examples",
    items: [
      { label: "Motion", href: "/examples/motion" },
      { label: "Shaders", href: "/examples/shaders" },
      { label: "Blocks", href: "/examples/blocks" },
    ],
  },
]
```

`internal-sidebar.tsx` renders:

```tsx
<Sidebar collapsible="icon">
  <SidebarHeader>
    <Link href="/" className="...brand mark + lookbook wordmark">
      <Logomark /> lookbook
    </Link>
  </SidebarHeader>

  <SidebarContent>
    {internalNav.map((group) => (
      <SidebarGroup key={group.label}>
        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href, pathname)}>
                  <Link href={item.href}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    ))}
  </SidebarContent>

  <SidebarRail />
</Sidebar>
```

`isActive(href, pathname)`: exact match when `href === "/sandbox"`, otherwise `pathname === href || pathname.startsWith(href + "/")`. Lives next to the config.

The header link uses plain `next/link` — no `TransitionLink`, since `RouteTransition` doesn't live in this layout.

### 5.4 Color table

`src/app/(internal)/sandbox/_components/color-table.tsx`:

```tsx
type ColorGroup = {
  label: string
  keys: (keyof ColorTokens)[]
}

const colorGroups: ColorGroup[] = [
  { label: "Surface", keys: ["background", "foreground", "card", "cardForeground", "popover", "popoverForeground", "muted", "mutedForeground", "secondary", "secondaryForeground"] },
  { label: "Brand", keys: ["primary", "primaryForeground", "accent", "accentForeground", "brandAccent", "brandAccentForeground"] },
  { label: "Borders & inputs", keys: ["border", "input", "ring"] },
  { label: "Semantic", keys: ["success", "warning", "info", "destructive"] }, // no *-foreground variants exist for these
  { label: "Chart", keys: ["chart1", "chart2", "chart3", "chart4", "chart5"] },
  { label: "Sidebar", keys: ["sidebar", "sidebarForeground", "sidebarPrimary", "sidebarPrimaryForeground", "sidebarAccent", "sidebarAccentForeground", "sidebarBorder", "sidebarRing"] },
]
```

> Exact key names are verified against `COLOR_TOKEN_KEYS` during implementation. Any key not present in a group falls into an "Other" group at the bottom — safety net so the table never silently drops a token.

Each row:

```tsx
<div className="group flex items-center gap-3 px-3 py-1.5 hover:bg-muted/40">
  <div
    aria-hidden
    className="size-5 shrink-0 rounded-sm border border-border"
    style={{ background: value }}
  />
  <span className="flex-1 truncate font-mono text-xs">{cssVar}</span>
  <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{value}</span>
  <span className="hidden font-mono text-xs text-muted-foreground md:inline">{hex}</span>
  <CopyButton text={cssVar} />
</div>
```

`<CopyButton>` is a small icon-only button using `navigator.clipboard.writeText`; on success it swaps to a check icon for ~1.2s. Uses `Tooltip` for the label "Copy variable name."

Groups are separated by `<div className="divide-y divide-border">` containers, with small uppercase labels (`text-[10px] tracking-wider text-muted-foreground uppercase`) above each group. The whole table is wrapped in a `rounded-md border border-border` container.

`hex` is computed via the existing OKLCH→hex utility in `src/lib/color.ts`. If conversion fails for a given value (unexpected format), we silently render only the OKLCH value.

### 5.5 Section components

Each section is a focused component that takes no props (or only theme-related ones it can pull from context). Example signatures:

```ts
function ColorsSection(): JSX.Element        // wraps <ColorTable />
function TypographySection(): JSX.Element    // type ramp + tabular nums demo
function RadiiSection(): JSX.Element         // sm..full row
function FormsSection(): JSX.Element         // inputs, selectors, sliders, buttons, fields
function SurfacesSection(): JSX.Element      // card, alert, badge, skeleton, progress, separator, avatar, empty
function NavigationSection(): JSX.Element    // tabs, accordion, breadcrumb, nav-menu, menubar
function OverlaysSection(): JSX.Element      // dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip, dropdown, context-menu, command
```

Each section provides an `id` prop or exports a constant `id` string (e.g., `forms-section`) for anchor linking on `/sandbox/all`.

A subpage looks like:

```tsx
// src/app/(internal)/sandbox/forms/page.tsx
import { PageHeader } from "../_components/page-header"
import { FormsSection } from "../_components/sections/forms-section"

export default function FormsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <PageHeader title="Forms" description="Inputs, selectors, sliders, buttons, and field composition." />
      <FormsSection />
    </div>
  )
}
```

`/sandbox/all` composes all sections with anchor IDs:

```tsx
export default function AllPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12">
      <PageHeader title="All components" description="The whole design system in one place." />
      <SectionTOC />
      <section id="colors"><ColorsSection /></section>
      <section id="typography"><TypographySection /></section>
      <section id="radii"><RadiiSection /></section>
      <section id="forms"><FormsSection /></section>
      <section id="surfaces"><SurfacesSection /></section>
      <section id="navigation"><NavigationSection /></section>
      <section id="overlays"><OverlaysSection /></section>
    </div>
  )
}
```

`<SectionTOC />` is a small sticky strip of anchor links, visually borrowed from `/variants`.

### 5.6 Index page

```tsx
// src/app/(internal)/sandbox/page.tsx
export default function SandboxIndexPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader title="Sandbox" description="Design-system reference for the active theme." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {indexCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-1 rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-muted/40"
          >
            <span className="font-medium">{card.title}</span>
            <span className="text-sm text-muted-foreground">{card.description}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

`indexCards`: Colors, Typography, Forms, Surfaces, Navigation, Overlays, Polish, All components. One line each. Lives in `_components/index-cards.ts` so the source-of-truth stays out of the page file.

### 5.7 PageHeader

```tsx
function PageHeader({ title, description }: { title: string; description?: string }) {
  const { theme, resolvedMode } = useTheme()
  return (
    <header className="flex flex-col gap-2">
      <p className="text-xs tracking-wider text-muted-foreground uppercase">/sandbox</p>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="text-balance text-muted-foreground">{description}</p>}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">theme · {theme.id}</Badge>
        <Badge variant="secondary">mode · {resolvedMode}</Badge>
        <Badge variant="secondary">radius · <span className="font-mono">{theme.derivation.radius}</span></Badge>
      </div>
    </header>
  )
}
```

Smaller than today's sandbox header — fewer chips, no kbd hint (the dev panel is discoverable via the marketing site).

## 6. Subpage content (the inventory)

### 6.1 `/sandbox/colors`
- `<ColorTable />` (the entire page below the header).

### 6.2 `/sandbox/typography`
- **Type ramp** — display (`font-heading text-5xl`), h1 (`text-3xl font-semibold`), h2 (`text-2xl font-semibold`), h3 (`text-xl font-semibold`), body (`text-base leading-relaxed`), body-sm (`text-sm`), caption (`text-xs text-muted-foreground`), mono (`font-mono text-sm`). One row per size: label + sample.
- **Tabular numbers** — `0123456789` rendered twice: once default, once with `tabular-nums` utility. Labelled.
- **Radii** — the existing 6-radius row (sm/md/lg/xl/2xl/full). Visual-system-adjacent; lives here so it has a home.

### 6.3 `/sandbox/forms`
- **Text inputs** — Input (default, with leading icon, error, disabled), Textarea, native Select, custom Select, Combobox, Input OTP.
- **Selectors** — Checkbox + Label, Radio Group, Switch, Toggle, Toggle Group.
- **Sliders** — Slider (single + range), Pagination (counts as input-shaped).
- **Buttons** — all variants (default, secondary, outline, ghost, link, destructive), all sizes (xs, sm, default, lg, icon), with-icon examples, disabled.
- **Field composition** — Label + Input + helper text using the existing `field.tsx` primitive.

### 6.4 `/sandbox/surfaces`
- Card (default, dashed border, with badge in header), Alert (default, destructive), Badge (all variants + with icon), Skeleton (avatar+lines + full-width strip), Progress (mid, 0, 100), Separator (horizontal + vertical), Avatar (default, sized, fallback with icon), Empty (using `empty.tsx`).

### 6.5 `/sandbox/navigation`
- Tabs (3 tabs with placeholder content), Accordion (2 items, first expanded), Breadcrumb (3 levels), Navigation Menu (2 items, each with submenu), Menubar (File / Edit / View with a few items each).

### 6.6 `/sandbox/overlays`
- Dialog ("Notify me" example), Alert Dialog (destructive confirmation), Sheet (right-side, with form inside), Drawer (mobile-style bottom), Popover (settings popover), Hover Card (user info on hover), Tooltip (default), Dropdown Menu (with sub-menu and separator), Context Menu (right-click area), Command (inline + dialog).

### 6.7 `/sandbox/polish`
- Unchanged. The current page becomes a child of `(internal)/sandbox/polish/page.tsx` with no content edits.

### 6.8 `/sandbox/all`
- All sections from 6.1–6.7 in order, each in a `<section id="…">`, preceded by a sticky `<SectionTOC />`.

## 7. Demo data

- **Strings:** Generic-but-specific. "Quarterly report," "Notify me," "Sign in to continue," "Saved drafts." No `lorem ipsum`. No fake personally identifiable information.
- **Icons:** Reuse `lucide-react` imports already in the project. The icon set today's sandbox uses (Bell, Plus, Mail, Search, MoreHorizontal, Star, Info, AlertCircle, CheckCircle2) carries over.
- **Form fields:** Generic placeholders ("Jane Doe," "me@example.com," "Tell us about yourself…").
- **No external data fetches.** Everything is client-rendered with inline values.

## 8. What we are not doing

- **No filters.** Each filter would have been a subpage; we made it one.
- **No search.** The sidebar's link count is small enough not to need it.
- **No marketing-side changes.** `SiteHeader`, `navLinks` in `lib/brand.ts`, and the marketing layout are untouched.
- **No URL changes.** Every existing link continues to work.
- **No new dependencies.** Everything uses primitives already installed.
- **No dev panel changes.** Still global, still `~`.
- **No `RouteTransition` in `(internal)`.** Sidebar nav is instant.
- **No thumbnails on the index page.** Text cards only.
- **No state filters (default / hover / focus / disabled).** Components render in their default state; interactive states are reachable by interacting.
- **No standalone treatment for `/login` and `/signup`.** They get the sidebar layout like every other internal page. Clients that want full-screen auth pages can override per-route.

## 9. Verification

After implementation, the following must all be true:

1. **URLs unchanged.** `/sandbox`, `/sandbox/polish`, `/dashboard`, `/login`, `/signup`, `/examples/motion`, `/examples/shaders`, `/examples/blocks`, `/variants` all resolve as before. New URLs `/sandbox/{colors,typography,forms,surfaces,navigation,overlays,all}` resolve.
2. **Sidebar is present on every internal page** and absent on every marketing page.
3. **Active state** highlights the correct sidebar item on each route, including deep ones (`/examples/motion`).
4. **The dev panel still toggles with `~`** on every page.
5. **Theme changes via the dev panel** still update every page live (the `ThemeProvider` chain is upstream of the layout split, so this is structural — verifying it confirms we didn't accidentally re-mount the provider).
6. **`pnpm build`** succeeds. No new TypeScript errors. No new Biome warnings.
7. **`/sandbox/colors` renders every token** in `COLOR_TOKEN_KEYS`. The "Other" group is empty if all keys are categorized; if not, it surfaces the uncategorized ones.
8. **Copy-to-clipboard works** on the color table rows.
9. **`/sandbox/all`** renders every section component exactly once with stable anchor IDs.
10. **`/sandbox/polish` content is identical** to what's there today (the move shouldn't change anything).

## 10. Risks and open questions

- **Polish page move.** The current `/sandbox/polish` page may import paths relative to its current location. The move into `(internal)/sandbox/polish/` is just a folder rename within `src/app`; all `@/` imports continue to resolve. Verify by running `pnpm build` after the move.
- **`/login` and `/signup` styling.** These pages today are full-screen and may not look correct inside a sidebar layout. If they don't, the immediate fix is to override their layout per-route with a `layout.tsx` inside each folder that bypasses the sidebar. Defer that fix until we see the result.
- **Sidebar component imports in `/dashboard`.** The existing dashboard page may import `AppSidebar` directly and render its own sidebar. If so, moving it under `(internal)` would produce two sidebars. Check `src/app/dashboard/page.tsx` during implementation and either remove the inner `AppSidebar` or strip the new internal sidebar for that specific route.
- **Color group taxonomy.** The group definitions in §5.4 are a starting point. The implementation should verify each key exists in `COLOR_TOKEN_KEYS`; any present key not assigned to a group lands in "Other" (visible safety net), and the developer adjusts the groups before merging.
- **No tests planned for this work.** The starter-kit-hardening spec introduces Vitest for `derive.ts` / `color.ts` only. This work is component-only; visual verification through the dev server is the test.
