# Sandbox Navigation & Component Exploration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `/sandbox` into a navigable section with focused subpages, a dense color view, and a unified sidebar layout shared by every dev-only page (sandbox subpages, dashboard, login, signup, examples, variants). No URL changes. No marketing-side changes.

**Architecture:** A new Next.js App Router route group `(internal)` owns the layout for every dev-only page. That layout renders a shared `InternalSidebar` (built from existing shadcn `Sidebar` primitives) plus a `SidebarInset` that wraps page content. Sandbox content is split into focused section components shared between per-topic subpages and a long-scroll `/sandbox/all` aggregator. A dense, row-based `ColorTable` replaces the chunky tile grid.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn `Sidebar` primitives (already installed), Biome (lint + format). No new dependencies.

**Verification model:** This project does not use component-level tests (Vitest is reserved for pure logic in `derive.ts` / `color.ts`). Every task is verified via `pnpm typecheck`, `pnpm build`, `pnpm check`, and a manual browser check at the listed URLs. Specific browser checks are listed per task — they are not optional.

---

## File Structure

**New files:**
- `src/app/(internal)/layout.tsx` — shared layout for all dev-only pages
- `src/components/internal-sidebar/internal-sidebar.tsx` — sidebar composition
- `src/components/internal-sidebar/nav-config.ts` — typed link tree
- `src/components/internal-sidebar/is-active.ts` — active-state helper
- `src/app/(internal)/sandbox/_components/page-header.tsx`
- `src/app/(internal)/sandbox/_components/section.tsx`
- `src/app/(internal)/sandbox/_components/sub-section.tsx`
- `src/app/(internal)/sandbox/_components/type-row.tsx`
- `src/app/(internal)/sandbox/_components/copy-button.tsx`
- `src/app/(internal)/sandbox/_components/color-table.tsx`
- `src/app/(internal)/sandbox/_components/section-toc.tsx`
- `src/app/(internal)/sandbox/_components/index-cards.ts`
- `src/app/(internal)/sandbox/_components/sections/colors-section.tsx`
- `src/app/(internal)/sandbox/_components/sections/typography-section.tsx`
- `src/app/(internal)/sandbox/_components/sections/forms-section.tsx`
- `src/app/(internal)/sandbox/_components/sections/surfaces-section.tsx`
- `src/app/(internal)/sandbox/_components/sections/navigation-section.tsx`
- `src/app/(internal)/sandbox/_components/sections/overlays-section.tsx`
- `src/app/(internal)/sandbox/colors/page.tsx`
- `src/app/(internal)/sandbox/typography/page.tsx`
- `src/app/(internal)/sandbox/forms/page.tsx`
- `src/app/(internal)/sandbox/surfaces/page.tsx`
- `src/app/(internal)/sandbox/navigation/page.tsx`
- `src/app/(internal)/sandbox/overlays/page.tsx`
- `src/app/(internal)/sandbox/all/page.tsx`

**Moved files (URLs unchanged):**
- `src/app/sandbox/` → `src/app/(internal)/sandbox/`
- `src/app/dashboard/` → `src/app/(internal)/dashboard/`
- `src/app/login/` → `src/app/(internal)/login/`
- `src/app/signup/` → `src/app/(internal)/signup/`
- `src/app/examples/` → `src/app/(internal)/examples/`
- `src/app/(marketing)/variants/` → `src/app/(internal)/variants/`

**Modified files:**
- `src/app/(internal)/sandbox/page.tsx` — replaced with new index (was the long-scroll page)
- `src/app/(internal)/dashboard/page.tsx` — strip inner `SidebarProvider` + `AppSidebar`

---

## Task 1: Bootstrap `(internal)` route group with placeholder sidebar

**Goal:** Create the route group + layout + a minimal sidebar that compiles. Move `/sandbox` into it as the first inhabitant. Verify URLs are unchanged.

**Files:**
- Create: `src/components/internal-sidebar/nav-config.ts`
- Create: `src/components/internal-sidebar/is-active.ts`
- Create: `src/components/internal-sidebar/internal-sidebar.tsx`
- Create: `src/app/(internal)/layout.tsx`
- Move: `src/app/sandbox/` → `src/app/(internal)/sandbox/`

- [ ] **Step 1.1: Create the nav config**

Create `src/components/internal-sidebar/nav-config.ts`:

```ts
export type InternalNavLink = {
  label: string
  href: string
}

export type InternalNavGroup = {
  label: string
  items: InternalNavLink[]
}

export const internalNav: readonly InternalNavGroup[] = [
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

- [ ] **Step 1.2: Create the active-state helper**

Create `src/components/internal-sidebar/is-active.ts`:

```ts
export function isInternalNavActive(href: string, pathname: string): boolean {
  if (href === "/sandbox") return pathname === "/sandbox"
  return pathname === href || pathname.startsWith(`${href}/`)
}
```

The exact match on `/sandbox` keeps the Index item from staying "active" on every sandbox subpage.

- [ ] **Step 1.3: Create the InternalSidebar component**

Create `src/components/internal-sidebar/internal-sidebar.tsx`:

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { isInternalNavActive } from "./is-active"
import { internalNav } from "./nav-config"

export function InternalSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="inline-block size-5 rounded-sm bg-foreground"
          />
          <span className="group-data-[collapsible=icon]:hidden">lookbook</span>
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
                    <SidebarMenuButton
                      asChild
                      isActive={isInternalNavActive(item.href, pathname)}
                    >
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
  )
}
```

The brand-mark is a solid square placeholder; replace with a proper logomark in a separate visual-polish task if desired.

- [ ] **Step 1.4: Create the internal layout**

Create `src/app/(internal)/layout.tsx`:

