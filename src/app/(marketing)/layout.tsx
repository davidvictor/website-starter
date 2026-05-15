import { SiteHeader } from "@/components/blocks/site-header"
import { RouteTransition } from "@/components/motion/route-transition"
import { RouteTransitionProvider } from "@/components/motion/route-transition-context"
import { getBlockProps } from "@/lib/brand-resolver"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { brand, navLinks } = getBlockProps("footer")

  return (
    <RouteTransitionProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader brand={brand} navLinks={navLinks ?? []} />
        <main className="flex flex-1 flex-col">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </RouteTransitionProvider>
  )
}
