export function SampleStrip() {
  return (
    <div className="flex flex-col gap-3">
      {/* Display + body */}
      <div className="flex flex-col gap-1.5">
        <p className="font-heading text-3xl font-semibold tracking-tight">
          The quick brown fox.
        </p>
        <p className="text-sm text-foreground">
          The quick brown fox jumps over the lazy dog. Pack my box with five
          dozen liquor jugs.
        </p>
        <p className="text-xs text-muted-foreground">
          Muted: how vexingly quick daft zebras jump.
        </p>
      </div>

      {/* Filled affordances */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Primary
        </span>
        <span className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">
          Secondary
        </span>
        <span className="rounded-md bg-accent px-3 py-1.5 text-sm text-accent-foreground">
          Accent
        </span>
        <span className="rounded-md bg-brand-accent px-3 py-1.5 text-sm text-brand-accent-foreground">
          Brand
        </span>
        <span className="rounded-md bg-destructive px-3 py-1.5 text-sm text-background">
          Destructive
        </span>
      </div>

      {/* Inputs + semantic */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex h-8 items-center rounded-md border border-input bg-background px-2 text-xs text-muted-foreground">
          input border
        </span>
        <span className="inline-flex h-8 items-center rounded-md px-2 text-xs ring-2 ring-ring">
          focus ring
        </span>
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-success" />
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-warning" />
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-info" />
        <span className="inline-flex h-2 w-2 self-center rounded-full bg-destructive" />
      </div>
    </div>
  )
}
