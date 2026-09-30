import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="max-w-md space-y-1">
        <h2 className="font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children && (
        <div className="mt-1 flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
          {children}
        </div>
      )}
    </div>
  )
}

/** Penjelasan singkat di dekat tombol yang sedang nonaktif. */
export function DisabledReason({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  )
}
