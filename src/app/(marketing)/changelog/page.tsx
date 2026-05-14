import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/motion/fade-in"
import { CtaSaas, FooterSaas } from "@/components/blocks"
import { changelog } from "@/lib/brand"

export const metadata = {
  title: "Changelog · Nimbus",
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function ChangelogPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Changelog
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="font-heading mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
              Every release, written down.
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              We ship most days. This is the record of what changed and why.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <ol className="flex flex-col gap-12">
            {changelog.map((entry, i) => (
              <FadeIn
                key={entry.version}
                delay={0.04 + (i % 3) * 0.04}
                className="grid grid-cols-1 gap-3 border-l border-border pl-6 md:grid-cols-[120px_1fr] md:gap-6 md:border-l-0 md:pl-0"
              >
                <div className="flex flex-col gap-1 md:items-end">
                  <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    {formatDate(entry.date)}
                  </span>
                  <span className="font-mono text-xs text-foreground">
                    v{entry.version}
                  </span>
                </div>
                <div className="flex flex-col gap-3 md:border-l md:border-border md:pl-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h2 className="font-heading text-2xl font-medium tracking-tight">
                    {entry.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">
                    {entry.summary}
                  </p>
                </div>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      <CtaSaas />
      <FooterSaas />
    </>
  )
}
