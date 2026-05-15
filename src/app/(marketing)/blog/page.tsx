import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { CtaSaas, FooterSaas } from "@/components/blocks"
import { FadeIn } from "@/components/motion/fade-in"
import { Badge } from "@/components/ui/badge"
import { blogPosts } from "@/lib/brand"
import { getBlockProps } from "@/lib/brand-resolver"
import { siteMetadata } from "@/lib/metadata"

export const metadata = siteMetadata({
  title: "Blog",
  description: "Editorial article scaffolding for the website starter.",
  path: "/blog",
})

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function BlogIndexPage() {
  const [featured, ...rest] = blogPosts

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <FadeIn>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Blog
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="font-heading mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
              Field notes from the cognitive layer.
            </h1>
          </FadeIn>
        </div>
      </section>

      {featured && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <FadeIn>
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12"
              >
                <div className="md:col-span-7">
                  <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-foreground/8 to-foreground/2 transition-transform group-hover:scale-[1.005]">
                    <div className="grid h-full place-items-center font-mono text-xs text-muted-foreground">
                      Featured cover · /blog/{featured.slug}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 md:col-span-5 md:justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{featured.tag}</Badge>
                    <span>·</span>
                    <span className="tabular">{formatDate(featured.date)}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <h2 className="font-heading text-balance text-3xl leading-tight font-semibold tracking-tight md:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="grid size-7 place-items-center rounded-full border border-border bg-muted/40 font-mono text-[10px]">
                      {featured.author.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <span className="font-medium">{featured.author.name}</span>
                    <span className="text-muted-foreground">
                      · {featured.author.role}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 group-hover:underline">
                    Read post
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </FadeIn>
          </div>
        </section>
      )}

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
            {rest.map((post, i) => (
              <FadeIn
                key={post.slug}
                delay={0.04 + (i % 3) * 0.04}
                className="flex flex-col gap-4"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-4"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-foreground/6 to-foreground/2 transition-transform group-hover:scale-[1.005]">
                    <div className="grid h-full place-items-center font-mono text-[10px] text-muted-foreground">
                      /{post.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {post.tag}
                    </Badge>
                    <span>·</span>
                    <span className="tabular">{formatDate(post.date)}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold leading-snug tracking-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.author.name}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CtaSaas {...getBlockProps("cta")} />
      <FooterSaas {...getBlockProps("footer")} />
    </>
  )
}
