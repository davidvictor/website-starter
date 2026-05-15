import type { Metadata } from "next"
import { InternalSidebar } from "@/components/internal-sidebar/internal-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { siteMetadata } from "@/lib/metadata"

export const metadata: Metadata = siteMetadata({
  title: "Internal Reference",
  description:
    "Noindex design-system reference routes for building and validating a client site.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
})

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <InternalSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
