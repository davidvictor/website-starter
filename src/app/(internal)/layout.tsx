import { InternalSidebar } from "@/components/internal-sidebar/internal-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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
