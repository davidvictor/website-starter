import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CtaSaas, FooterSaas } from "@/components/blocks"
import { FadeIn } from "@/components/motion/fade-in"
import { Badge } from "@/components/ui/badge"
import { blogPostBody, blogPosts } from "@/lib/brand"

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) return { title: "Not found" }
  return {
    title: `${post.title} · Nimbus blog`,
    description: post.excerpt,
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Minimal markdown-to-JSX for the seeded body.
function renderBody(body: string) {
  const lines = body.trim().split("\n")
  const out: React.ReactNode[] = []
  let codeBuffer: string[] | null = null

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (codeBuffer === null) {
        codeBuffer = []
      } else {
        out.push(
          <pre
            key={`code-${i}`}
            className="overflow-x-auto rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono text-xs leading-relaxed"
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        )
        codeBuffer = null
      }
      return
    }
    if (codeBuffer !== null) {
      codeBuffer.push(line)
      return
    }
    if (line.startsWith("## ")) {
      out.push(
        <h2
          key={`h2-${i}`}
          className="font-heading mt-12 text-2xl font-semibold tracking-tight"
        >
          {line.replace(/^## /, "")}
        </h2>
      )
      return
    }
    if (line.startsWith("- ")) {
      out.push(
        <li key={`li-${i}`} className="ml-5 list-disc leading-relaxed">
          {line.replace(/^- /, "")}
        </li>
      )
      return
    }
    if (line.trim() === "") return
    if (/^[—–-]\s*\w/.test(line.trim())) {
      out.push(
        <p
          key={`sig-${i}`}
          className="mt-8 font-mono text-sm text-muted-foreground"
        >
          {line}
        </p>
      )
      return
    }
    out.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {line}
      </p>
    )
  })

  return out
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  if (!post) notFound()

  return (
    <>
      <article className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <FadeIn>
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All posts
            </Link>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{post.tag}</Badge>
                <span>·</span>
                <span className="tabular">{formatDate(post.date)}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h1 className="font-heading text-balance text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                {post.title}
              </h1>
              <p className="text-balance text-lg leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="my-12 flex items-center gap-3 border-y border-border py-4">
              <span className="grid size-9 place-items-center rounded-full border border-border bg-muted/40 font-mono text-xs">
                {post.author.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{post.author.name}</span>
                <span className="text-xs text-muted-foreground">
                  {post.author.role}
                </span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="prose-like flex flex-col gap-5 text-base leading-relaxed">
              {renderBody(blogPostBody)}
            </div>
          </FadeIn>
        </div>
      </article>

      <CtaSaas />
      <FooterSaas />
    </>
  )
}
