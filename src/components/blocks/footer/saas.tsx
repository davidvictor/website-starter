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

export function FooterSaas({ brand, navLinks = [] }: FooterProps) {
  const groupedLinks = linksFor(navLinks)
  const socialLinks = [
    { href: brand.socials?.github, label: "GitHub" },
    { href: brand.socials?.x, label: "X / Twitter" },
    { href: brand.socials?.linkedin, label: "LinkedIn" },
  ].filter((link): link is FooterLink => Boolean(link.href))

  const groups = [
    { label: "Product", links: groupedLinks.product },
    { label: "Company", links: groupedLinks.company },
    { label: "Build with us", links: socialLinks },
  ].filter((group) => group.links.length > 0)

  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
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
            <p className="max-w-xs text-sm text-muted-foreground">
              {brand.description}
            </p>
          </div>

          {groups.map((group) => (
            <div
              key={group.label}
              className="flex flex-col gap-3 md:col-span-2"
            >
              <h3 className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                {group.label}
              </h3>
              <ul className="flex flex-col gap-2 text-sm">
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
            <h3 className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Status
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="size-1.5 animate-pulse rounded-full bg-success motion-reduce:animate-none" />
              <span className="text-foreground/85">All systems normal</span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              v0.42.0 · {brand.currentYear}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {brand.currentYear} {brand.name}, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
