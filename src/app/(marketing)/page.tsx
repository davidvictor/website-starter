import { ComposedPage } from "@/components/composed-page"
import { siteMetadata } from "@/lib/metadata"

export const metadata = siteMetadata({ path: "/" })

export default function HomePage() {
  return <ComposedPage compositionId="saas" />
}
