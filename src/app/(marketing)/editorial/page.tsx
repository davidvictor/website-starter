import { ComposedPage } from "@/components/composed-page"
import { siteMetadata } from "@/lib/metadata"

export const metadata = siteMetadata({
  title: "Editorial",
  description: "A single-column print-paced starter composition.",
  path: "/editorial",
})

export default function EditorialHome() {
  return <ComposedPage compositionId="editorial" />
}
