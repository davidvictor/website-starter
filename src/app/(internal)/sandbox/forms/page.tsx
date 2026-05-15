import { PageHeader } from "../_components/page-header"
import { FormsSection } from "../_components/sections/forms-section"

export default function FormsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Forms"
        description="Inputs, selectors, sliders, buttons."
      />
      <FormsSection />
    </div>
  )
}
