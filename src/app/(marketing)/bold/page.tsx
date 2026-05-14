import {
  CtaBold,
  FaqBold,
  FeaturesBold,
  FooterBold,
  HeroBold,
  LogosBold,
  PricingBold,
  StatsBold,
  TestimonialsBold,
} from "@/components/blocks"

export const metadata = {
  title: "Bold · Nimbus",
}

export default function BoldHome() {
  return (
    <>
      <HeroBold />
      <LogosBold />
      <FeaturesBold />
      <StatsBold />
      <TestimonialsBold />
      <PricingBold />
      <FaqBold />
      <CtaBold />
      <FooterBold />
    </>
  )
}
