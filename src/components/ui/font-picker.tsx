"use client"

import { Check, ChevronDown, Search } from "lucide-react"
import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  BUILT_IN_FONTS,
  type BuiltInFontKey,
  type FontCategory,
  type FontKey,
  fontLabel,
  GOOGLE_FONTS,
  loadGoogleFont,
  resolveFontFamily,
} from "@/lib/fonts"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type FontPickerProps = {
  value: FontKey
  onChange: (key: FontKey) => void
  /** Restrict which categories appear in the list. */
  categories?: readonly FontCategory[]
  /** A leading group of "recommended" / pinned fonts shown above search. */
  pinned?: readonly FontKey[]
  /** Placeholder when no value. */
  placeholder?: string
  /** className applied to the trigger button. */
  className?: string
  /** Optional id used for the dropdown content (a11y). */
  id?: string
  /** Disable the picker. */
  disabled?: boolean
}

/* ------------------------------------------------------------------ */
/* Catalog building                                                    */
/* ------------------------------------------------------------------ */

type CatalogItem = {
  key: FontKey
  family: string
  label: string
  category: FontCategory
  source: "built-in" | "google"
}

const ALL_BUILT_IN_KEYS = Object.keys(BUILT_IN_FONTS) as BuiltInFontKey[]

function builtInCategory(key: BuiltInFontKey): FontCategory {
  if (key === "system-serif" || key === "instrument-serif") return "serif"
  if (key.endsWith("-mono") || key === "system-mono") return "mono"
  return "sans"
}

function buildCatalog(
  categories: readonly FontCategory[] | undefined
): CatalogItem[] {
  const accept = categories ? new Set<FontCategory>(categories) : null

  const items: CatalogItem[] = []

  for (const key of ALL_BUILT_IN_KEYS) {
    const cat = builtInCategory(key)
    if (accept && !accept.has(cat)) continue
    items.push({
      key,
      family: fontLabel(key),
      label: fontLabel(key),
      category: cat,
      source: "built-in",
    })
  }

  for (const f of GOOGLE_FONTS) {
    if (accept && !accept.has(f.category)) continue
    items.push({
      key: `google:${f.family}`,
      family: f.family,
      label: f.family,
      category: f.category,
      source: "google",
    })
  }
  return items
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function FontPicker({
  value,
  onChange,
  categories,
  pinned,
  placeholder = "Choose a font",
  className,
  id,
  disabled = false,
}: FontPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const searchRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (open) {
      // Focus search after the popover mounts so the user can type immediately.
      const id = requestAnimationFrame(() => searchRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  const catalog = React.useMemo(() => buildCatalog(categories), [categories])

  const pinnedItems = React.useMemo<CatalogItem[]>(() => {
    if (!pinned) return []
    return pinned
      .map((k) => catalog.find((c) => c.key === k))
      .filter((c): c is CatalogItem => Boolean(c))
  }, [pinned, catalog])

  const pinnedKeys = React.useMemo(
    () => new Set(pinnedItems.map((i) => i.key)),
    [pinnedItems]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((c) => {
      if (pinnedKeys.has(c.key)) return false
      if (!q) return true
      return c.label.toLowerCase().includes(q)
    })
  }, [catalog, query, pinnedKeys])

  /**
   * Eagerly load Google fonts that become visible while scrolling. We
   * re-attach the observer whenever the filtered list or pinned list
   * changes, since those mount/unmount the targets we need to watch.
   */
  const sentinelRoot = React.useRef<HTMLDivElement | null>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: filtered/pinnedItems intentionally re-run the observer when DOM rows change
  React.useEffect(() => {
    if (!open) return
    const root = sentinelRoot.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const fam = (entry.target as HTMLElement).dataset.family
            if (fam) loadGoogleFont(fam)
          }
        }
      },
      { root, rootMargin: "80px", threshold: 0.01 }
    )
    const targets = root.querySelectorAll<HTMLElement>("[data-google-preview]")
    for (const el of Array.from(targets)) {
      observer.observe(el)
    }
    return () => observer.disconnect()
  }, [open, filtered, pinnedItems])

  const currentLabel = value ? fontLabel(value) : placeholder

  function select(k: FontKey) {
    onChange(k)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover open={open} onOpenChange={(v) => setOpen(Boolean(v))}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        data-slot="font-picker-trigger"
        className={cn(
          "group/font-picker flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2.5 text-xs transition-colors outline-none cursor-pointer hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:bg-muted dark:bg-input/30 dark:hover:bg-input/50",
          className
        )}
      >
        <span
          className="min-w-0 flex-1 truncate text-left"
          style={{
            fontFamily: value ? resolveFontFamily(value) : undefined,
          }}
        >
          {currentLabel}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-aria-expanded/font-picker:rotate-180" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="flex w-(--anchor-width) min-w-[260px] flex-col gap-0 p-0"
      >
        <div className="flex h-9 items-center gap-2 border-b border-border px-2.5">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fonts..."
            className="h-full w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground"
            >
              clear
            </button>
          )}
        </div>

        <div
          ref={sentinelRoot}
          className="max-h-[280px] overflow-y-auto overscroll-contain p-1"
        >
          {pinnedItems.length > 0 && query === "" && (
            <FontGroup label="Recommended">
              {pinnedItems.map((item) => (
                <FontRow
                  key={item.key}
                  item={item}
                  active={item.key === value}
                  onSelect={select}
                />
              ))}
            </FontGroup>
          )}

          {filtered.length === 0 && (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              No fonts match "{query}".
            </div>
          )}

          {filtered.length > 0 && (
            <FontGroup
              label={
                pinnedItems.length > 0 && query === "" ? "All fonts" : undefined
              }
            >
              {filtered.map((item) => (
                <FontRow
                  key={item.key}
                  item={item}
                  active={item.key === value}
                  onSelect={select}
                />
              ))}
            </FontGroup>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-rows                                                            */
/* ------------------------------------------------------------------ */

function FontGroup({
  label,
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-px">
      {label && (
        <div className="px-2 pt-2 pb-1 text-[9px] font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

function FontRow({
  item,
  active,
  onSelect,
}: {
  item: CatalogItem
  active: boolean
  onSelect: (k: FontKey) => void
}) {
  // Resolve the family stack to apply for preview text.
  const previewFamily = React.useMemo(
    () => resolveFontFamily(item.key),
    [item.key]
  )

  return (
    <button
      type="button"
      data-google-preview={item.source === "google" ? "" : undefined}
      data-family={item.source === "google" ? item.family : undefined}
      data-active={active || undefined}
      onClick={() => onSelect(item.key)}
      className={cn(
        "group/font-row flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors cursor-pointer hover:bg-muted",
        active && "bg-muted"
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className="truncate text-sm leading-tight"
          style={{ fontFamily: previewFamily }}
        >
          {item.label}
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
          {item.source === "google" ? "google" : "built-in"}
          <span className="size-[3px] rounded-full bg-muted-foreground/40" />
          {item.category}
        </span>
      </span>
      {active && <Check className="size-3.5 shrink-0 text-foreground" />}
    </button>
  )
}
