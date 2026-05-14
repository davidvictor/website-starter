import { SiteHeader } from "@/components/blocks/site-header"
import { RouteTransition } from "@/components/motion/route-transition"
import { RouteTransitionProvider } from "@/components/motion/route-transition-context"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteTransitionProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </RouteTransitionProvider>
  )
}
