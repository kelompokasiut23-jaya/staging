import Link from "next/link"
import { ChevronRightIcon, ClockIcon } from "lucide-react"

import { OverdueBadge, StatusBadge } from "@/components/qc-badges"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  formatNumber,
  formatTime,
  isOverdue,
  timeLeft,
  totals,
  type QcTask,
} from "@/lib/qc"

export function QcTaskCard({ task, now }: { task: QcTask; now: number }) {
  const t = totals(task)
  const overdue = now > 0 && isOverdue(task, now)

  return (
    <Link
      href={`/tugas/?id=${task.id}`}
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="grid gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {task.brand}
              </p>
              <p className="truncate text-base font-semibold">{task.item}</p>
              <p className="text-sm text-muted-foreground">
                Warna {task.color} · Ukuran{" "}
                {task.sizes.map((s) => s.size).join(", ")}
              </p>
            </div>
            <ChevronRightIcon className="mt-1 size-5 shrink-0 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={task.status} />
            {overdue && <OverdueBadge />}
          </div>

          <div className="grid gap-1.5">
            <div className="flex justify-between text-sm tabular-nums">
              <span className="text-muted-foreground">
                Diperiksa {formatNumber(t.checked)} dari{" "}
                {formatNumber(t.target)}
              </span>
              <span className="font-medium">{t.percent}%</span>
            </div>
            <Progress value={t.percent} aria-label="Progres pemeriksaan" />
            <div className="flex gap-4 text-xs text-muted-foreground tabular-nums">
              <span>
                Lolos{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(t.passed)}
                </span>
              </span>
              <span>
                Defect{" "}
                <span className="font-medium text-foreground">
                  {formatNumber(t.defect)}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <ClockIcon className="size-4 text-muted-foreground" />
            {task.status === "selesai" && task.finishedAt ? (
              <span>Selesai pukul {formatTime(task.finishedAt)}</span>
            ) : (
              <span>
                Selesai paling lambat pukul{" "}
                <span className="font-medium">{formatTime(task.deadline)}</span>
                {now > 0 && (
                  <span
                    className={
                      overdue ? "text-destructive" : "text-muted-foreground"
                    }
                  >
                    {" "}
                    ({timeLeft(task.deadline, now)})
                  </span>
                )}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
