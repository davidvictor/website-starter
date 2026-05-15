import { Mail, MapPin, Phone } from "lucide-react"
import { FooterSaas } from "@/components/blocks"
import { FadeIn } from "@/components/motion/fade-in"
import { brand } from "@/lib/brand"
import { getBlockProps } from "@/lib/brand-resolver"
import { siteMetadata } from "@/lib/metadata"
import { ContactForm } from "./contact-form"

export const metadata = siteMetadata({
  title: "Contact",
  description: "A polished contact route for the website starter.",
  path: "/contact",
})

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 py-20 sm:px-6 sm:py-28 md:grid-cols-12 lg:px-8">
          <FadeIn className="md:col-span-5">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Contact
            </p>
            <h1 className="font-heading mt-4 text-balance text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              Tell us what you&apos;re building.
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
              We answer real emails. A founding engineer reads every submission;
              one of them replies within a business day.
            </p>

            <ul className="mt-10 flex flex-col gap-4">
              <li className="flex items-center gap-3 text-sm">
                <span className="grid size-9 place-items-center rounded-md border border-border bg-muted/40">
                  <Mail className="size-4" />
                </span>
                <a
                  href={`mailto:hello@${brand.domain}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  hello@{brand.domain}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="grid size-9 place-items-center rounded-md border border-border bg-muted/40">
                  <Phone className="size-4" />
                </span>
                <span className="text-foreground">+1 (415) 555-0184</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="grid size-9 place-items-center rounded-md border border-border bg-muted/40">
                  <MapPin className="size-4" />
                </span>
                <span className="text-foreground">San Francisco, CA</span>
              </li>
            </ul>
          </FadeIn>

          <FadeIn delay={0.1} className="md:col-span-7">
            <ContactForm />
          </FadeIn>
        </div>
      </section>

      <FooterSaas {...getBlockProps("footer")} />
    </>
  )
}
