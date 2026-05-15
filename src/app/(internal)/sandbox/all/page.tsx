import { PageHeader } from "../_components/page-header"
import { SectionTOC } from "../_components/section-toc"
import { ColorsSection } from "../_components/sections/colors-section"
import { FormsSection } from "../_components/sections/forms-section"
import { NavigationSection } from "../_components/sections/navigation-section"
import { OverlaysSection } from "../_components/sections/overlays-section"
import { SurfacesSection } from "../_components/sections/surfaces-section"
import { TypographySection } from "../_components/sections/typography-section"

export default function AllComponentsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <PageHeader
        title="All components"
        description="The whole design system on one page."
      />
      <SectionTOC />
      <section id="colors" className="scroll-mt-16">
        <ColorsSection />
      </section>
      <section id="typography" className="scroll-mt-16">
        <TypographySection />
      </section>
      <section id="forms" className="scroll-mt-16">
        <FormsSection />
      </section>
      <section id="surfaces" className="scroll-mt-16">
        <SurfacesSection />
      </section>
      <section id="navigation" className="scroll-mt-16">
        <NavigationSection />
      </section>
      <section id="overlays" className="scroll-mt-16">
        <OverlaysSection />
      </section>
    </div>
  )
}
