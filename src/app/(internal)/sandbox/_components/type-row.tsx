export function TypeRow({
  label,
  sample,
  className,
}: {
  label: string
  sample: string
  className: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-l-2 border-border pl-4">
      <span className="font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
      <p className={className}>{sample}</p>
    </div>
  )
}
