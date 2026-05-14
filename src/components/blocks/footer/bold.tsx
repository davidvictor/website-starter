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
] as const

export function FooterBold() {
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
                <li>
                  <a
                    href={brand.socials.x}
                    className="hover:opacity-70"
                  >
                    X / Twitter
                  </a>
                </li>
                <li>
                  <a
                    href={brand.socials.github}
                    className="hover:opacity-70"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href={brand.socials.linkedin}
                    className="hover:opacity-70"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <p className="font-mono text-xs text-background/60">
            © {brand.currentYear} {brand.name}, Inc. ·{" "}
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              all systems normal
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
