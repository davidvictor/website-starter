import type { VariantRegistryFor } from "../types"
import { LogosBold } from "./bold"
import { LogosEditorial } from "./editorial"
import { LogosSaas } from "./saas"

export const logosVariants: VariantRegistryFor<"logos"> = {
  editorial: { id: "editorial", label: "Editorial", Component: LogosEditorial },
  saas: { id: "saas", label: "SaaS", Component: LogosSaas },
  bold: { id: "bold", label: "Bold", Component: LogosBold },
}

export { LogosBold, LogosEditorial, LogosSaas }
