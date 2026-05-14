import {
  CtaSaas,
  FeaturesSaas,
  HeroSaas,
  PricingSaas,
} from "@/components/blocks"

export default function BlocksExamplePage() {
  return (
    <main className="flex flex-col">
      <HeroSaas />
      <FeaturesSaas />
      <PricingSaas />
      <CtaSaas />
    </main>
  )
}
