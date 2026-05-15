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

export function FooterBold({ brand, navLinks = [] }: FooterProps) {
  const groupedLinks = linksFor(navLinks)
  const socialLinks = [
    { href: brand.socials?.x, label: "X / Twitter" },
    { href: brand.socials?.github, label: "GitHub" },
    { href: brand.socials?.linkedin, label: "LinkedIn" },
  ].filter((link): link is FooterLink => Boolean(link.href))

  const groups = [
    { label: "Product", links: groupedLinks.product },
    { label: "Company", links: groupedLinks.company },
  ].filter((group) => group.links.length > 0)

  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10">
          <Link
            href="/"
            className="font-heading text-balance text-[clamp(3rem,12vw,9rem)] leading-[0.85] font-bold tracking-tighter"
          >
            {brand.wordmark}.
          </Link>

          <div className="grid grid-cols-2 gap-10 border-t border-background/15 pt-10 md:grid-cols-4">
            {groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-3">
                <h3 className="font-mono text-[10px] tracking-widest text-background/60 uppercase">
                  {group.label}
                </h3>
                <ul className="flex flex-col gap-2 text-sm">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-background transition-opacity hover:opacity-70"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-3">
              <h3 className="font-mono text-[10px] tracking-widest text-background/60 uppercase">
                Find us
              </h3>
              <ul className="flex flex-col gap-2 text-sm">
                {socialLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:opacity-70">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="font-mono text-xs text-background/60">
            © {brand.currentYear} {brand.name}, Inc. ·{" "}
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" />
              all systems normal
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
