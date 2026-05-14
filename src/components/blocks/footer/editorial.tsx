import Link from "next/link"

import { brand } from "@/lib/brand"

const groups = [
  {
    label: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/customers", label: "Customers" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Resources",
    links: [
      { href: "/sandbox", label: "Design system" },
      { href: "/variants", label: "Variants" },
      { href: brand.socials.github, label: "GitHub" },
      { href: brand.socials.x, label: "X / Twitter" },
    ],
  },
] as const

export function FooterEditorial() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-12">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-4">
            <Link
              href="/"
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
              © {brand.currentYear} {brand.name}, Inc. — Made in San
              Francisco.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-3 md:col-span-2">
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
              <span className="size-1.5 rounded-full bg-emerald-500" />
              All systems normal
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
