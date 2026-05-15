export function SubSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </h3>
      {children}
    </div>
  )
}
