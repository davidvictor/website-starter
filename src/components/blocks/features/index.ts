import type { VariantRegistryFor } from "../types"
import { FeaturesBold } from "./bold"
import { FeaturesEditorial } from "./editorial"
import { FeaturesSaas } from "./saas"

export const featuresVariants: VariantRegistryFor<"features"> = {
  editorial: {
    id: "editorial",
    label: "Editorial",
    Component: FeaturesEditorial,
  },
  saas: { id: "saas", label: "SaaS", Component: FeaturesSaas },
  bold: { id: "bold", label: "Bold", Component: FeaturesBold },
}

export { FeaturesBold, FeaturesEditorial, FeaturesSaas }
