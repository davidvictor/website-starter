import { PageHeader } from "../_components/page-header"
import { NavigationSection } from "../_components/sections/navigation-section"

export default function NavigationPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Navigation"
        description="Tabs, accordion, breadcrumb, navigation menu, menubar."
      />
      <NavigationSection />
    </div>
  )
}
