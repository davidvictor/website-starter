# Project setup - per-clone checklist

Use this when spinning up a new website from the upstream starter. The starter
itself should stay generic and reusable; client/project-specific work belongs in
the new clone.

## Checklist

1. [ ] Clone the starter into a new project repo.
2. [ ] Rename `package.json` metadata.
3. [ ] Update `LICENSE` if needed.
4. [ ] Update `src/config/site.ts`.
5. [ ] Replace the Nimbus seed content in `src/lib/brand.ts`.
6. [ ] Pick a starting theme preset and persist it in `src/themes/registry.json`.
7. [ ] Copy `.env.example` to `.env.local`.
8. [ ] Update `SECURITY.md` contact details.
9. [ ] Link the project to Vercel and set the production URL.
10. [ ] Configure GitHub branch protection.
11. [ ] Decide whether to keep, guard, or remove internal review routes.
12. [ ] Review inherited docs and remove anything not useful to the project.
13. [ ] Run the verification loop.
14. [ ] Keep a path for upstream starter updates.

## 1. Clone the starter

```bash
git clone https://github.com/davidvictor/website-starter.git client-foo
cd client-foo
rm -rf .git
git init
git add .
git commit -m "chore: initial commit from website starter"
```

Create the new GitHub repo and push:

```bash
gh repo create davidvictor/client-foo --private --source . --push
```

Pick a durable project name, not a temporary date-based name.

## 2. Rename package metadata

Update `package.json`:

- `name`: kebab-case project name, such as `client-foo-site`.
- `version`: usually reset to `0.1.0`.
- `description`: one sentence for the project.
- `repository.url`: the new GitHub URL.
- `homepage`: the new GitHub URL or production domain.
- `author`: project owner or agency owner.
- `private`: `true` for private client projects.
- `license`: keep MIT only when appropriate.

## 3. Update license

If MIT still applies, update the copyright line. Otherwise replace `LICENSE`
with the required project license.

## 4. Update site config

Edit `src/config/site.ts`:

```ts
export const siteConfig = {
  name: "Client Foo",
  description: "Short tagline for the client.",
  url: env.NEXT_PUBLIC_SITE_URL,
  ogImage: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
  links: {
    github: "https://github.com/davidvictor/client-foo",
  },
  navLinks: [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const
```

## 5. Replace Nimbus content

Nimbus is the starter's fictional seed company. Replace the values in
`src/lib/brand.ts` with the project's real content while keeping the typed shape
from `src/lib/brand-types.ts`.

Guidelines:

- Keep object keys stable unless the content model really changes.
- Replace whole arrays for pricing, FAQ, testimonials, jobs, values, and posts.
- Remove irrelevant sections from page composition instead of leaving empty data.
- Keep marketing copy out of `page.tsx` files.

## 6. Pick a theme

Start the app, open the dev panel with `~`, and tune Primary, Accent, Warmth,
and Preset. When the direction is worth keeping, copy the resolved settings into
`src/themes/registry.json`.

For a project-specific theme, add or update a theme entry in the clone. For a
generic improvement that should benefit future sites, make the change upstream
in `website-starter`.

## 7. Set environment variables

```bash
cp .env.example .env.local
```

Set:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In production, set `NEXT_PUBLIC_SITE_URL` to the canonical domain.

## 8. Update security contact

Edit `SECURITY.md` so vulnerability reports go to the right maintainer. Remove
the file only if the project deliberately does not publish a security policy.

## 9. Link Vercel

```bash
pnpm dlx vercel link
```

Set production environment variables in Vercel:

- `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`

Add the production domain under Vercel project settings.

## 10. Configure branch protection

On GitHub, protect `main`:

- Require pull request before merge.
- Require CI checks.
- Require branches to be up to date before merge.
- Optionally require linear history.

## 11. Decide internal route policy

The starter ships `/sandbox`, `/variants`, `/accessibility`, `/dashboard`,
`/login`, `/signup`, and `/examples/*` inside the `(internal)` route group.
They are useful while building and are noindexed plus excluded from the sitemap.

Before launch, choose one:

- **Keep:** leave them available but noindexed for the operator.
- **Guard:** add middleware or auth before sharing production widely.
- **Remove:** delete routes from `src/app/(internal)/` and prune related route
  and sidebar entries.

Do not expose internal reference routes as public marketing links unless the
project intentionally includes a visible design-system area.

## 12. Review inherited docs

Keep docs that help the new project. Remove or rewrite anything that only
describes the upstream starter.

Check:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/README.md`
- `docs/KNOWLEDGEBASE.md`
- `docs/CLIENT_PLAYBOOK.md`
- `docs/adr/`
- `docs/specs/`
- `docs/plans/`
- `docs/archive/`

## 13. Verify

For a fresh clone, run:

```bash
pnpm install
pnpm check
pnpm typecheck
pnpm test
pnpm audit:a11y
pnpm build
```

Then start the app and inspect:

- `/`
- `/pricing`
- `/variants`
- `/sandbox`
- `/accessibility`

## 14. Keep upstream updates available

If the project should receive future starter improvements, add the starter as an
upstream remote after creating the project repo:

```bash
git remote add starter https://github.com/davidvictor/website-starter.git
git fetch starter
```

When pulling improvements:

```bash
git fetch starter
git merge starter/main
pnpm install
pnpm check && pnpm typecheck && pnpm test && pnpm audit:a11y && pnpm build
```

Resolve conflicts deliberately. Content, site config, route choices, and themes
are expected to diverge by project. Tooling, accessibility checks, block-system
contracts, and agent guidance should stay as close to upstream as practical.

## What should stay generic upstream

- Stack and tooling.
- Block taxonomy and required variants.
- Theme derivation system.
- Dev panel architecture.
- Internal review routes.
- Accessibility and polish checks.
- Agent operating guidance.
- Clone setup documentation.

## What should become project-specific

- Brand content in `src/lib/brand.ts`.
- Site config in `src/config/site.ts`.
- Package metadata.
- Theme tuning.
- Production domain and Vercel project.
- Navigation and public route choices.
- Security contact.
