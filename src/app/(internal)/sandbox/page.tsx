import Link from "next/link"
import { indexCards } from "./_components/index-cards"
import { PageHeader } from "./_components/page-header"

export default function SandboxIndexPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <PageHeader
        title="Sandbox"
        description="Design-system reference for the active theme."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {indexCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-1 rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-muted/40"
          >
            <span className="font-medium">{card.title}</span>
            <span className="text-sm text-muted-foreground">
              {card.description}
            </span>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Other internal routes (variants, dashboard, examples, login, signup) are
        in the sidebar.
      </p>
    </div>
  )
}