```tsx
import { InternalSidebar } from "@/components/internal-sidebar/internal-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

- [ ] **Step 1.5: Move `/sandbox/` into the route group**

Run:

```bash
mkdir -p src/app/\(internal\)
git mv src/app/sandbox src/app/\(internal\)/sandbox
```

This moves both `src/app/sandbox/page.tsx` and `src/app/sandbox/polish/page.tsx` under the new group. URLs `/sandbox` and `/sandbox/polish` are unchanged (route groups don't affect URLs).

- [ ] **Step 1.6: Typecheck**

Run:

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 1.7: Build**

Run:

```bash
pnpm build
```

Expected: successful build. Route table should still show `/sandbox` and `/sandbox/polish`.

- [ ] **Step 1.8: Visual check**

Run `pnpm dev`. Visit:
- `http://localhost:3000/sandbox` — see the existing long-scroll page on the right, sidebar on the left with all link groups. Sidebar header reads "lookbook" with a black square. "Index" item is highlighted.
- `http://localhost:3000/sandbox/polish` — sidebar still visible, "Polish" item highlighted.
- `http://localhost:3000/` — marketing home; sidebar should NOT be visible (marketing layout still active).

Confirm the dev panel still toggles with `~`.

Stop dev server before committing.

- [ ] **Step 1.9: Commit**

```bash
git add src/components/internal-sidebar/ "src/app/(internal)/"
git commit -m "feat(internal): add route group + shared sidebar; move /sandbox into it"
```

---

## Task 2: Move `/dashboard` and strip its inner SidebarProvider

**Goal:** Move the dashboard page into `(internal)` and remove its self-rendered `SidebarProvider` + `AppSidebar` (the new layout provides those).

**Files:**
- Move: `src/app/dashboard/` → `src/app/(internal)/dashboard/`
- Modify: `src/app/(internal)/dashboard/page.tsx`

- [ ] **Step 2.1: Move the folder**

Run:

```bash
git mv src/app/dashboard src/app/\(internal\)/dashboard
```

- [ ] **Step 2.2: Strip the inner SidebarProvider + AppSidebar**

Replace the entire contents of `src/app/(internal)/dashboard/page.tsx` with:

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Build Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  )
}
```

The `SidebarProvider` + `AppSidebar` wrapper is gone; the `SidebarInset` from the layout takes their place. The breadcrumb-bar header stays so the dashboard preview still looks like a dashboard. The `SidebarTrigger` continues to work because the new layout's `SidebarProvider` is its provider.

- [ ] **Step 2.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

Expected: no errors. If `@/components/app-sidebar` becomes unused, the import is already gone in the new file — fine.

- [ ] **Step 2.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/dashboard`. Expected: dashboard content inside the internal sidebar. Sidebar's "Dashboard" item is highlighted. Sidebar trigger button in the dashboard header collapses/expands the sidebar.

- [ ] **Step 2.5: Commit**

```bash
git add "src/app/(internal)/dashboard/"
git commit -m "feat(internal): move /dashboard under route group; strip inner SidebarProvider"
```

---

## Task 3: Move `/login` and `/signup`

**Goal:** Move both auth-preview routes under `(internal)`. No content changes — they're self-contained centered cards that render fine inside `SidebarInset`.

**Files:**
- Move: `src/app/login/` → `src/app/(internal)/login/`
- Move: `src/app/signup/` → `src/app/(internal)/signup/`

- [ ] **Step 3.1: Move folders**

```bash
git mv src/app/login src/app/\(internal\)/login
git mv src/app/signup src/app/\(internal\)/signup
```

- [ ] **Step 3.2: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

Expected: clean.

- [ ] **Step 3.3: Visual check**

`pnpm dev`. Visit `http://localhost:3000/login` and `http://localhost:3000/signup`. Expected: centered cards inside the sidebar layout. Sidebar's "Login" / "Signup" items active respectively.

- [ ] **Step 3.4: Commit**

```bash
git add "src/app/(internal)/login/" "src/app/(internal)/signup/"
git commit -m "feat(internal): move /login and /signup under route group"
```

---

## Task 4: Move `/examples/*`

**Goal:** Move the three examples routes (motion, shaders, blocks) under `(internal)`.

**Files:**
- Move: `src/app/examples/` → `src/app/(internal)/examples/`

- [ ] **Step 4.1: Move the folder**

```bash
git mv src/app/examples src/app/\(internal\)/examples
```

- [ ] **Step 4.2: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

Expected: clean. `useDevControls` / `useDevData` imports use `@/components/dev-panel/*` paths, which continue to resolve.

- [ ] **Step 4.3: Visual check**

`pnpm dev`. Visit:
- `http://localhost:3000/examples/motion`
- `http://localhost:3000/examples/shaders`
- `http://localhost:3000/examples/blocks`

Each should render inside the sidebar layout with the correct nav item active. Confirm motion + shaders still respond to dev-panel controls.

- [ ] **Step 4.4: Commit**

```bash
git add "src/app/(internal)/examples/"
git commit -m "feat(internal): move /examples under route group"
```

---

## Task 5: Move `/variants` from `(marketing)` to `(internal)`

**Goal:** `/variants` is a design-system reference (block × style gallery), not a marketing page. Move it under `(internal)` so it gets the sandbox sidebar.

**Files:**
- Move: `src/app/(marketing)/variants/` → `src/app/(internal)/variants/`

- [ ] **Step 5.1: Move the folder**

```bash
git mv "src/app/(marketing)/variants" "src/app/(internal)/variants"
```

- [ ] **Step 5.2: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

Expected: clean. If the page imports the marketing `SiteHeader` directly (unlikely — the layout provides it), update; otherwise nothing to do.

- [ ] **Step 5.3: Visual check**

`pnpm dev`. Visit `http://localhost:3000/variants`. Expected: block gallery inside the sidebar layout. "Variants" item active. No `SiteHeader` at the top of the page.

- [ ] **Step 5.4: Commit**

```bash
git add "src/app/(internal)/variants/" "src/app/(marketing)/variants" 
git commit -m "feat(internal): move /variants from marketing to internal"
```

---

## Task 6: Extract shared section helpers

**Goal:** Lift the `Section`, `SubSection`, `TypeRow` helpers out of the current `/sandbox/page.tsx` into shared `_components/` files. Add a new `PageHeader`. Do NOT delete from the old page yet — that happens when subpages exist to replace it.

