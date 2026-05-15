import {
  CtaSaas,
  FeaturesSaas,
  HeroSaas,
  PricingSaas,
} from "@/components/blocks"
import { getBlockProps } from "@/lib/brand-resolver"

export default function BlocksExamplePage() {
  return (
    <main className="flex flex-col">
      <HeroSaas {...getBlockProps("hero")} />
      <FeaturesSaas {...getBlockProps("features")} />
      <PricingSaas {...getBlockProps("pricing")} />
      <CtaSaas {...getBlockProps("cta")} />
    </main>
  )
}
