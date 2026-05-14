import { SiteHeader } from "@/components/blocks/site-header"
import { RouteTransition } from "@/components/motion/route-transition"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <RouteTransition mode="vertical-translate">{children}</RouteTransition>
      </main>
    </div>
  )
}
