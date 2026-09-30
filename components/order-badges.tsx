import { Badge } from "@/components/ui/badge"
import {
  priorityLabel,
  stageLabel,
  type PriorityKey,
  type StageKey,
} from "@/lib/production"
import { cn } from "@/lib/utils"

const STAGE_STYLES: Record<StageKey, string> = {
  diterima: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  bahan: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  produksi: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  qc: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  packing: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  pengiriman: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  selesai: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

const PRIORITY_STYLES: Record<PriorityKey, string> = {
  normal: "text-muted-foreground",
  tinggi: "border-amber-500/40 text-amber-700 dark:text-amber-300",
  urgent: "border-red-500/40 text-red-700 dark:text-red-300",
}

export function StageBadge({
  stage,
  className,
}: {
  stage: StageKey
  className?: string
}) {
  return (
    <Badge variant="secondary" className={cn(STAGE_STYLES[stage], className)}>
      {stageLabel(stage)}
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: PriorityKey
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn(PRIORITY_STYLES[priority], className)}>
      {priorityLabel(priority)}
    </Badge>
  )
}

export function LateBadge({ className }: { className?: string }) {
  return (
    <Badge variant="destructive" className={className}>
      Terlambat
    </Badge>
  )
}