**Files:**
- Create: `src/app/(internal)/sandbox/_components/section.tsx`
- Create: `src/app/(internal)/sandbox/_components/sub-section.tsx`
- Create: `src/app/(internal)/sandbox/_components/type-row.tsx`
- Create: `src/app/(internal)/sandbox/_components/page-header.tsx`

- [ ] **Step 6.1: Create `section.tsx`**

```tsx
export function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}
```

- [ ] **Step 6.2: Create `sub-section.tsx`**

```tsx
export function SubSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </h3>
      {children}
    </div>
  )
}
```

- [ ] **Step 6.3: Create `type-row.tsx`**

```tsx
export function TypeRow({
  label,
  sample,
  className,
}: {
  label: string
  sample: string
  className: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-l-2 border-border pl-4">
      <span className="font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
      <p className={className}>{sample}</p>
    </div>
  )
}
```

- [ ] **Step 6.4: Create `page-header.tsx`**

```tsx
"use client"

import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/providers/theme-provider"

export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  const { theme, resolvedMode } = useTheme()

  return (
    <header className="flex flex-col gap-2">
      <p className="text-xs tracking-wider text-muted-foreground uppercase">
        /sandbox
      </p>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-balance text-muted-foreground">{description}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">theme · {theme.id}</Badge>
        <Badge variant="secondary">mode · {resolvedMode}</Badge>
        <Badge variant="secondary">
          radius ·{" "}
          <span className="font-mono">{theme.derivation.radius}</span>
        </Badge>
      </div>
    </header>
  )
}
```

- [ ] **Step 6.5: Typecheck**

```bash
pnpm typecheck
```

Expected: clean. New files are not yet imported anywhere.

- [ ] **Step 6.6: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/"
git commit -m "feat(sandbox): extract shared section + page-header helpers"
```

---

## Task 7: Build the dense ColorTable + copy-button

**Goal:** Build the row-based color table specified in §5.4 of the design doc. Render at `/sandbox/colors` for visual verification.

**Files:**
- Create: `src/app/(internal)/sandbox/_components/copy-button.tsx`
- Create: `src/app/(internal)/sandbox/_components/color-table.tsx`
- Create: `src/app/(internal)/sandbox/_components/sections/colors-section.tsx`
- Create: `src/app/(internal)/sandbox/colors/page.tsx`

- [ ] **Step 7.1: Create `copy-button.tsx`**

```tsx
"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // clipboard may be unavailable (non-secure context); silently no-op
    }
  }, [text])

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            onClick={onCopy}
            className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            {copied ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
          </Button>
        }
      />
      <TooltipContent>{copied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  )
}
```

If `size="icon-sm"` is not a valid Button size in the project, fall back to `size="icon"` and add `className="size-7"`.

- [ ] **Step 7.2: Create `color-table.tsx`**

```tsx
"use client"

import { useTheme } from "@/providers/theme-provider"
import { resolveTokens } from "@/themes/registry"
import {
  COLOR_TOKEN_KEYS,
  COLOR_TOKEN_TO_CSS_VAR,
  type ColorTokens,
} from "@/themes/types"
import { CopyButton } from "./copy-button"

type ColorGroup = {
  label: string
  keys: (keyof ColorTokens)[]
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: "Surface",
    keys: [
      "background",
      "foreground",
      "card",
      "cardForeground",
      "popover",
      "popoverForeground",
      "muted",
      "mutedForeground",
      "secondary",
      "secondaryForeground",
    ],
  },
  {
    label: "Brand",
    keys: [
      "primary",
      "primaryForeground",
      "accent",
      "accentForeground",
      "brandAccent",
      "brandAccentForeground",
    ],
  },
  {
    label: "Borders & inputs",
    keys: ["border", "input", "ring"],
  },
  {
    label: "Semantic",
    keys: ["success", "warning", "info", "destructive"],
  },
  {
    label: "Chart",
    keys: ["chart1", "chart2", "chart3", "chart4", "chart5"],
  },
  {
    label: "Sidebar",
    keys: [
      "sidebar",
      "sidebarForeground",
      "sidebarPrimary",
      "sidebarPrimaryForeground",
      "sidebarAccent",
      "sidebarAccentForeground",
      "sidebarBorder",
      "sidebarRing",
    ],
  },
]

