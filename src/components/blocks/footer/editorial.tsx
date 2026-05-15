import Link from "next/link"

import type { FooterProps } from "../props"

type FooterLink = { href: string; label: string }

function linksFor(navLinks: FooterLink[] | readonly FooterLink[]) {
  const byHref = new Map(navLinks.map((link) => [link.href, link]))
  const pick = (href: string) => byHref.get(href)

  return {
    product: [pick("/pricing"), pick("/customers"), pick("/changelog")].filter(
      Boolean
    ) as FooterLink[],
    company: [
      pick("/about"),
      pick("/careers"),
      pick("/blog"),
      pick("/contact"),
    ].filter(Boolean) as FooterLink[],
  }
}

export function FooterEditorial({ brand, navLinks = [] }: FooterProps) {
  const groupedLinks = linksFor(navLinks)
  const resourceLinks = [
    { href: brand.socials?.github, label: "GitHub" },
    { href: brand.socials?.x, label: "X / Twitter" },
  ].filter((link): link is FooterLink => Boolean(link.href))

  const groups = [
    { label: "Product", links: groupedLinks.product },
    { label: "Company", links: groupedLinks.company },
    { label: "Resources", links: resourceLinks },
  ].filter((group) => group.links.length > 0)

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-12">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-4">
            <Link
              href="/"
              data-touch
              className="flex items-center gap-2 text-sm font-semibold tracking-tight"
            >
              <span className="grid size-6 place-items-center rounded-md bg-foreground text-background">
                <span className="size-2 rounded-full bg-background" />
              </span>
              <span>{brand.wordmark}</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {brand.description}
            </p>
            <p className="mt-auto font-mono text-xs text-muted-foreground">
              © {brand.currentYear} {brand.name}, Inc. — Made in San Francisco.
            </p>
          </div>

          {groups.map((group) => (
            <div
              key={group.label}
              className="flex flex-col gap-3 md:col-span-2"
            >
              <h3 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-col gap-1.5 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground/85 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 flex flex-col gap-3 md:col-span-2">
            <h3 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Status
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-success" />
              All systems normal
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
