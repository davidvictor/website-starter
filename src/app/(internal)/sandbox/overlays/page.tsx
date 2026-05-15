import { PageHeader } from "../_components/page-header"
import { OverlaysSection } from "../_components/sections/overlays-section"

export default function OverlaysPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Overlays"
        description="Dialogs, sheets, drawers, popovers, menus, tooltips, command palette."
      />
      <OverlaysSection />
    </div>
  )
}