export function ColorTable() {
  const { theme, resolvedMode } = useTheme()
  const tokens = resolveTokens(theme, resolvedMode)

  // Any key in COLOR_TOKEN_KEYS not assigned to a group lands in "Other".
  const grouped = new Set(COLOR_GROUPS.flatMap((g) => g.keys as string[]))
  const otherKeys = (COLOR_TOKEN_KEYS as readonly (keyof ColorTokens)[]).filter(
    (k) => !grouped.has(k as string)
  )
  const groups: ColorGroup[] =
    otherKeys.length > 0
      ? [...COLOR_GROUPS, { label: "Other", keys: otherKeys }]
      : COLOR_GROUPS

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {groups.map((group, groupIdx) => (
        <div key={group.label}>
          <div
            className={
              groupIdx === 0
                ? "bg-muted/50 px-3 py-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
                : "border-t border-border bg-muted/50 px-3 py-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
            }
          >
            {group.label}
          </div>
          <div className="divide-y divide-border">
            {group.keys.map((key) => (
              <ColorRow
                key={key as string}
                cssVar={COLOR_TOKEN_TO_CSS_VAR[key]}
                value={tokens[key]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ColorRow({ cssVar, value }: { cssVar: string; value: string }) {
  return (
    <div className="group flex items-center gap-3 px-3 py-1.5 hover:bg-muted/40">
      <div
        aria-hidden
        className="size-5 shrink-0 rounded-sm border border-border"
        style={{ background: value }}
      />
      <span className="flex-1 truncate font-mono text-xs">{cssVar}</span>
      <span className="hidden truncate font-mono text-xs text-muted-foreground sm:inline">
        {value}
      </span>
      <CopyButton text={cssVar} label="Copy variable name" />
    </div>
  )
}
```

> Hex output is omitted in this first pass. If `src/lib/color.ts` exports an OKLCH→hex helper (verify by grepping for `oklchToHex`, `toHex`, or similar), add a third right-aligned column rendering `#xxxxxx`. If conversion fails, render nothing in that column.

- [ ] **Step 7.3: Create `sections/colors-section.tsx`**

```tsx
import { ColorTable } from "../color-table"
import { Section } from "../section"

export function ColorsSection() {
  return (
    <Section title="Colors" subtitle="Resolved for the active theme">
      <ColorTable />
    </Section>
  )
}
```

- [ ] **Step 7.4: Create `/sandbox/colors/page.tsx`**

Create `src/app/(internal)/sandbox/colors/page.tsx`:

```tsx
import { ColorTable } from "../_components/color-table"
import { PageHeader } from "../_components/page-header"

export default function ColorsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Colors"
        description="Every color token resolved for the active theme."
      />
      <ColorTable />
    </div>
  )
}
```

Note: the subpage uses `<ColorTable />` directly (not `<ColorsSection />`). The `<ColorsSection />` wrapper is for the `/all` aggregator, where every section gets a `<Section title="…">` chrome. On the dedicated `/colors` page, the `PageHeader` already provides the title — no double heading.

- [ ] **Step 7.5: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

Expected: clean. If `COLOR_TOKEN_KEYS` key names differ from those in step 7.2, fix the array values. The "Other" safety net catches drift but a clean group list is preferred.

- [ ] **Step 7.6: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox/colors`. Expected:
- Page header with title "Colors," theme + mode + radius badges.
- Six groups stacked, each with an uppercase label.
- Every token rendered as a row: swatch + var name + value + copy icon.
- Hovering a row reveals the copy button; clicking it briefly shows a check icon.
- Switching theme/mode via the dev panel (`~`) updates every value live.

If an "Other" section appears, list its tokens and update `COLOR_GROUPS` in `color-table.tsx` to place them — then re-verify.

- [ ] **Step 7.7: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/copy-button.tsx" "src/app/(internal)/sandbox/_components/color-table.tsx" "src/app/(internal)/sandbox/_components/sections/colors-section.tsx" "src/app/(internal)/sandbox/colors/page.tsx"
git commit -m "feat(sandbox): dense color table + /sandbox/colors subpage"
```

---

## Task 8: Typography + Radii subpage

**Goal:** Build `/sandbox/typography` containing the type ramp, tabular-numbers demo, and the existing 6-radius row.

**Files:**
- Create: `src/app/(internal)/sandbox/_components/sections/typography-section.tsx`
- Create: `src/app/(internal)/sandbox/typography/page.tsx`

- [ ] **Step 8.1: Create `sections/typography-section.tsx`**

```tsx
import { Section } from "../section"
import { SubSection } from "../sub-section"
import { TypeRow } from "../type-row"

export function TypographySection() {
  return (
    <Section title="Typography">
      <SubSection label="Ramp">
        <div className="flex flex-col gap-6">
          <TypeRow
            label="display · font-heading"
            sample="The quick brown fox jumps over the lazy dog."
            className="font-heading text-5xl leading-tight tracking-tight"
          />
          <TypeRow
            label="h1 · font-sans"
            sample="Marketing experiments live here."
            className="font-sans text-3xl font-semibold tracking-tight"
          />
          <TypeRow
            label="h2 · font-sans"
            sample="Each section is a prototype."
            className="font-sans text-2xl font-semibold tracking-tight"
          />
          <TypeRow
            label="h3 · font-sans"
            sample="Smaller headings for sub-areas."
            className="font-sans text-xl font-semibold tracking-tight"
          />
          <TypeRow
            label="body · font-sans"
            sample="Body text uses the sans variable. It should read comfortably at 16px on most modern devices, with hanging punctuation and balanced wrapping where supported."
            className="font-sans text-base leading-relaxed"
          />
          <TypeRow
            label="body-sm · font-sans"
            sample="Smaller body text for dense surfaces."
            className="font-sans text-sm"
          />
          <TypeRow
            label="caption · font-sans"
            sample="Captions and asides sit here."
            className="font-sans text-xs text-muted-foreground"
          />
          <TypeRow
            label="mono · font-mono"
            sample="const greeting = `hello, ${name}`"
            className="font-mono text-sm"
          />
        </div>
      </SubSection>

      <SubSection label="Tabular numbers">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              default
            </span>
            <p className="font-sans text-base">0123456789</p>
            <p className="font-sans text-base">$ 12,345.67</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              tabular-nums
            </span>
            <p className="font-sans text-base tabular-nums">0123456789</p>
            <p className="font-sans text-base tabular-nums">$ 12,345.67</p>
          </div>
        </div>
      </SubSection>

      <SubSection label="Radii">
        <div className="flex flex-wrap gap-4">
          {[
            { label: "sm", className: "rounded-sm" },
            { label: "md", className: "rounded-md" },
            { label: "lg", className: "rounded-lg" },
            { label: "xl", className: "rounded-xl" },
            { label: "2xl", className: "rounded-2xl" },
            { label: "full", className: "rounded-full" },
          ].map(({ label, className }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`size-16 border border-border bg-muted ${className}`}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  )
}
```

- [ ] **Step 8.2: Create `/sandbox/typography/page.tsx`**

```tsx
import { PageHeader } from "../_components/page-header"
import { TypographySection } from "../_components/sections/typography-section"

export default function TypographyPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Typography"
        description="Type ramp, tabular numbers, and radii."
      />
      <TypographySection />
    </div>
  )
}
```

- [ ] **Step 8.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 8.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox/typography`. Expected: ramp, tabular-nums comparison (digits should align in the right card, not in the left), 6 radius swatches.

- [ ] **Step 8.5: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/sections/typography-section.tsx" "src/app/(internal)/sandbox/typography/page.tsx"
git commit -m "feat(sandbox): typography subpage with ramp + tabular nums + radii"
```

---

## Task 9: Forms subpage

**Goal:** Build `/sandbox/forms` with text inputs, selectors, sliders, buttons, and field composition.

**Files:**
- Create: `src/app/(internal)/sandbox/_components/sections/forms-section.tsx`
- Create: `src/app/(internal)/sandbox/forms/page.tsx`

- [ ] **Step 9.1: Create `sections/forms-section.tsx`**

```tsx
"use client"

import { Mail, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Section } from "../section"
import { SubSection } from "../sub-section"

export function FormsSection() {
  return (
    <Section title="Forms">
      <SubSection label="Text inputs">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="fm-name">Name</Label>
            <Input id="fm-name" placeholder="Jane Doe" />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="fm-search">Search</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fm-search"
                placeholder="Search components…"
                className="pl-7"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="fm-disabled">Disabled</Label>
            <Input id="fm-disabled" placeholder="Disabled" disabled />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="fm-error" className="text-destructive">
              With error
            </Label>
            <Input
              id="fm-error"
              placeholder="me@example"
              aria-invalid
              className="border-destructive focus-visible:ring-destructive/40"
            />
            <span className="text-xs text-destructive">
              Please enter a valid email.
            </span>
          </div>
          <div className="flex flex-col gap-3 md:col-span-2">
            <Label htmlFor="fm-bio">Bio</Label>
            <Textarea
              id="fm-bio"
              placeholder="Tell us about yourself…"
              rows={4}
            />
          </div>
        </div>
      </SubSection>

      <SubSection label="Selectors">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Checkbox id="fm-check" />
            <Label htmlFor="fm-check">Remember me</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="fm-switch" />
            <Label htmlFor="fm-switch">Enable notifications</Label>
          </div>
          <RadioGroup defaultValue="weekly" className="md:col-span-2">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="daily" id="fm-r-daily" />
              <Label htmlFor="fm-r-daily">Daily digest</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="weekly" id="fm-r-weekly" />
              <Label htmlFor="fm-r-weekly">Weekly digest</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="never" id="fm-r-never" />
              <Label htmlFor="fm-r-never">Never</Label>
            </div>
          </RadioGroup>
          <div className="flex flex-col gap-2">
            <Label>Toggle</Label>
            <Toggle aria-label="Bold">B</Toggle>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Toggle group</Label>
            <ToggleGroup type="single" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                L
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                C
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                R
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </SubSection>

      <SubSection label="Sliders & pagination">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label>Density</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Range</Label>
            <Slider defaultValue={[20, 80]} max={100} step={1} />
          </div>
          <div className="md:col-span-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </SubSection>

      <SubSection label="Buttons">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">XS</Button>
            <Button size="sm">SM</Button>
            <Button>Default</Button>
            <Button size="lg">LG</Button>
            <Button size="icon">
              <Plus />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Mail />
              Compose
            </Button>
            <Button variant="outline">
              Continue
              <Plus />
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
        </div>
      </SubSection>
    </Section>
  )
}
```

> If `Toggle`, `ToggleGroup`, or `Pagination` components in this codebase use a different export shape than shadcn's defaults, adjust imports to match what `src/components/ui/` exports. Verify by reading those files before running. If a control is missing entirely, omit it from the section rather than half-implementing.

> **Field composition (deferred):** Spec §6.3 calls for a "Field composition" sub-section using `src/components/ui/field.tsx`. The Field primitive exists but its export shape isn't documented here. When implementing, read `field.tsx` and add a fifth `<SubSection label="Field composition">` to `FormsSection` with one `Field` + `Label` + `Input` + helper-text example. If the primitive's API isn't ergonomic for the demo, leave it out and add an entry to "Risks and follow-ups" at the bottom of this plan.

- [ ] **Step 9.2: Create `/sandbox/forms/page.tsx`**

```tsx
import { PageHeader } from "../_components/page-header"
import { FormsSection } from "../_components/sections/forms-section"

export default function FormsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Forms"
        description="Inputs, selectors, sliders, buttons."
      />
      <FormsSection />
    </div>
  )
}
```

- [ ] **Step 9.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 9.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox/forms`. Expected: all four sub-sections render. Disabled input is greyed; error input has red border. Toggles + sliders work. All button variants render.

- [ ] **Step 9.5: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/sections/forms-section.tsx" "src/app/(internal)/sandbox/forms/page.tsx"
git commit -m "feat(sandbox): forms subpage with inputs, selectors, sliders, buttons"
```

---

## Task 10: Surfaces subpage

**Goal:** Build `/sandbox/surfaces` (card, alert, badge, skeleton, progress, separator, avatar, empty).

**Files:**
- Create: `src/app/(internal)/sandbox/_components/sections/surfaces-section.tsx`
- Create: `src/app/(internal)/sandbox/surfaces/page.tsx`

- [ ] **Step 10.1: Create `sections/surfaces-section.tsx`**

```tsx
import {
  AlertCircle,
  CheckCircle2,
  Info,
  MoreHorizontal,
  Star,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Section } from "../section"
import { SubSection } from "../sub-section"

export function SurfacesSection() {
  return (
    <Section title="Surfaces">
      <SubSection label="Cards">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly report</CardTitle>
              <CardDescription>
                Q1 metrics summary. Updated 4 hours ago.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cards are the workhorse surface for grouping content.
              </p>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardHeader className="gap-2">
              <Badge variant="secondary" className="w-fit">
                <Star className="size-3" />
                Variant
              </Badge>
              <CardTitle>Dashed border card</CardTitle>
              <CardDescription>
                Customize per surface with utility classes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </SubSection>

      <SubSection label="Alerts">
        <div className="grid gap-3 sm:grid-cols-2">
          <Alert>
            <Info />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>
              Default alert with an icon and description.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              Destructive alerts use the destructive token.
            </AlertDescription>
          </Alert>
        </div>
      </SubSection>

      <SubSection label="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge>
            <CheckCircle2 className="size-3" />
            With icon
          </Badge>
        </div>
      </SubSection>

      <SubSection label="Skeleton">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </SubSection>

      <SubSection label="Progress">
        <div className="flex flex-col gap-3">
          <Progress value={0} />
          <Progress value={62} />
          <Progress value={100} />
        </div>
      </SubSection>

      <SubSection label="Separator">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>Above the line</span>
          <Separator />
          <span>Below the line</span>
        </div>
      </SubSection>

      <SubSection label="Avatar">
        <div className="flex flex-wrap items-center gap-2">
          <Avatar>
            <AvatarFallback>DV</AvatarFallback>
          </Avatar>
          <Avatar className="size-12">
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <Avatar className="size-8">
            <AvatarFallback>
              <MoreHorizontal className="size-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </SubSection>

      <SubSection label="Empty">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No items yet</EmptyTitle>
            <EmptyDescription>
              When data shows up, it appears here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SubSection>
    </Section>
  )
}
```

> Verify the `Empty` component's actual export names by reading `src/components/ui/empty.tsx`. The names above match the shadcn defaults; adjust if this codebase differs.

- [ ] **Step 10.2: Create `/sandbox/surfaces/page.tsx`**

```tsx
import { PageHeader } from "../_components/page-header"
import { SurfacesSection } from "../_components/sections/surfaces-section"

export default function SurfacesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Surfaces"
        description="Cards, alerts, badges, skeletons, progress, separators, avatars, and empty states."
      />
      <SurfacesSection />
    </div>
  )
}
```

- [ ] **Step 10.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 10.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox/surfaces`. Expected: all sub-sections render.

- [ ] **Step 10.5: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/sections/surfaces-section.tsx" "src/app/(internal)/sandbox/surfaces/page.tsx"
git commit -m "feat(sandbox): surfaces subpage"
```

---

## Task 11: Navigation subpage

**Goal:** Build `/sandbox/navigation` (tabs, accordion, breadcrumb, nav menu, menubar).

**Files:**
- Create: `src/app/(internal)/sandbox/_components/sections/navigation-section.tsx`
- Create: `src/app/(internal)/sandbox/navigation/page.tsx`

- [ ] **Step 11.1: Create `sections/navigation-section.tsx`**

```tsx
"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Section } from "../section"
import { SubSection } from "../sub-section"

export function NavigationSection() {
  return (
    <Section title="Navigation">
      <SubSection label="Tabs">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="p-3 text-sm">
            Account tab content
          </TabsContent>
          <TabsContent value="billing" className="p-3 text-sm">
            Billing tab content
          </TabsContent>
          <TabsContent value="team" className="p-3 text-sm">
            Team tab content
          </TabsContent>
        </Tabs>
      </SubSection>

      <SubSection label="Accordion">
        <Accordion defaultValue={["item-1"]}>
          <AccordionItem value="item-1">
            <AccordionTrigger>What is this sandbox for?</AccordionTrigger>
            <AccordionContent>
              It&apos;s the canonical design-system reference for the active
              theme. Switch themes from the dev panel to see how every
              primitive responds.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How are themes stored?</AccordionTrigger>
            <AccordionContent>
              Themes are JSON in <code>src/themes/registry.json</code>. Local
              edits live in <code>localStorage</code> and can be copied as JSON
              to persist.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SubSection>

      <SubSection label="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Library</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </SubSection>

      <SubSection label="Navigation menu">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-2 p-3">
                  <li>
                    <NavigationMenuLink href="#" className="block rounded-md p-2 text-sm hover:bg-muted">
                      Platform overview
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#" className="block rounded-md p-2 text-sm hover:bg-muted">
                      Integrations
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-2 p-3">
                  <li>
                    <NavigationMenuLink href="#" className="block rounded-md p-2 text-sm hover:bg-muted">
                      About
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#" className="block rounded-md p-2 text-sm hover:bg-muted">
                      Careers
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </SubSection>

      <SubSection label="Menubar">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New file <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Open <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Save <MenubarShortcut>⌘S</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Zoom in</MenubarItem>
              <MenubarItem>Zoom out</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </SubSection>
    </Section>
  )
}
```

- [ ] **Step 11.2: Create `/sandbox/navigation/page.tsx`**

```tsx
import { PageHeader } from "../_components/page-header"
import { NavigationSection } from "../_components/sections/navigation-section"

export default function NavigationPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Navigation"
        description="Tabs, accordion, breadcrumb, navigation menu, menubar."
      />
      <NavigationSection />
    </div>
  )
}
```

- [ ] **Step 11.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 11.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox/navigation`. Expected: tabs switch on click, accordion item-1 starts expanded, breadcrumb renders, hover navigation-menu triggers reveal sub-panels, menubar items open dropdowns.

- [ ] **Step 11.5: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/sections/navigation-section.tsx" "src/app/(internal)/sandbox/navigation/page.tsx"
git commit -m "feat(sandbox): navigation subpage"
```

---

## Task 12: Overlays subpage

**Goal:** Build `/sandbox/overlays` (dialog, alert dialog, sheet, drawer, popover, hover card, tooltip, dropdown menu, context menu, command).

**Files:**
- Create: `src/app/(internal)/sandbox/_components/sections/overlays-section.tsx`
- Create: `src/app/(internal)/sandbox/overlays/page.tsx`

- [ ] **Step 12.1: Create `sections/overlays-section.tsx`**

```tsx
"use client"

import { Bell } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Section } from "../section"
import { SubSection } from "../sub-section"

export function OverlaysSection() {
  return (
    <Section title="Overlays">
      <SubSection label="Dialog">
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline">
                <Bell />
                Open dialog
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notify me</DialogTitle>
              <DialogDescription>
                Choose how you&apos;d like to be reached.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-3">
              <Label htmlFor="ov-email">Email</Label>
              <Input
                id="ov-email"
                type="email"
                placeholder="me@example.com"
              />
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SubSection>

      <SubSection label="Alert dialog">
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="destructive">Delete project</Button>}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SubSection>

      <SubSection label="Sheet">
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes here. Click save when you&apos;re done.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 p-4">
              <Label htmlFor="sh-name">Name</Label>
              <Input id="sh-name" placeholder="Jane Doe" />
            </div>
          </SheetContent>
        </Sheet>
      </SubSection>

      <SubSection label="Drawer">
        <Drawer>
          <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Quick actions</DrawerTitle>
              <DrawerDescription>
                A bottom-sheet style overlay for touch surfaces.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Confirm</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </SubSection>

      <SubSection label="Popover">
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Settings</Button>} />
          <PopoverContent>
            <div className="flex flex-col gap-3 p-2">
              <Label htmlFor="po-name">Display name</Label>
              <Input id="po-name" defaultValue="Jane Doe" />
            </div>
          </PopoverContent>
        </Popover>
      </SubSection>

      <SubSection label="Hover card">
        <HoverCard>
          <HoverCardTrigger render={<Button variant="link">@jdoe</Button>} />
          <HoverCardContent>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Jane Doe</span>
              <span className="text-xs text-muted-foreground">
                Joined March 2026 · 12 projects
              </span>
            </div>
          </HoverCardContent>
        </HoverCard>
      </SubSection>

      <SubSection label="Tooltip">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
          <TooltipContent>Tooltips appear on hover or focus.</TooltipContent>
        </Tooltip>
      </SubSection>

      <SubSection label="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline">Open menu</Button>}
          />
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </SubSection>

      <SubSection label="Context menu">
        <ContextMenu>
          <ContextMenuTrigger
            render={
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Right-click anywhere in this box
              </div>
            }
          />
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuItem>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </SubSection>

      <SubSection label="Command">
        <Command className="rounded-md border border-border">
          <CommandInput placeholder="Type a command…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Open dialog</CommandItem>
              <CommandItem>Toggle theme</CommandItem>
              <CommandItem>New file</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </SubSection>
    </Section>
  )
}
```

> The `render` prop pattern is used because the codebase uses Base UI under the shadcn wrappers (verified in `sandbox/page.tsx`'s `DialogTrigger render={…}` usage). If any trigger in this codebase uses `asChild` or plain children instead, adjust per the existing component's API.

- [ ] **Step 12.2: Create `/sandbox/overlays/page.tsx`**

```tsx
import { PageHeader } from "../_components/page-header"
import { OverlaysSection } from "../_components/sections/overlays-section"

export default function OverlaysPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Overlays"
        description="Dialogs, sheets, drawers, popovers, menus, tooltips, command palette."
      />
      <OverlaysSection />
    </div>
  )
}
```

- [ ] **Step 12.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 12.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox/overlays`. Click each trigger to confirm overlays open and close. Right-click the context-menu box. Type in the command palette to confirm fuzzy filtering works.

- [ ] **Step 12.5: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/sections/overlays-section.tsx" "src/app/(internal)/sandbox/overlays/page.tsx"
git commit -m "feat(sandbox): overlays subpage"
```

---

## Task 13: All-components aggregator + section TOC

**Goal:** Build `/sandbox/all` — long-scroll page composing every section component with anchor IDs and a sticky TOC.

**Files:**
- Create: `src/app/(internal)/sandbox/_components/section-toc.tsx`
- Create: `src/app/(internal)/sandbox/all/page.tsx`

- [ ] **Step 13.1: Create `section-toc.tsx`**

```tsx
"use client"

const items: { id: string; label: string }[] = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "forms", label: "Forms" },
  { id: "surfaces", label: "Surfaces" },
  { id: "navigation", label: "Navigation" },
  { id: "overlays", label: "Overlays" },
]

export function SectionTOC() {
  return (
    <nav
      aria-label="Sections on this page"
      className="sticky top-0 z-10 -mx-6 flex flex-wrap gap-2 border-b border-border bg-background/80 px-6 py-3 backdrop-blur"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
```

The `<a href="#id">` pattern uses native anchor scrolling; no JS state required.

- [ ] **Step 13.2: Create `/sandbox/all/page.tsx`**

```tsx
import { ColorsSection } from "../_components/sections/colors-section"
import { FormsSection } from "../_components/sections/forms-section"
import { NavigationSection } from "../_components/sections/navigation-section"
import { OverlaysSection } from "../_components/sections/overlays-section"
import { SurfacesSection } from "../_components/sections/surfaces-section"
import { TypographySection } from "../_components/sections/typography-section"
import { PageHeader } from "../_components/page-header"
import { SectionTOC } from "../_components/section-toc"

export default function AllComponentsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <PageHeader
        title="All components"
        description="The whole design system on one page."
      />
      <SectionTOC />
      <section id="colors" className="scroll-mt-16">
        <ColorsSection />
      </section>
      <section id="typography" className="scroll-mt-16">
        <TypographySection />
      </section>
      <section id="forms" className="scroll-mt-16">
        <FormsSection />
      </section>
      <section id="surfaces" className="scroll-mt-16">
        <SurfacesSection />
      </section>
      <section id="navigation" className="scroll-mt-16">
        <NavigationSection />
      </section>
      <section id="overlays" className="scroll-mt-16">
        <OverlaysSection />
      </section>
    </div>
  )
}
```

`scroll-mt-16` keeps anchor jumps from hiding the section title under the sticky TOC.

- [ ] **Step 13.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

- [ ] **Step 13.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox/all`. Expected:
- Sticky TOC with 6 chips below the page header.
- Each section renders.
- Clicking a TOC chip scrolls smoothly to that section.
- Sidebar's "All components" item is active.

- [ ] **Step 13.5: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/section-toc.tsx" "src/app/(internal)/sandbox/all/page.tsx"
git commit -m "feat(sandbox): /sandbox/all aggregator with sticky TOC"
```

---

## Task 14: Replace `/sandbox` with the new index page

**Goal:** The existing `src/app/(internal)/sandbox/page.tsx` is the OLD long-scroll page. Replace it with the new lightweight card-grid index. The long-scroll content is now `/sandbox/all`.

**Files:**
- Create: `src/app/(internal)/sandbox/_components/index-cards.ts`
- Modify (full rewrite): `src/app/(internal)/sandbox/page.tsx`

- [ ] **Step 14.1: Create `index-cards.ts`**

```ts
export type IndexCard = {
  title: string
  description: string
  href: string
}

export const indexCards: readonly IndexCard[] = [
  {
    title: "Colors",
    description: "Every token resolved for the active theme.",
    href: "/sandbox/colors",
  },
  {
    title: "Typography",
    description: "Type ramp, tabular numbers, and radii.",
    href: "/sandbox/typography",
  },
  {
    title: "Forms",
    description: "Inputs, selectors, sliders, buttons.",
    href: "/sandbox/forms",
  },
  {
    title: "Surfaces",
    description: "Cards, alerts, badges, skeletons, separators, avatars.",
    href: "/sandbox/surfaces",
  },
  {
    title: "Navigation",
    description: "Tabs, accordion, breadcrumb, menubar.",
    href: "/sandbox/navigation",
  },
  {
    title: "Overlays",
    description: "Dialogs, sheets, popovers, menus, command palette.",
    href: "/sandbox/overlays",
  },
  {
    title: "Polish",
    description: "Motion, surfaces, hit areas, tabular numbers.",
    href: "/sandbox/polish",
  },
  {
    title: "All components",
    description: "The whole design system on one page.",
    href: "/sandbox/all",
  },
]
```

- [ ] **Step 14.2: Rewrite `src/app/(internal)/sandbox/page.tsx`**

Replace the entire file contents with:

```tsx
import Link from "next/link"
import { indexCards } from "./_components/index-cards"
import { PageHeader } from "./_components/page-header"

export default function SandboxIndexPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Sandbox"
        description="Design-system reference for the active theme."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {indexCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-1 rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-muted/40"
          >
            <span className="font-medium">{card.title}</span>
            <span className="text-sm text-muted-foreground">
              {card.description}
            </span>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Other internal routes (variants, dashboard, examples, login, signup)
        are in the sidebar.
      </p>
    </div>
  )
}
```

- [ ] **Step 14.3: Typecheck + build**

```bash
pnpm typecheck && pnpm build
```

Expected: clean. The replaced `page.tsx` no longer imports anything that doesn't exist.

- [ ] **Step 14.4: Visual check**

`pnpm dev`. Visit `http://localhost:3000/sandbox`. Expected:
- New lightweight index: page header + 8 cards in a responsive grid.
- Each card hover state works.
- Sidebar "Index" item is active.

- [ ] **Step 14.5: Commit**

```bash
git add "src/app/(internal)/sandbox/_components/index-cards.ts" "src/app/(internal)/sandbox/page.tsx"
git commit -m "feat(sandbox): replace /sandbox with lightweight card-grid index"
```

---

## Task 15: Final verification + lint pass

**Goal:** Full repo verification — typecheck, build, Biome, manual route audit.

- [ ] **Step 15.1: Typecheck**

```bash
pnpm typecheck
```

Expected: clean.

- [ ] **Step 15.2: Lint + format check**

```bash
pnpm check
```

Expected: clean. If Biome reports formatting issues in any of the new files, run `pnpm format` and re-run `pnpm check`.

- [ ] **Step 15.3: Production build**

```bash
pnpm build
```

Expected: clean. The route table should list:

- `/`, `/editorial`, `/bold`, `/pricing`, `/about`, `/customers`, `/changelog`, `/blog`, `/blog/[slug]`, `/careers`, `/contact` (marketing — unchanged)
- `/sandbox`, `/sandbox/colors`, `/sandbox/typography`, `/sandbox/forms`, `/sandbox/surfaces`, `/sandbox/navigation`, `/sandbox/overlays`, `/sandbox/polish`, `/sandbox/all`
- `/dashboard`, `/login`, `/signup`
- `/examples/motion`, `/examples/shaders`, `/examples/blocks`
- `/variants`

No route should be missing. No route should have an unexpected `(internal)` or `(marketing)` segment in its URL.

- [ ] **Step 15.4: Route audit in browser**

`pnpm dev`. Visit each of the routes above and confirm:
- Marketing routes: `SiteHeader` at top, no sidebar.
- Internal routes: sidebar on left, no `SiteHeader`. Correct sidebar item is active for each route.
- `/sandbox/colors`: dense color table renders all groups.
- `/sandbox/typography`: ramp, tabular nums, radii.
- `/sandbox/forms`: all four sub-sections.
- `/sandbox/surfaces`: all sub-sections.
- `/sandbox/navigation`: tabs, accordion (item-1 expanded), breadcrumb, nav menu, menubar.
- `/sandbox/overlays`: every trigger opens its overlay.
- `/sandbox/polish`: identical to pre-change behavior.
- `/sandbox/all`: sticky TOC, all sections, anchor scroll works.
- `/sandbox`: card grid.
- `/dashboard`: dashboard content, sidebar trigger button toggles sidebar.
- `/login`, `/signup`: centered cards inside sidebar layout.
- `/examples/motion`, `/examples/shaders`, `/examples/blocks`: render with dev panel controls still working.
- `/variants`: block × style gallery inside the sidebar layout.

- [ ] **Step 15.5: Theme switching**

With dev panel open (`~`), switch theme and toggle mode. Every page below should reflect the change without reload:
- Color table updates row values.
- Typography ramp font changes.
- Button / surface tones shift.

- [ ] **Step 15.6: Final commit (if any fixes needed)**

If any of the audit steps revealed bugs, fix inline and commit:

```bash
git add -A
git commit -m "fix(sandbox): <specific fix>"
```

If no fixes were needed, skip this step.

---

## Risks and follow-ups

- **`AppSidebar` may now be unused.** Once Task 2 strips it from `/dashboard`, search the repo: `grep -rn "from \"@/components/app-sidebar\"" src`. If no references remain, the file is dead code. Decide separately whether to delete it; some clients may want to crib from it when building their own dashboards. Defer deletion.
- **`destructiveForeground`, `successForeground`, etc.** were not in `COLOR_TOKEN_KEYS` at the time of writing. If a future commit adds them, the `Semantic` group should be updated. The "Other" safety net in the color table will surface them in the meantime.
- **`/login` and `/signup` inside the sidebar layout** may feel odd in a client prototype. If a downstream user wants standalone full-screen auth pages, the fix is to create `(internal)/login/layout.tsx` and `(internal)/signup/layout.tsx` that bypass the parent layout. Not required now.
- **Visual polish on the sidebar header brand mark** (currently a solid square + "lookbook" text) is intentionally minimal here. A proper logomark and a "Back to site" affordance are separate visual-polish tasks.
