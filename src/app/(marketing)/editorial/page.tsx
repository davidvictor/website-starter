import {
  CtaEditorial,
  FaqEditorial,
  FeaturesEditorial,
  FooterEditorial,
  HeroEditorial,
  LogosEditorial,
  PricingEditorial,
  StatsEditorial,
  TestimonialsEditorial,
} from "@/components/blocks"

export const metadata = {
  title: "Editorial · Nimbus",
}

export default function EditorialHome() {
  return (
    <>
      <HeroEditorial />
      <LogosEditorial />
      <FeaturesEditorial />
      <StatsEditorial />
      <TestimonialsEditorial />
      <PricingEditorial />
      <FaqEditorial />
      <CtaEditorial />
      <FooterEditorial />
    </>
  )
}
