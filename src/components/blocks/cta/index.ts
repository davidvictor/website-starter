import type { VariantRegistryFor } from "../types"
import { CtaBold } from "./bold"
import { CtaEditorial } from "./editorial"
import { CtaSaas } from "./saas"

export const ctaVariants: VariantRegistryFor<"cta"> = {
  editorial: { id: "editorial", label: "Editorial", Component: CtaEditorial },
  saas: { id: "saas", label: "SaaS", Component: CtaSaas },
  bold: { id: "bold", label: "Bold", Component: CtaBold },
}

export { CtaBold, CtaEditorial, CtaSaas }
