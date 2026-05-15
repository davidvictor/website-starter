# Payload CMS — forward-compat contract

> This starter may become CMS-backed via [Payload](https://payloadcms.com/) once client projects mature. This document captures the design constraints **today** that preserve a cheap migration **tomorrow**. No CMS code is shipped yet.

## Context

The current trajectory:

- Today, every project's content lives in `src/lib/brand.ts` as a typed object — taglines, features, pricing tiers, testimonials, FAQ, customer logos, blog posts, jobs, values.
- The reason it works: small enough that a developer (or Claude) can edit it directly, structured enough that blocks bind to it without ceremony.
- The reason it doesn't scale: when a client wants to edit their own copy without involving an engineer, you need a CMS. The natural fit is Payload — TypeScript-native, self-hosted, schema-first, slots into a Next.js app without separate infrastructure.

The migration is not in scope yet. What **is** in scope is making sure today's code structure doesn't make tomorrow's migration expensive.

## The migration trajectory (sketch)

When the CMS migration happens, roughly this:

1. **Define Payload collections** that mirror `src/lib/brand-types.ts` shapes. The current `brand.ts` shape *is* the schema design.
2. **Spin up a Payload admin** (Next.js route, served from the same app on `/admin`).
3. **Migrate `brand.ts` content** into Payload — a one-time data move.
4. **Replace `brand.ts` imports** with Payload queries (likely via a thin `src/lib/content.ts` wrapper so block components don't change).
5. **Keep the dev panel.** It stays a designer tool — controls theme, not content.
6. **Keep block variants in code.** Variants are presentation; CMS doesn't pick them.
7. **Keep page composition in code.** Which blocks ship on which routes is a designer/developer concern, not an editor concern.

What changes for editors: they edit content in the Payload admin instead of asking Claude.

What stays the same for engineers: the block components, the theme system, the dev panel, the routing, the build, the deploy.

## Today's constraints — what to do now so the migration is cheap

### 1. Content stays in `src/lib/brand.ts` (or its successors)

Don't inline marketing copy in `page.tsx` files. The bind is always:

```tsx
import { brand } from "@/lib/brand"

export default function HomePage() {
  return <Hero tagline={brand.tagline} headline={brand.headline} />
}
```

Not:

```tsx
export default function HomePage() {
  return <Hero tagline="Stop guessing what your customers want." headline="..." />
}
```

The string literal in the second example becomes hard to migrate — there's no field for the CMS to map onto.

### 2. No string concatenation in JSX for content

Bad:

```tsx
<h1>Welcome to {brand.companyName}</h1>
```

Good:

```tsx
<h1>{brand.heroHeadline}</h1>
```

Where `brand.heroHeadline` is `"Welcome to Nimbus"`. The concatenation works fine in JSX today, but it produces non-templatable shapes — there's no clean way for an editor to change `"Welcome to Nimbus"` to `"Discover Nimbus"` if `"Welcome to "` is hardcoded in JSX.

Exception: when the prefix is genuinely fixed UI chrome (`<span>$</span>{price}` for currency), that's fine — it's a presentation detail, not content.

### 3. No business logic in JSX for content

Bad:

```tsx
<p>{brand.users.toLocaleString()} happy customers</p>
```

Good:

```tsx
// src/lib/format.ts
export function formatUserCount(n: number) {
  return `${n.toLocaleString()} happy customers`
}

// component
<p>{formatUserCount(brand.users)}</p>
```

Or, even better, pre-formatted in `brand.ts`:

```ts
export const brand = {
  // ...
  socialProof: "50,000+ happy customers",
} as const
```

The CMS doesn't run JavaScript at content-edit time. Transforms happen in pure modules; JSX is purely data-binding.

### 4. Block components take a single typed data prop

Bad:

```tsx
function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  imageSrc,
  imageAlt,
}: { title: string; subtitle: string; ... }) { ... }
```

Good:

```tsx
type HeroData = {
  title: string
  subtitle: string
  cta: { label: string; href: string }
  image: { src: string; alt: string }
}

function Hero({ data }: { data: HeroData }) { ... }
```

The single-shape pattern means a CMS query returns one object, not five separate fields to pass through.

### 5. Images use `next/image` with URL-string sources

Bad:

```tsx
import heroImage from "@/assets/hero.png"

<Image src={heroImage} alt="..." />
```

Good:

```tsx
<Image src={brand.hero.image} alt={brand.hero.imageAlt} width={1200} height={800} />
```

Where `brand.hero.image` is the string `"/assets/hero.png"` (today) or a Payload media URL (tomorrow).

When the CMS lands, media URLs come from Payload's media collection — they're strings, served from your CDN, and `next/image` consumes them the same way.

### 6. The `brand.ts` shape is the early schema design

Every field in `brand.ts` becomes a field in a Payload collection eventually. So:

- Pick field names you'd want to see in a CMS form (`headline`, not `h1Text`).
- Group related fields into objects (`hero: { headline, subtitle, cta }`, not five top-level fields).
- Use arrays for repeating content (testimonials, FAQ entries, pricing tiers).
- Use union types sparingly — they're harder to render as CMS fields. Prefer enumerated literals (`"editorial" | "saas" | "bold"`).

### 7. Cross-page navigation uses `next/link` with paths from `src/lib/routes.ts`

Bad:

```tsx
<a href="/pricing">Pricing</a>
```

Good:

```tsx
import Link from "next/link"
import { routes } from "@/lib/routes"

<Link href={routes.pricing}>Pricing</Link>
```

When routes become CMS-managed (or get programmatically generated), the routes registry is one place to update.

## What is NOT a forward-compat constraint

Some things look CMS-adjacent but stay in code permanently:

- **The theme system.** Themes are designer/developer concerns. The CMS doesn't pick colors. (Future: a Payload "Theme" collection might exist, but it's distant and not driving today's decisions.)
- **The dev panel.** It's a tool, not content. Stays.
- **Block variant selection.** Which variant a block uses (editorial/saas/bold) is a composition decision, not a content decision. Stays in `page.tsx`.
- **Page composition.** Which blocks ship on which routes is design intent, not content. Stays in `page.tsx`.
- **Routing.** New routes are an engineering decision, not a content decision. The CMS might inject *page content* into a `/blog/[slug]` route, but the route itself is in code.

Don't compromise these for hypothetical CMS-readiness.

## When the migration happens

Rough sequence:

1. **Inventory `brand.ts`** — every field becomes a Payload collection field. Group by category (Hero / Features / Pricing / Testimonials / FAQ / Blog / Customers / etc.).
2. **Set up Payload locally** — `pnpm add payload @payloadcms/next @payloadcms/db-sqlite` (or postgres). Mount at `/admin`.
3. **Define collections** matching `brand-types.ts`. Keep names identical to ease the diff.
4. **Migrate data** — a one-time script that reads `brand.ts` and writes to Payload via its REST API.
5. **Replace `brand.ts` imports** with Payload queries. Probably via a `src/lib/content.ts` that exposes the same shape as `brand.ts` so block components don't change.
6. **Delete `brand.ts`** once the migration is verified.
7. **Update the playbook.** Tier 1 client requests now go through the Payload admin; some Tier 1 requests still flow through Claude if the client prefers.

The whole thing is a focused 1–2 week project per client, *if* the constraints above are honored. Without them, it's a 4–6 week project per client, with a lot of grep'ing for hardcoded strings.

## Practical guardrails for today

- When adding a new content field, add it to `brand.ts` and reference from the consuming block — never inline.
- When formatting content, put the formatter in `src/lib/format.ts` (or a sibling pure module).
- When adding a new block, define its data shape in `src/lib/brand-types.ts` and bind via a single `data` prop.
- When adding a new image, use `next/image` with a string `src` (don't import the asset file).
- When adding a new link, route it through `src/lib/routes.ts`.

These habits cost nothing today and save weeks at migration time.
