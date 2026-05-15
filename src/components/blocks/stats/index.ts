import type { VariantRegistryFor } from "../types"
import { StatsBold } from "./bold"
import { StatsEditorial } from "./editorial"
import { StatsSaas } from "./saas"

export const statsVariants: VariantRegistryFor<"stats"> = {
  editorial: { id: "editorial", label: "Editorial", Component: StatsEditorial },
  saas: { id: "saas", label: "SaaS", Component: StatsSaas },
  bold: { id: "bold", label: "Bold", Component: StatsBold },
}

export { StatsBold, StatsEditorial, StatsSaas }
