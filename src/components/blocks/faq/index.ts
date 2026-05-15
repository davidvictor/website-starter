import type { VariantRegistryFor } from "../types"
import { FaqBold } from "./bold"
import { FaqEditorial } from "./editorial"
import { FaqSaas } from "./saas"

export const faqVariants: VariantRegistryFor<"faq"> = {
  editorial: { id: "editorial", label: "Editorial", Component: FaqEditorial },
  saas: { id: "saas", label: "SaaS", Component: FaqSaas },
  bold: { id: "bold", label: "Bold", Component: FaqBold },
}

export { FaqBold, FaqEditorial, FaqSaas }
