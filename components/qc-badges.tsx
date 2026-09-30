import { Badge } from "@/components/ui/badge"
import { STATUS_LABEL, type TaskStatus } from "@/lib/qc"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<TaskStatus, string> = {
  belum: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  diperiksa: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  selesai: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export function StatusBadge({
  status,
  className,
}: {
  status: TaskStatus
  className?: string
}) {
  return (
    <Badge variant="secondary" className={cn(STATUS_STYLES[status], className)}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function OverdueBadge({ className }: { className?: string }) {
  return (
    <Badge variant="destructive" className={className}>
      Lewat batas waktu
    </Badge>
  )
}
