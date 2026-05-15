import { PageHeader } from "../_components/page-header"
import { SurfacesSection } from "../_components/sections/surfaces-section"

export default function SurfacesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Surfaces"
        description="Cards, alerts, badges, skeletons, progress, separators, avatars, and empty states."
      />
      <SurfacesSection />
    </div>
  )
}
