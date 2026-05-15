import type { VariantRegistryFor } from "../types"
import { TestimonialsBold } from "./bold"
import { TestimonialsEditorial } from "./editorial"
import { TestimonialsSaas } from "./saas"

export const testimonialsVariants: VariantRegistryFor<"testimonials"> = {
  editorial: {
    id: "editorial",
    label: "Editorial",
    Component: TestimonialsEditorial,
  },
  saas: { id: "saas", label: "SaaS", Component: TestimonialsSaas },
  bold: { id: "bold", label: "Bold", Component: TestimonialsBold },
}

export { TestimonialsBold, TestimonialsEditorial, TestimonialsSaas }
