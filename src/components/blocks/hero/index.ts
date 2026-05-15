import type { VariantRegistryFor } from "../types"
import { HeroBold } from "./bold"
import { HeroEditorial } from "./editorial"
import { HeroSaas } from "./saas"

export const heroVariants: VariantRegistryFor<"hero"> = {
  editorial: { id: "editorial", label: "Editorial", Component: HeroEditorial },
  saas: { id: "saas", label: "SaaS", Component: HeroSaas },
  bold: { id: "bold", label: "Bold", Component: HeroBold },
}

export { HeroBold, HeroEditorial, HeroSaas }
