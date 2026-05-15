import type { VariantRegistryFor } from "../types"
import { FooterBold } from "./bold"
import { FooterEditorial } from "./editorial"
import { FooterSaas } from "./saas"

export const footerVariants: VariantRegistryFor<"footer"> = {
  editorial: {
    id: "editorial",
    label: "Editorial",
    Component: FooterEditorial,
  },
  saas: { id: "saas", label: "SaaS", Component: FooterSaas },
  bold: { id: "bold", label: "Bold", Component: FooterBold },
}

export { FooterBold, FooterEditorial, FooterSaas }
