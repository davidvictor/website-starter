import { Section } from "../section"
import { SubSection } from "../sub-section"
import { TypeRow } from "../type-row"

export function TypographySection() {
  return (
    <Section title="Typography">
      <SubSection label="Ramp">
        <div className="flex flex-col gap-6">
          <TypeRow
            label="display · font-heading"
            sample="The quick brown fox jumps over the lazy dog."
            className="font-heading text-5xl leading-tight tracking-tight"
          />
          <TypeRow
            label="h1 · font-sans"
            sample="Marketing experiments live here."
            className="font-sans text-3xl font-semibold tracking-tight"
          />
          <TypeRow
            label="h2 · font-sans"
            sample="Each section is a prototype."
            className="font-sans text-2xl font-semibold tracking-tight"
          />
          <TypeRow
            label="h3 · font-sans"
            sample="Smaller headings for sub-areas."
            className="font-sans text-xl font-semibold tracking-tight"
          />
          <TypeRow
            label="body · font-sans"
            sample="Body text uses the sans variable. It should read comfortably at 16px on most modern devices, with hanging punctuation and balanced wrapping where supported."
            className="font-sans text-base leading-relaxed"
          />
          <TypeRow
            label="body-sm · font-sans"
            sample="Smaller body text for dense surfaces."
            className="font-sans text-sm"
          />
          <TypeRow
            label="caption · font-sans"
            sample="Captions and asides sit here."
            className="font-sans text-xs text-muted-foreground"
          />
          <TypeRow
            label="mono · font-mono"
            sample="const greeting = `hello, ${name}`"
            className="font-mono text-sm"
          />
        </div>
      </SubSection>

      <SubSection label="Tabular numbers">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              default
            </span>
            <p className="font-sans text-base">0123456789</p>
            <p className="font-sans text-base">$ 12,345.67</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
            <span className="font-mono text-[10px] text-muted-foreground">
              tabular-nums
            </span>
            <p className="font-sans text-base tabular-nums">0123456789</p>
            <p className="font-sans text-base tabular-nums">$ 12,345.67</p>
          </div>
        </div>
      </SubSection>

      <SubSection label="Radii">
        <div className="flex flex-wrap gap-4">
          {[
            { label: "sm", className: "rounded-sm" },
            { label: "md", className: "rounded-md" },
            { label: "lg", className: "rounded-lg" },
            { label: "xl", className: "rounded-xl" },
            { label: "2xl", className: "rounded-2xl" },
            { label: "full", className: "rounded-full" },
          ].map(({ label, className }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`size-16 border border-border bg-muted ${className}`}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  )
}
