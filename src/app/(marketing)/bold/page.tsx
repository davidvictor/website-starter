import { ComposedPage } from "@/components/composed-page"
import { siteMetadata } from "@/lib/metadata"

export const metadata = siteMetadata({
  title: "Bold",
  description: "An expressive, high-contrast starter composition.",
  path: "/bold",
})

export default function BoldHome() {
  return <ComposedPage compositionId="bold" />
}
