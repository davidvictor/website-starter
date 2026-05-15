"use client"

const items: { id: string; label: string }[] = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "forms", label: "Forms" },
  { id: "surfaces", label: "Surfaces" },
  { id: "navigation", label: "Navigation" },
  { id: "overlays", label: "Overlays" },
]

export function SectionTOC() {
  return (
    <nav
      aria-label="Sections on this page"
      className="sticky top-0 z-10 -mx-6 flex flex-wrap gap-2 border-b border-border bg-background/80 px-6 py-3 backdrop-blur"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
