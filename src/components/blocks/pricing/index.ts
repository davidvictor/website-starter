import type { VariantRegistryFor } from "../types"
import { PricingBold } from "./bold"
import { PricingEditorial } from "./editorial"
import { PricingSaas } from "./saas"

export const pricingVariants: VariantRegistryFor<"pricing"> = {
  editorial: {
    id: "editorial",
    label: "Editorial",
    Component: PricingEditorial,
  },
  saas: { id: "saas", label: "SaaS", Component: PricingSaas },
  bold: { id: "bold", label: "Bold", Component: PricingBold },
}

export { PricingBold, PricingEditorial, PricingSaas }
