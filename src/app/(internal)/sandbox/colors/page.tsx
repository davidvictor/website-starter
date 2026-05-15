import { ColorTable } from "../_components/color-table"
import { PageHeader } from "../_components/page-header"

export default function ColorsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Colors"
        description="Every color token resolved for the active theme."
      />
      <ColorTable />
    </div>
  )
}
