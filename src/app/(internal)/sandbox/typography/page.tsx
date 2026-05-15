import { PageHeader } from "../_components/page-header"
import { TypographySection } from "../_components/sections/typography-section"

export default function TypographyPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Typography"
        description="Type ramp, tabular numbers, and radii."
      />
      <TypographySection />
    </div>
  )
}
