"use client"

import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { TransitionLink as Link } from "@/components/motion/transition-link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BrandCore } from "./props"

const MOBILE_MENU_ID = "marketing-mobile-menu"

type SiteHeaderProps = {
  brand: BrandCore
  navLinks: readonly { href: string; label: string }[]
}

export function SiteHeader({ brand, navLinks }: SiteHeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 6)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  // Close mobile menu on route change.
  useEffect(() => {
    if (pathname) setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-transparent bg-background/70 backdrop-blur-md transition-colors",
        scrolled && "border-border bg-background/85"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
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

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden md:inline-flex"
            )}
          >
            Talk to us
          </Link>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden md:inline-flex"
            )}
          >
            Get started
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            data-touch
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div
          id={MOBILE_MENU_ID}
          className="border-t border-border bg-background md:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "flex-1"
                )}
              >
                Talk to us
              </Link>
              <Link
                href="/pricing"
                className={cn(buttonVariants({ size: "sm" }), "flex-1")}
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
