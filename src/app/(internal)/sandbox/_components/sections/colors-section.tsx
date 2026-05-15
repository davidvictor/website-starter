import { ColorTable } from "../color-table"
import { Section } from "../section"

export function ColorsSection() {
  return (
    <Section title="Colors" subtitle="Resolved for the active theme">
      <ColorTable />
    </Section>
  )
}
